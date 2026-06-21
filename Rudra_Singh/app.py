import os
import json
import sqlite3
from pathlib import Path
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# ---------------------------------------------------------------------------
# CORS — restrict to localhost in dev; set ALLOWED_ORIGIN env var in prod
# ---------------------------------------------------------------------------
allowed_origin = os.environ.get('ALLOWED_ORIGIN', 'http://localhost:5173')
CORS(app, origins=[allowed_origin])

DB = Path(__file__).with_name('trustlens.db')

# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------
RECOMMENDATIONS = [
    (1, 'Enforce MFA for privileged accounts',
     '12 administrator accounts are not covered by a phishing-resistant MFA policy.',
     'Critical', 94, 'Needs approval', 'Identity', 12, '8 min ago', 'High',
     json.dumps(['Microsoft Entra ID sign-in logs', 'Conditional Access policies', 'NIST SP 800-63B']),
     '2 break-glass accounts were excluded from the analysis.',
     'Reduces account takeover risk across privileged roles.',
     json.dumps(['12 of 18 privileged accounts lack phishing-resistant MFA',
                 '3 accounts showed sign-ins from unfamiliar locations',
                 'Current policy allows SMS as a fallback method']),
     json.dumps(['Identity Analyst', 'Policy Validator', 'Risk Assessor'])),

    (2, 'Patch critical Windows vulnerabilities',
     'Deploy the June security baseline to 38 devices with actively exploited CVEs.',
     'High', 89, 'Needs approval', 'Endpoints', 38, '21 min ago', 'High',
     json.dumps(['Microsoft Defender Vulnerability Management', 'Intune device inventory', 'CISA KEV catalog']),
     'Five devices have not checked in for more than 48 hours.',
     'Closes 4 known exploited vulnerabilities.',
     json.dumps(['CVE-2026-31201 detected on 31 devices',
                 '38 devices missed the latest quality update',
                 'Pilot ring completed with 99.2% app compatibility']),
     json.dumps(['Endpoint Scanner', 'Threat Correlator', 'Deployment Planner'])),

    (3, 'Remove stale guest access',
     'Revoke access for 24 guest identities inactive for more than 90 days.',
     'Medium', 82, 'Ready to review', 'Identity', 24, '1 hr ago', 'Medium',
     json.dumps(['Entra ID directory audit', 'Teams activity data']),
     'External activity outside Microsoft 365 is not visible.',
     'Reduces standing external access and license exposure.',
     json.dumps(['24 guests inactive for 90+ days',
                 '7 guests retain access to confidential groups']),
     json.dumps(['Identity Analyst', 'Access Reviewer'])),

    (4, 'Optimize inactive device cleanup',
     'Retire 61 devices that have not checked in for 120 days.',
     'Low', 76, 'Draft', 'Devices', 61, '3 hr ago', 'Low',
     json.dumps(['Intune managed device inventory']),
     'Offline warehouse devices may be incorrectly classified.',
     'Improves inventory accuracy and reporting.',
     json.dumps(['61 devices exceed the cleanup threshold']),
     json.dumps(['Inventory Agent'])),
]

AUDIT_SEED = [
    ('10:42:18', 'Priya Sharma', 'Approved recommendation', 'Block legacy authentication', 'Success', 'approval'),
    ('10:31:04', 'TrustLens AI', 'Generated recommendation', 'Enforce MFA for privileged accounts', 'Pending review', 'ai'),
    ('10:29:51', 'Risk Assessor', 'Raised confidence score', 'Patch critical Windows vulnerabilities', '89%', 'ai'),
    ('09:58:22', 'Marcus Chen', 'Rejected recommendation', 'Disable removable storage', 'Reason recorded', 'reject'),
    ('09:44:10', 'System', 'Data source synchronized', 'Microsoft Intune', '1,842 records', 'system'),
    ('09:32:44', 'Elena Rossi', 'Modified deployment scope', 'Browser security baseline', 'Pilot group only', 'edit'),
]

# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------
def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as c:
        c.execute('''
            CREATE TABLE IF NOT EXISTS recommendations (
                id        INTEGER PRIMARY KEY,
                title     TEXT,
                summary   TEXT,
                severity  TEXT,
                confidence INTEGER,
                status    TEXT,
                category  TEXT,
                affected  INTEGER,
                time      TEXT,
                risk      TEXT,
                sources   TEXT,
                limitation TEXT,
                impact    TEXT,
                evidence  TEXT,
                agents    TEXT
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS audit (
                id     INTEGER PRIMARY KEY AUTOINCREMENT,
                time   TEXT,
                actor  TEXT,
                action TEXT,
                target TEXT,
                result TEXT,
                type   TEXT
            )
        ''')
        if not c.execute('SELECT 1 FROM recommendations LIMIT 1').fetchone():
            c.executemany('INSERT INTO recommendations VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', RECOMMENDATIONS)
        if not c.execute('SELECT 1 FROM audit LIMIT 1').fetchone():
            c.executemany(
                'INSERT INTO audit(time,actor,action,target,result,type) VALUES (?,?,?,?,?,?)',
                AUDIT_SEED
            )


