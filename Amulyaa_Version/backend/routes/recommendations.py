import json
from flask import Blueprint, jsonify, request
from db import get_db

bp = Blueprint('recommendations', __name__, url_prefix='/api')


def row_to_dict(row):
    data = dict(row)
    for key in ["reasoning_steps", "evidence", "data_sources", "limitations", "alternatives", "agent_flow"]:
        if data.get(key):
            try:
                data[key] = json.loads(data[key])
            except (TypeError, ValueError):
                data[key] = []
    return data


@bp.route('/recommendations', methods=['GET'])
def list_recommendations():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM recommendations ORDER BY id')
    rows = cur.fetchall()
    conn.close()
    return jsonify([row_to_dict(row) for row in rows])


@bp.route('/recommendations/<int:rec_id>', methods=['GET'])
def get_recommendation(rec_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM recommendations WHERE id = ?', (rec_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Recommendation not found"}), 404
    return jsonify(row_to_dict(row))


@bp.route('/recommendations/<int:rec_id>/explanation', methods=['GET'])
def recommendation_explanation(rec_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM recommendations WHERE id = ?', (rec_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Recommendation not found"}), 404
    data = row_to_dict(row)
    return jsonify({
        "why": data["confidence_reason"],
        "reasoning_steps": data["reasoning_steps"],
        "evidence": data["evidence"],
        "limitations": data["limitations"]
    })


@bp.route('/recommendations/<int:rec_id>/alternatives', methods=['GET'])
def recommendation_alternatives(rec_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM recommendations WHERE id = ?', (rec_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Recommendation not found"}), 404
    data = row_to_dict(row)
    return jsonify({"alternatives": data["alternatives"]})


@bp.route('/recommendations/<int:rec_id>/simulate', methods=['GET'])
def simulate_recommendation(rec_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM recommendations WHERE id = ?', (rec_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Recommendation not found"}), 404
    data = row_to_dict(row)
    return jsonify({
        "title": data["title"],
        "if_approved": data["approve_impact"],
        "if_rejected": data["reject_impact"],
        "security_impact": data["security_impact"],
        "business_impact": data["business_impact"],
        "disruption_level": data["disruption_level"],
        "recommended_path": data["recommended_path"]
    })


@bp.route('/recommendations/<int:rec_id>/agent-flow', methods=['GET'])
def agent_flow(rec_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM recommendations WHERE id = ?', (rec_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Recommendation not found"}), 404
    data = row_to_dict(row)
    return jsonify({"agent_flow": data["agent_flow"]})


@bp.route('/recommendations/<int:rec_id>/decision', methods=['POST'])
def post_decision(rec_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    action = data.get('action')
    actor = data.get('actor')
    reason = data.get('reason')
    confirmed = data.get('confirmed', False)

    if action not in ('approve', 'reject', 'override'):
        return jsonify({"error": "Action must be approve, reject, or override"}), 400

    if action == 'reject' and not reason:
        return jsonify({"error": "Reject requires a reason"}), 400
    if action == 'override' and not reason:
        return jsonify({"error": "Override requires a reason"}), 400
    if not actor:
        return jsonify({"error": "Actor is required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT severity, status FROM recommendations WHERE id = ?', (rec_id,))
    rec = cur.fetchone()
    if not rec:
        conn.close()
        return jsonify({"error": "Recommendation not found"}), 404

    severity = rec['severity']
    if action == 'approve' and severity in ('High', 'Critical') and not confirmed:
        conn.close()
        return jsonify({"error": "High or critical recommendations require confirmation"}), 400

    new_status = 'Approved' if action == 'approve' else 'Rejected'
    if action == 'override':
        new_status = 'Escalated'

    cur.execute('UPDATE recommendations SET status = ? WHERE id = ?', (new_status, rec_id))
    cur.execute(
        'INSERT INTO decisions (recommendation_id, action, reason, actor, confirmed, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        (rec_id, action, reason, actor, 1 if confirmed else 0)
    )
    cur.execute(
        'INSERT INTO audit_logs (recommendation_id, actor, action, target, reason, result) VALUES (?, ?, ?, ?, ?, ?)',
        (rec_id, actor, action, 'Recommendation', reason or 'No reason provided', new_status)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "status": new_status})


@bp.route('/recommendations/<int:rec_id>/escalate', methods=['POST'])
def escalate_recommendation(rec_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    reviewer = data.get('reviewer')
    reason = data.get('reason')
    actor = data.get('actor', reviewer)
    if not reviewer or not reason:
        return jsonify({"error": "Reviewer and reason are required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT id FROM recommendations WHERE id = ?', (rec_id,))
    if not cur.fetchone():
        conn.close()
        return jsonify({"error": "Recommendation not found"}), 404

    cur.execute('UPDATE recommendations SET status = ? WHERE id = ?', ('Escalated', rec_id))
    cur.execute(
        'INSERT INTO audit_logs (recommendation_id, actor, action, target, reason, result) VALUES (?, ?, ?, ?, ?, ?)',
        (rec_id, actor, 'Escalation', 'Recommendation', reason, 'Escalated')
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "status": "Escalated"})
