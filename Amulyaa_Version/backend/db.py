import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "trustlens.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.executescript(
        """
        CREATE TABLE IF NOT EXISTS recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            summary TEXT NOT NULL,
            severity TEXT NOT NULL,
            confidence_score INTEGER NOT NULL,
            confidence_label TEXT NOT NULL,
            confidence_reason TEXT NOT NULL,
            status TEXT NOT NULL,
            affected_count INTEGER NOT NULL,
            category TEXT NOT NULL,
            reasoning_steps TEXT NOT NULL,
            evidence TEXT NOT NULL,
            data_sources TEXT NOT NULL,
            limitations TEXT NOT NULL,
            alternatives TEXT NOT NULL,
            agent_flow TEXT NOT NULL,
            approve_impact TEXT NOT NULL,
            reject_impact TEXT NOT NULL,
            business_impact TEXT NOT NULL,
            security_impact TEXT NOT NULL,
            disruption_level TEXT NOT NULL,
            recommended_path TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recommendation_id INTEGER,
            actor TEXT NOT NULL,
            action TEXT NOT NULL,
            target TEXT NOT NULL,
            reason TEXT,
            result TEXT NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recommendation_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            reason TEXT,
            actor TEXT NOT NULL,
            confirmed INTEGER DEFAULT 0,
            reviewer TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            autonomy TEXT NOT NULL DEFAULT 'Always ask me'
        );

        CREATE TABLE IF NOT EXISTS incidents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            happened TEXT NOT NULL,
            why TEXT NOT NULL,
            safeguard TEXT NOT NULL,
            human_decision TEXT NOT NULL,
            prevention TEXT NOT NULL,
            severity TEXT NOT NULL,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS usability_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            participant TEXT NOT NULL,
            comprehension_score INTEGER NOT NULL,
            time_to_decision TEXT NOT NULL,
            confusion_points TEXT NOT NULL,
            design_improvements TEXT NOT NULL
        );
        """
    )
    conn.commit()
    conn.close()


def insert_default_settings():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM settings")
    count = cur.fetchone()[0]
    if count == 0:
        cur.execute("INSERT INTO settings (id, autonomy) VALUES (1, 'Always ask me')")
    conn.commit()
    conn.close()