def decode_rec(row):
    """Convert a DB row to a dict, parsing JSON fields."""
    x = dict(row)
    for k in ('sources', 'evidence', 'agents'):
        x[k] = json.loads(x[k])
    return x


def now_str():
    return datetime.now().strftime('%H:%M:%S')


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get('/')
def home():
    return jsonify(message='TrustLens AI backend is running.', status='OK')


@app.get('/api/dashboard')
def dashboard():
    with get_db() as c:
        recs = [decode_rec(r) for r in c.execute('SELECT * FROM recommendations ORDER BY id')]
        audit = [dict(r) for r in c.execute(
            'SELECT time,actor,action,target,result,type FROM audit ORDER BY id DESC LIMIT 20'
        )]
    awaiting = sum(r['status'] not in ('Approved', 'Rejected') for r in recs)
    return jsonify(
        stats={'open': 7, 'highConfidence': 18, 'awaiting': awaiting, 'automated': 142},
        recommendations=recs,
        audit=audit,
    )


@app.get('/api/recommendations/<int:rid>')
def get_recommendation(rid):
    with get_db() as c:
        row = c.execute('SELECT * FROM recommendations WHERE id=?', (rid,)).fetchone()
    if not row:
        return jsonify(error='Recommendation not found'), 404
    return jsonify(decode_rec(row))


@app.post('/api/recommendations/<int:rid>/decision')
def decision(rid):
    body = request.get_json(silent=True) or {}
    status = body.get('status', 'Pending')
    actor = body.get('actor', 'Alex Smith')

    valid_statuses = ('Approved', 'Rejected', 'Pending', 'Needs approval', 'Ready to review', 'Draft')
    if status not in valid_statuses:
        return jsonify(error=f'Invalid status. Must be one of: {", ".join(valid_statuses)}'), 400

    with get_db() as c:
        row = c.execute('SELECT title FROM recommendations WHERE id=?', (rid,)).fetchone()
        if not row:
            return jsonify(error='Recommendation not found'), 404
        c.execute('UPDATE recommendations SET status=? WHERE id=?', (status, rid))
        c.execute(
            'INSERT INTO audit(time,actor,action,target,result,type) VALUES (?,?,?,?,?,?)',
            (now_str(), actor, f'{status} recommendation', row['title'],
             'Decision recorded', 'approval' if status == 'Approved' else 'reject')
        )
    return jsonify(ok=True, status=status)


@app.get('/api/courtroom/<int:rid>')
def courtroom(rid):
    with get_db() as c:
        row = c.execute('SELECT * FROM recommendations WHERE id=?', (rid,)).fetchone()
    if not row:
        return jsonify(error='Recommendation not found'), 404
    rec = decode_rec(row)
    return jsonify(
        recommendation=rec['title'],
        prosecution=rec['evidence'],
        defense=[
            rec['limitation'],
            'Human context may not be fully available to the model.',
            'Recent environmental changes may affect risk assessment.',
        ],
        verdict=rec['title'],
        confidence=rec['confidence'],
    )


@app.get('/api/simulate/<int:rid>')
def simulate(rid):
    with get_db() as c:
        row = c.execute('SELECT * FROM recommendations WHERE id=?', (rid,)).fetchone()
    if not row:
        return jsonify(error='Recommendation not found'), 404
    rec = decode_rec(row)
    return jsonify(
        recommendation=rec['title'],
        approve={
            'risk_reduction': '82%',
            'business_impact': 'Low',
            'security_benefit': rec['impact'],
        },
        reject={
            'risk_increase': '63%',
            'business_impact': 'High',
            'security_risk': 'Threat remains unresolved',
        },
    )


@app.get('/api/alternatives/<int:rid>')
def alternatives(rid):
    # rid is accepted for future per-recommendation logic
    return jsonify(alternatives=[
        {'action': 'Monitor for 7 days', 'risk': 'Medium'},
        {'action': 'Pilot deployment', 'risk': 'Low'},
        {'action': 'Escalate to security analyst', 'risk': 'Very Low'},
    ])


@app.post('/api/escalate/<int:rid>')
def escalate(rid):
    body = request.get_json(silent=True) or {}
    actor = body.get('actor', 'Security Administrator')
    with get_db() as c:
        row = c.execute('SELECT title FROM recommendations WHERE id=?', (rid,)).fetchone()
        if not row:
            return jsonify(error='Recommendation not found'), 404
        c.execute(
            'INSERT INTO audit(time,actor,action,target,result,type) VALUES (?,?,?,?,?,?)',
            (now_str(), actor, 'Escalated recommendation', row['title'], 'Sent for human review', 'escalation')
        )
    return jsonify(success=True, message='Recommendation escalated for human review.')


@app.get('/api/agent-flow/<int:rid>')
def agent_flow(rid):
    with get_db() as c:
        row = c.execute('SELECT agents FROM recommendations WHERE id=?', (rid,)).fetchone()
    if not row:
        return jsonify(error='Recommendation not found'), 404
    return jsonify(agents=json.loads(row['agents']))


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
