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
    ('09:15:00', 'Alex Smith', 'Added human context', 'Enforce MFA for privileged accounts', 'Confirmed: break-glass accounts are excluded per CO-71 policy.', 'human_context'),
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
        # Human context notes — persisted per recommendation
        c.execute('''
            CREATE TABLE IF NOT EXISTS context_notes (
                id                INTEGER PRIMARY KEY AUTOINCREMENT,
                recommendation_id INTEGER NOT NULL,
                actor             TEXT NOT NULL,
                note              TEXT NOT NULL,
                created_at        TEXT NOT NULL,
                FOREIGN KEY (recommendation_id) REFERENCES recommendations(id)
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
    actor  = body.get('actor', 'Alex Smith')
    reason = body.get('reason', '')          # TC-AUD-009: capture rejection reason

    valid_statuses = ('Approved', 'Rejected', 'Pending', 'Needs approval', 'Ready to review', 'Draft')
    if status not in valid_statuses:
        return jsonify(error=f'Invalid status. Must be one of: {", ".join(valid_statuses)}'), 400

    with get_db() as c:
        row = c.execute('SELECT title FROM recommendations WHERE id=?', (rid,)).fetchone()
        if not row:
            return jsonify(error='Recommendation not found'), 404
        c.execute('UPDATE recommendations SET status=? WHERE id=?', (status, rid))

        # TC-AUD-009/015/016: store reason in result field when rejecting
        if status == 'Rejected' and reason:
            audit_result = f'Reason: {reason[:120]}'
            audit_type   = 'reject'
        elif status == 'Approved':
            audit_result = 'Decision recorded'
            audit_type   = 'approval'
        else:
            audit_result = 'Decision recorded'
            audit_type   = 'reject'

        c.execute(
            'INSERT INTO audit(time,actor,action,target,result,type) VALUES (?,?,?,?,?,?)',
            (now_str(), actor, f'{status} recommendation', row['title'], audit_result, audit_type)
        )
    return jsonify(ok=True, status=status)


@app.get('/api/audit')
def get_audit():
    """TC-AUD-012/013: dedicated audit log endpoint with pagination."""
    limit  = min(int(request.args.get('limit', 50)), 200)
    offset = int(request.args.get('offset', 0))
    with get_db() as c:
        rows = [dict(r) for r in c.execute(
            'SELECT time,actor,action,target,result,type FROM audit ORDER BY id DESC LIMIT ? OFFSET ?',
            (limit, offset)
        )]
        total = c.execute('SELECT COUNT(*) FROM audit').fetchone()[0]
    return jsonify(audit=rows, total=total, limit=limit, offset=offset)


@app.get('/api/courtroom/<int:rid>')
def courtroom(rid):
    with get_db() as c:
        row = c.execute('SELECT * FROM recommendations WHERE id=?', (rid,)).fetchone()
    if not row:
        return jsonify(error='Recommendation not found'), 404
    rec = decode_rec(row)
    evidence = rec['evidence']
    verdict = (
        f"Based on {len(evidence)} verified evidence point{'s' if len(evidence) != 1 else ''}, "
        f"TrustLens recommends immediate action on '{rec['title']}'. "
        f"The {rec['severity'].lower()} risk level and {rec['confidence']}% model confidence "
        f"support this recommendation, pending human approval."
    )
    return jsonify(
        recommendation=rec['title'],
        severity=rec['severity'],
        category=rec['category'],
        confidence=rec['confidence'],
        prosecution=evidence,
        defense=[
            rec['limitation'],
            'Human context and business justifications are not factored into the AI analysis.',
            'Recent environmental or organisational changes may not be reflected in real-time data.',
        ],
        verdict=verdict,
    )


@app.get('/api/simulate/<int:rid>')
def simulate(rid):
    with get_db() as c:
        row = c.execute('SELECT * FROM recommendations WHERE id=?', (rid,)).fetchone()
    if not row:
        return jsonify(error='Recommendation not found'), 404
    rec = decode_rec(row)

    # Derive realistic, per-recommendation values from actual data
    severity = rec['severity']
    confidence = rec['confidence']
    affected = rec['affected']

    # Risk reduction scales with confidence; rejection risk scales with severity
    severity_risk = {'Critical': 91, 'High': 78, 'Medium': 58, 'Low': 34}
    approve_reduction = confidence   # e.g. 94% confidence → 94% risk reduction claim
    reject_increase   = severity_risk.get(severity, 60)

    # Business impact for approval is Low for Critical/High (security wins),
    # Very Low for Medium/Low (minimal disruption expected)
    approve_biz_impact = 'Low' if severity in ('Critical', 'High') else 'Very Low'
    # Rejecting a Critical/High is High business risk; Medium → Medium; Low → Low
    reject_biz_impact  = {'Critical': 'High', 'High': 'High', 'Medium': 'Medium', 'Low': 'Low'}[severity]

    return jsonify(
        recommendation=rec['title'],
        severity=severity,
        category=rec['category'],
        confidence=confidence,
        affected=affected,
        approve={
            'risk_reduction':   f'{approve_reduction}%',
            'business_impact':  approve_biz_impact,
            'affected_resources': affected,
            'security_benefit': rec['impact'],
            'time_to_effect':   '24–48 hours after deployment',
        },
        reject={
            'risk_increase':    f'{reject_increase}%',
            'business_impact':  reject_biz_impact,
            'affected_resources': affected,
            'security_risk':    f'Threat remains unresolved across {affected} affected resource{"s" if affected != 1 else ""}.',
            'time_to_exposure': 'Immediate — threat is already active',
        },
    )


@app.get('/api/alternatives/<int:rid>')
def alternatives(rid):
    with get_db() as c:
        row = c.execute('SELECT severity, category, affected FROM recommendations WHERE id=?', (rid,)).fetchone()
    if not row:
        return jsonify(error='Recommendation not found'), 404

    severity = row['severity']
    category = row['category']
    affected = row['affected']

    # Per-category, per-severity alternatives — not hardcoded globals
    base = [
        {'action': 'Escalate to security analyst for manual review', 'risk': 'Very Low',
         'description': 'Route to a human expert before any automated action is taken.'},
    ]

    if category == 'Identity':
        base += [
            {'action': f'Apply policy to highest-risk {min(affected, 5)} accounts only',
             'risk': 'Low',
             'description': 'Staged rollout limits blast radius while still reducing exposure.'},
            {'action': 'Enable monitoring mode for 7 days before enforcement',
             'risk': 'Medium',
             'description': 'Collect additional telemetry to validate the recommendation before acting.'},
        ]
    elif category == 'Endpoints':
        base += [
            {'action': 'Deploy to pilot ring (10% of devices) first',
             'risk': 'Low',
             'description': 'Validate compatibility and rollback procedure before full deployment.'},
            {'action': 'Schedule maintenance window for off-hours deployment',
             'risk': 'Low',
             'description': 'Reduces user disruption while still addressing the vulnerability.'},
        ]
    elif category == 'Devices':
        base += [
            {'action': 'Tag devices for review instead of immediate retirement',
             'risk': 'Medium',
             'description': 'Confirm device status with asset owners before de-provisioning.'},
            {'action': 'Quarantine devices from network access pending investigation',
             'risk': 'Low',
             'description': 'Reduces exposure without permanent action until ownership is confirmed.'},
        ]
    else:
        base += [
            {'action': 'Monitor for 14 days before enforcing policy change', 'risk': 'Medium',
             'description': 'Extended observation period reduces false-positive risk.'},
            {'action': 'Implement partial control covering highest-severity items', 'risk': 'Low',
             'description': 'Prioritised rollout targeting the most critical subset first.'},
        ]

    # For Critical severity add an urgent option
    if severity == 'Critical':
        base.insert(0, {
            'action': 'Apply emergency change procedure (expedited approval)',
            'risk': 'Low',
            'description': 'Bypass standard change window given active exploit potential.',
        })

    return jsonify(alternatives=base)


@app.get('/api/context/<int:rid>')
def get_context(rid):
    """Return all human context notes for a recommendation, newest first."""
    with get_db() as c:
        row = c.execute('SELECT 1 FROM recommendations WHERE id=?', (rid,)).fetchone()
        if not row:
            return jsonify(error='Recommendation not found'), 404
        notes = [dict(r) for r in c.execute(
            'SELECT id, actor, note, created_at FROM context_notes '
            'WHERE recommendation_id=? ORDER BY id DESC',
            (rid,)
        )]
    return jsonify(notes=notes)


@app.post('/api/context/<int:rid>')
def save_context(rid):
    """Save a human context note, write to audit trail."""
    body  = request.get_json(silent=True) or {}
    note  = (body.get('note') or '').strip()
    actor = body.get('actor', 'Alex Smith')

    if not note:
        return jsonify(error='note is required'), 400

    with get_db() as c:
        row = c.execute('SELECT title FROM recommendations WHERE id=?', (rid,)).fetchone()
        if not row:
            return jsonify(error='Recommendation not found'), 404

        ts = datetime.now().strftime('%H:%M:%S')
        c.execute(
            'INSERT INTO context_notes(recommendation_id, actor, note, created_at) VALUES (?,?,?,?)',
            (rid, actor, note, ts)
        )
        note_id = c.execute('SELECT last_insert_rowid()').fetchone()[0]

        # Write to audit trail with type='human_context'
        c.execute(
            'INSERT INTO audit(time,actor,action,target,result,type) VALUES (?,?,?,?,?,?)',
            (ts, actor, 'Added human context', row['title'],
             note[:80] + ('…' if len(note) > 80 else ''), 'human_context')
        )

    return jsonify(ok=True, id=note_id, created_at=ts)


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
