import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "coachiq.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS coaching_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            manager_name TEXT,
            question TEXT NOT NULL,
            response TEXT NOT NULL,
            bias_score REAL NOT NULL,
            bias_flag INTEGER NOT NULL,
            employees_referenced TEXT
        )
    """)
    conn.commit()
    conn.close()

def log_session(manager_name: str, question: str, response: str, 
                bias_score: float, bias_flag: bool, employees: list):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO coaching_sessions 
        (timestamp, manager_name, question, response, bias_score, bias_flag, employees_referenced)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.now().isoformat(),
        manager_name,
        question,
        response,
        bias_score,
        1 if bias_flag else 0,
        ", ".join(employees)
    ))
    conn.commit()
    conn.close()

def get_bias_summary():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            COUNT(*) as total_sessions,
            AVG(bias_score) as avg_bias_score,
            SUM(bias_flag) as total_flags,
            MAX(bias_score) as max_bias_score
        FROM coaching_sessions
    """)
    row = cursor.fetchone()
    conn.close()
    return {
        "total_sessions": row[0],
        "avg_bias_score": round(row[1] or 0, 3),
        "total_flags": row[2],
        "max_bias_score": round(row[3] or 0, 3)
    }

init_db()