from flask import Flask, jsonify, request
from flask_cors import CORS
from db import init_db, get_db, row_to_rec, audit
from seed import seed

app = Flask(__name__)
CORS(app)
init_db()
seed()

@app.get('/api/health')
def health():
    return jsonify(status='ok', service='TrustLens AI backend', port=5001)

@app.get('/api/dashboard')
def dashboard():
    conn=get_db()
    rows=conn.execute('SELECT * FROM recommendations ORDER BY CASE severity WHEN "Critical" THEN 1 WHEN "High" THEN 2 WHEN "Medium" THEN 3 ELSE 4 END').fetchall()
    recs=[row_to_rec(r) for r in rows]
    logs=conn.execute('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 4').fetchall()
    decisions=conn.execute('SELECT COUNT(*) c FROM decisions').fetchone()['c']
    conn.close()
    return jsonify(
        trust_score=96,
        stats=dict(total=len(recs), pending=sum(1 for r in recs if r['status']=='Pending'), critical=sum(1 for r in recs if r['severity']=='Critical'), decisions=decisions),
        recommendations=recs,
        recent_activity=[dict(action=l['action'], time=l['timestamp'], detail=l['message']) for l in logs]
    )

@app.get('/api/recommendations')
def recommendations():
    conn=get_db(); rows=conn.execute('SELECT * FROM recommendations ORDER BY id').fetchall(); conn.close()
    return jsonify(recommendations=[row_to_rec(r) for r in rows])

@app.get('/api/recommendations/<int:rid>')
def recommendation(rid):
    conn=get_db(); row=conn.execute('SELECT * FROM recommendations WHERE id=?',(rid,)).fetchone(); conn.close()
    if not row: return jsonify(error='Recommendation not found'),404
    return jsonify(row_to_rec(row))

@app.get('/api/recommendations/<int:rid>/explanation')
def explanation(rid):
    conn=get_db(); row=conn.execute('SELECT * FROM recommendations WHERE id=?',(rid,)).fetchone(); conn.close()
    if not row: return jsonify(error='Recommendation not found'),404
    r=row_to_rec(row)
    return jsonify(reasoning_steps=r['reasoning_steps'], confidence_reason=r['confidence_reason'], evidence=r['evidence'], data_sources=r['data_sources'], limitations=r['limitations'])

@app.get('/api/recommendations/<int:rid>/alternatives')
def alternatives(rid):
    conn=get_db(); row=conn.execute('SELECT alternatives FROM recommendations WHERE id=?',(rid,)).fetchone(); conn.close()
    if not row: return jsonify(error='Recommendation not found'),404
    import json
    return jsonify(alternatives=json.loads(row['alternatives']))

@app.get('/api/recommendations/<int:rid>/simulate')
def simulate(rid):
    conn=get_db(); row=conn.execute('SELECT * FROM recommendations WHERE id=?',(rid,)).fetchone(); conn.close()
    if not row: return jsonify(error='Recommendation not found'),404
    r=row_to_rec(row)
    return jsonify(approve_impact=r['approve_impact'], reject_impact=r['reject_impact'], business_impact=r['business_impact'], security_impact=r['security_impact'], disruption_level=r['disruption_level'], recommended_path=r['recommended_path'])

@app.get('/api/recommendations/<int:rid>/agent-flow')
def agent_flow(rid):
    conn=get_db(); row=conn.execute('SELECT * FROM recommendations WHERE id=?',(rid,)).fetchone(); conn.close()
    if not row: return jsonify(error='Recommendation not found'),404
    return jsonify(agent_flow=row_to_rec(row)['agent_flow'])

