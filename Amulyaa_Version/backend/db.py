import json
import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).with_name('trustlens.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def dumps(value):
    return json.dumps(value, ensure_ascii=False)

def loads(value, default=None):
    if value is None:
        return default
    try:
        return json.loads(value)
    except Exception:
        return default

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('''CREATE TABLE IF NOT EXISTS recommendations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT, summary TEXT, severity TEXT, confidence_score INTEGER,
        confidence_label TEXT, confidence_reason TEXT, status TEXT,
        affected_count INTEGER, category TEXT, reasoning_steps TEXT, evidence TEXT,
        data_sources TEXT, limitations TEXT, alternatives TEXT, agent_flow TEXT,
        approve_impact TEXT, reject_impact TEXT, business_impact TEXT,
        security_impact TEXT, disruption_level TEXT, recommended_path TEXT
    )''')
    cur.execute('''CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT, actor TEXT, action TEXT, target TEXT, type TEXT,
        result TEXT, reason TEXT, message TEXT
    )''')
    cur.execute('''CREATE TABLE IF NOT EXISTS decisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recommendation_id INTEGER, action TEXT, actor TEXT, reason TEXT,
        timestamp TEXT, confirmed INTEGER
    )''')
    cur.execute('''CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)''')
    cur.execute('''CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT, what_happened TEXT, why TEXT, safeguard TEXT,
        human_decision TEXT, prevention TEXT
    )''')
    cur.execute('''CREATE TABLE IF NOT EXISTS usability_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant TEXT, comprehension INTEGER, decision_time TEXT, confusion TEXT, improvement TEXT
    )''')
    conn.commit(); conn.close()

def row_to_rec(row):
    d = dict(row)
    for key in ['reasoning_steps','evidence','data_sources','limitations','alternatives','agent_flow']:
        d[key] = loads(d.get(key), [])
    return d

def audit(actor, action, target, type_, result='Logged', reason='', message=''):
    conn = get_db()
    conn.execute('''INSERT INTO audit_logs(timestamp,actor,action,target,type,result,reason,message)
                    VALUES(?,?,?,?,?,?,?,?)''',
                 (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), actor, action, target, type_, result, reason, message))
    conn.commit(); conn.close()
