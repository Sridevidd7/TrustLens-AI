from flask import Flask, jsonify, request
from flask_cors import CORS
import json, sqlite3
from pathlib import Path
from datetime import datetime

app = Flask(__name__)
CORS(app)
DB = Path(__file__).with_name('trustlens.db')

# Structured transparency metadata returned with each recommendation.
EXTRAS = {
    1: {'why': 'Privileged accounts have elevated blast radius and the current controls do not meet the phishing-resistant authentication baseline.', 'weaknesses': ['Break-glass accounts are intentionally excluded', 'Location anomalies can include legitimate travel'], 'confidenceFactors': ['96% tenant data completeness', '91% agreement across three agents', 'Strong NIST policy match'], 'alternatives': [
        {'name': 'Enforce phishing-resistant MFA', 'confidence': 94, 'reason': 'Best reduction in takeover risk with a controlled rollout.', 'selected': True},
        {'name': 'Require standard push MFA', 'confidence': 71, 'reason': 'Rejected because push fatigue remains exploitable.'},
        {'name': 'Monitor privileged sign-ins only', 'confidence': 43, 'reason': 'Rejected because monitoring does not prevent compromise.'}]},
    2: {'why': 'Actively exploited vulnerabilities were correlated across Defender, Intune inventory, and the CISA KEV catalog.', 'weaknesses': ['Five devices have stale telemetry', 'Pilot compatibility may not cover every legacy app'], 'confidenceFactors': ['93% endpoint telemetry coverage', '89% threat-source agreement', 'Successful pilot deployment'], 'alternatives': [
        {'name': 'Staged security update rollout', 'confidence': 89, 'reason': 'Balances rapid remediation with application safety.', 'selected': True},
        {'name': 'Immediate broad deployment', 'confidence': 68, 'reason': 'Rejected due to business continuity risk.'},
        {'name': 'Isolate vulnerable devices', 'confidence': 57, 'reason': 'Rejected as too disruptive for all affected users.'}]},
    3: {'why': 'Guest identities retain access despite prolonged inactivity, creating unnecessary standing privilege.', 'weaknesses': ['Activity outside Microsoft 365 is not visible'], 'confidenceFactors': ['Complete directory audit', 'Two-agent agreement', '90-day policy match'], 'alternatives': [
        {'name': 'Revoke inactive guest access', 'confidence': 82, 'reason': 'Best balance of security and reversibility.', 'selected': True},
        {'name': 'Ask sponsors to re-attest', 'confidence': 70, 'reason': 'Rejected because it delays risk reduction.'},
        {'name': 'Shorten guest session lifetime', 'confidence': 48, 'reason': 'Rejected because stale access remains assigned.'}]},
    4: {'why': 'Long-inactive device objects reduce inventory accuracy and can distort compliance reporting.', 'weaknesses': ['Offline warehouse devices may be misclassified'], 'confidenceFactors': ['Single authoritative inventory', '120-day inactivity threshold'], 'alternatives': [
        {'name': 'Retire inactive device records', 'confidence': 76, 'reason': 'Improves reporting with a recoverable action.', 'selected': True},
        {'name': 'Tag records for manual review', 'confidence': 63, 'reason': 'Rejected because it preserves inventory noise.'},
        {'name': 'Delete records permanently', 'confidence': 35, 'reason': 'Rejected because the action is difficult to reverse.'}]}
}

RECOMMENDATIONS = [
    (1,'Enforce MFA for privileged accounts','12 administrator accounts are not covered by a phishing-resistant MFA policy.','Critical',94,'Needs approval','Identity',12,'8 min ago','High',json.dumps(['Microsoft Entra ID sign-in logs','Conditional Access policies','NIST SP 800-63B']),'2 break-glass accounts were excluded from the analysis.','Reduces account takeover risk across privileged roles.',json.dumps(['12 of 18 privileged accounts lack phishing-resistant MFA','3 accounts showed sign-ins from unfamiliar locations','Current policy allows SMS as a fallback method']),json.dumps(['Identity Analyst','Policy Validator','Risk Assessor'])),
    (2,'Patch critical Windows vulnerabilities','Deploy the June security baseline to 38 devices with actively exploited CVEs.','High',89,'Needs approval','Endpoints',38,'21 min ago','High',json.dumps(['Microsoft Defender Vulnerability Management','Intune device inventory','CISA KEV catalog']),'Five devices have not checked in for more than 48 hours.','Closes 4 known exploited vulnerabilities.',json.dumps(['CVE-2026-31201 detected on 31 devices','38 devices missed the latest quality update','Pilot ring completed with 99.2% app compatibility']),json.dumps(['Endpoint Scanner','Threat Correlator','Deployment Planner'])),
    (3,'Remove stale guest access','Revoke access for 24 guest identities inactive for more than 90 days.','Medium',82,'Ready to review','Identity',24,'1 hr ago','Medium',json.dumps(['Entra ID directory audit','Teams activity data']),'External activity outside Microsoft 365 is not visible.','Reduces standing external access and license exposure.',json.dumps(['24 guests inactive for 90+ days','7 guests retain access to confidential groups']),json.dumps(['Identity Analyst','Access Reviewer'])),
    (4,'Optimize inactive device cleanup','Retire 61 devices that have not checked in for 120 days.','Low',76,'Draft','Devices',61,'3 hr ago','Low',json.dumps(['Intune managed device inventory']),'Offline warehouse devices may be incorrectly classified.','Improves inventory accuracy and reporting.',json.dumps(['61 devices exceed the cleanup threshold']),json.dumps(['Inventory Agent']))
]

