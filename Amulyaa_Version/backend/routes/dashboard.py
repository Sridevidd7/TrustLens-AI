import json
from flask import Blueprint, jsonify
from db import get_db

bp = Blueprint('dashboard', __name__, url_prefix='/api')


def parse_json_field(value):
    if not value:
        return []
    try:
        return json.loads(value)
    except (TypeError, ValueError):
        return []


@bp.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "TrustLens AI API"})


@bp.route('/dashboard', methods=['GET'])
def dashboard():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT COUNT(*) FROM recommendations')
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM recommendations WHERE status='Pending'")
    pending = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM recommendations WHERE severity IN ('Critical', 'High')")
    critical = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM decisions')
    decisions = cur.fetchone()[0]
    cur.execute("SELECT * FROM recommendations ORDER BY CASE severity WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, confidence_score DESC LIMIT 4")
    recs = cur.fetchall()
    conn.close()

    serialized_recommendations = []
    for row in recs:
        data = dict(row)
        for key in ["reasoning_steps", "evidence", "data_sources", "limitations", "alternatives", "agent_flow"]:
            data[key] = parse_json_field(data.get(key))
        serialized_recommendations.append(data)

    return jsonify({
        "total_recommendations": total,
        "pending_approval": pending,
        "critical_risks": critical,
        "decisions_logged": decisions,
        "recommendations": serialized_recommendations,
        "trust_score": 91,
        "transparency_score": 94,
        "activity_preview": [
            {
                "title": "Approval center updated",
                "detail": "3 recommendations require admin review",
                "time": "2m ago"
            },
            {
                "title": "Audit trail refreshed",
                "detail": "2 decisions logged in the last hour",
                "time": "12m ago"
            },
            {
                "title": "Simulator ready",
                "detail": "Decision impact scenarios are available",
                "time": "25m ago"
            }
        ]
    })


@bp.route('/incidents', methods=['GET'])
def incidents():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM incidents ORDER BY timestamp DESC')
    rows = cur.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


@bp.route('/usability', methods=['GET'])
def usability():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM usability_results ORDER BY id')
    rows = cur.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])