@app.post('/api/recommendations/<int:rid>/decision')
def decision(rid):
    data=request.get_json() or {}
    action=(data.get('action') or '').lower()
    reason=(data.get('reason') or '').strip()
    actor=data.get('actor') or 'IT Admin'
    confirmed=bool(data.get('confirmed'))
    if action not in ['approve','reject','override']:
        return jsonify(error='Action must be approve, reject, or override'),400
    conn=get_db(); row=conn.execute('SELECT * FROM recommendations WHERE id=?',(rid,)).fetchone()
    if not row: conn.close(); return jsonify(error='Recommendation not found'),404
    r=row_to_rec(row)
    if action=='approve' and r['severity'] in ['High','Critical'] and not confirmed:
        conn.close(); return jsonify(error='High-impact actions require explicit confirmation'),400
    if action in ['reject','override'] and not reason:
        conn.close(); return jsonify(error='Reason is required for reject or override'),400
    status={'approve':'Approved','reject':'Rejected','override':'Overridden'}[action]
    conn.execute('UPDATE recommendations SET status=? WHERE id=?',(status,rid))
    conn.execute('INSERT INTO decisions(recommendation_id,action,actor,reason,timestamp,confirmed) VALUES(?,?,?,?,datetime("now"),?)',(rid,action,actor,reason,int(confirmed)))
    conn.commit(); conn.close()
    type_map={'approve':'Approval','reject':'Rejection','override':'Override'}
    audit(actor, status, r['title'], type_map[action], 'Completed', reason, f'{actor} {status.lower()} recommendation: {r["title"]}.')
    return jsonify(message='Decision saved', status=status)

@app.post('/api/recommendations/<int:rid>/escalate')
def escalate(rid):
    data=request.get_json() or {}; reviewer=(data.get('reviewer') or '').strip(); reason=(data.get('reason') or '').strip(); actor=data.get('actor') or 'IT Admin'
    if not reviewer or not reason: return jsonify(error='Reviewer and reason are required'),400
    conn=get_db(); row=conn.execute('SELECT title FROM recommendations WHERE id=?',(rid,)).fetchone()
    if not row: conn.close(); return jsonify(error='Recommendation not found'),404
    conn.execute('UPDATE recommendations SET status=? WHERE id=?',('Escalated',rid)); conn.commit(); conn.close()
    audit(actor, 'Escalated recommendation', row['title'], 'Escalation', f'Sent to {reviewer}', reason, f'{actor} escalated {row["title"]} to {reviewer}.')
    return jsonify(message='Escalation saved', status='Escalated')

@app.get('/api/audit')
def audit_logs():
    conn=get_db(); rows=conn.execute('SELECT * FROM audit_logs ORDER BY id DESC').fetchall(); conn.close()
    return jsonify(logs=[dict(r) for r in rows])

@app.get('/api/settings/autonomy')
def get_autonomy():
    conn=get_db(); row=conn.execute('SELECT value FROM settings WHERE key="autonomy"').fetchone(); conn.close()
    return jsonify(mode=row['value'] if row else 'Always ask me')

@app.post('/api/settings/autonomy')
def set_autonomy():
    mode=(request.get_json() or {}).get('mode','Always ask me')
    conn=get_db(); conn.execute('INSERT OR REPLACE INTO settings(key,value) VALUES("autonomy",?)',(mode,)); conn.commit(); conn.close()
    audit('Amulyaa Admin','Updated autonomy dial','Settings','System','Saved','',f'Autonomy mode changed to {mode}.')
    return jsonify(mode=mode)

@app.get('/api/incidents')
def incidents():
    conn=get_db(); rows=conn.execute('SELECT * FROM incidents').fetchall(); conn.close()
    return jsonify(incidents=[dict(r) for r in rows])

@app.get('/api/usability')
def usability():
    conn=get_db(); rows=conn.execute('SELECT * FROM usability_results').fetchall(); conn.close()
    vals=[dict(r) for r in rows]
    avg=round(sum(v['comprehension'] for v in vals)/len(vals)) if vals else 0
    return jsonify(participants=len(vals), comprehension_score=avg, avg_decision_time='1m 37s', confusion_points=[v['confusion'] for v in vals], improvements=[v['improvement'] for v in vals], results=vals)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