def db():
    conn=sqlite3.connect(DB); conn.row_factory=sqlite3.Row; return conn

def init_db():
    with db() as c:
        c.execute('CREATE TABLE IF NOT EXISTS recommendations (id INTEGER PRIMARY KEY,title TEXT,summary TEXT,severity TEXT,confidence INTEGER,status TEXT,category TEXT,affected INTEGER,time TEXT,risk TEXT,sources TEXT,limitation TEXT,impact TEXT,evidence TEXT,agents TEXT)')
        c.execute('CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT,time TEXT,actor TEXT,action TEXT,target TEXT,result TEXT,type TEXT,reason TEXT DEFAULT "")')
        if 'reason' not in [x['name'] for x in c.execute('PRAGMA table_info(audit)')]:
            c.execute('ALTER TABLE audit ADD COLUMN reason TEXT DEFAULT ""')
        if not c.execute('SELECT 1 FROM recommendations LIMIT 1').fetchone(): c.executemany('INSERT INTO recommendations VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',RECOMMENDATIONS)
        if not c.execute('SELECT 1 FROM audit LIMIT 1').fetchone():
            c.executemany('INSERT INTO audit(time,actor,action,target,result,type,reason) VALUES (?,?,?,?,?,?,?)',[
                ('10:42:18','Priya Sharma','Approved recommendation','Block legacy authentication','Success','approval',''),
                ('10:31:04','TrustLens AI','Generated recommendation','Enforce MFA for privileged accounts','Pending review','ai',''),
                ('10:29:51','Risk Assessor','Raised confidence score','Patch critical Windows vulnerabilities','89%','ai',''),
                ('09:58:22','Marcus Chen','Rejected recommendation','Disable removable storage','Reason recorded','reject','Blocked pending replacement media-control policy.'),
                ('09:44:10','System','Data source synchronized','Microsoft Intune','1,842 records','system',''),
                ('09:32:44','Elena Rossi','Modified deployment scope','Browser security baseline','Pilot group only','edit','')])
        c.execute('UPDATE audit SET reason=? WHERE type=? AND target=? AND result=? AND COALESCE(reason,"")=""',('Blocked pending replacement media-control policy.','reject','Disable removable storage','Reason recorded'))

def decode(row):
    x=dict(row)
    for k in ('sources','evidence','agents'): x[k]=json.loads(x[k])
    x.update(EXTRAS.get(x['id'], {}))
    return x

@app.get('/api/dashboard')
def dashboard():
    with db() as c:
        recs=[decode(x) for x in c.execute('SELECT * FROM recommendations ORDER BY id')]
        audit=[dict(x) for x in c.execute('SELECT id,time,actor,action,target,result,type,reason FROM audit ORDER BY id DESC LIMIT 50')]
    return jsonify(stats={
        'open':sum(r['status'] not in ('Approved','Rejected') for r in recs),
        'highConfidence':sum(r['confidence'] >= 85 for r in recs),
        'awaiting':sum(r['status'] not in ('Approved','Rejected') for r in recs),
        'automated':142
    },recommendations=recs,audit=audit)

@app.post('/api/recommendations/<int:rid>/decision')
def decision(rid):
    payload=request.get_json(silent=True) or {}
    status=payload.get('status','Pending'); actor=payload.get('actor','Alex Smith'); reason=payload.get('reason','').strip()
    if status == 'Rejected' and not reason:
        return jsonify(error='A rejection reason is required'),400
    with db() as c:
        row=c.execute('SELECT title FROM recommendations WHERE id=?',(rid,)).fetchone()
        if not row: return jsonify(error='Not found'),404
        c.execute('UPDATE recommendations SET status=? WHERE id=?',(status,rid))
        c.execute('INSERT INTO audit(time,actor,action,target,result,type,reason) VALUES (?,?,?,?,?,?,?)',(datetime.now().strftime('%H:%M:%S'),actor,f'{status} recommendation',row['title'],'Decision recorded','approval' if status=='Approved' else 'reject',reason))
    return jsonify(ok=True,status=status,reason=reason)

@app.post('/api/recommendations/<int:rid>/escalate')
def escalate(rid):
    payload=request.get_json(silent=True) or {}
    reviewer=payload.get('reviewer','').strip(); reason=payload.get('reason','').strip()
    if not reviewer or not reason:
        return jsonify(error='Reviewer and escalation reason are required'),400
    with db() as c:
        row=c.execute('SELECT title FROM recommendations WHERE id=?',(rid,)).fetchone()
        if not row: return jsonify(error='Not found'),404
        c.execute('UPDATE recommendations SET status=? WHERE id=?',('Escalated',rid))
        c.execute('INSERT INTO audit(time,actor,action,target,result,type,reason) VALUES (?,?,?,?,?,?,?)',(datetime.now().strftime('%H:%M:%S'),'Alex Smith','Escalated to human review',row['title'],f'Reviewer: {reviewer}','escalation',reason))
    return jsonify(ok=True,status='Escalated',reviewer=reviewer,reason=reason)

if __name__ == '__main__':
    init_db(); app.run(debug=True,port=5000)
