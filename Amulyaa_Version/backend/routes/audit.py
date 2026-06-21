from flask import Blueprint, jsonify, request
from db import get_db

bp = Blueprint('audit', __name__, url_prefix='/api')


@bp.route('/audit', methods=['GET'])
def get_audit():
    conn = get_db()
    cur = conn.cursor()
    query = 'SELECT * FROM audit_logs ORDER BY timestamp DESC'
    cur.execute(query)
    rows = cur.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])
