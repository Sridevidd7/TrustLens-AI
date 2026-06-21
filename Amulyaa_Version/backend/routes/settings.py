from flask import Blueprint, jsonify, request
from db import get_db

bp = Blueprint('settings', __name__, url_prefix='/api')


@bp.route('/settings/autonomy', methods=['GET'])
def get_autonomy():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT autonomy FROM settings WHERE id = 1')
    row = cur.fetchone()
    conn.close()
    return jsonify({"autonomy": row[0] if row else 'Always ask me'})


@bp.route('/settings/autonomy', methods=['POST'])
def set_autonomy():
    data = request.get_json()
    if not data or 'autonomy' not in data:
        return jsonify({"error": "autonomy is required"}), 400
    autonomy = data['autonomy']
    conn = get_db()
    cur = conn.cursor()
    cur.execute('UPDATE settings SET autonomy = ? WHERE id = 1', (autonomy,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "autonomy": autonomy})
