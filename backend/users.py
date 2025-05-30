# -----------------------------------------------------------------------------------
# 파일 이름   : users.py
# 설명        : SQLite DB 초기화 및 사용자 채팅·사진 메타 관리 유틸 모듈
# 주요 기능   :
#   1) init_db          : 데이터베이스 테이블 초기화
#   2) get_db           : DB 커넥션 생성 및 외래키 활성화
#   3) save_chat        : 채팅 로그 저장
#   4) save_photo_meta  : 사진 메타데이터 저장
#   5) read_chat        : 사용자 채팅 기록 조회
#   6) read_photos      : 사용자 사진 메타 조회
#   7) add_bookmark     : 즐겨찾기 추가
#   8) read_bookmarks   : 즐겨찾기 목록 가져오기
#   9) delete_bookmarks : 즐겨찾기 한개 삭제
# 요구 모듈   : sqlite3, os, logging
# -----------------------------------------------------------------------------------

import sqlite3
import os
import logging
import uuid
from datetime import datetime


script_directory = os.path.dirname(os.path.abspath(__file__))
database_name = "AICHAT_database.db"

database_path = os.path.join(script_directory, database_name)
connection = sqlite3.connect(database_path)
cursor = connection.cursor()


CREATE_USERS = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL
);
"""

CREATE_CHAT_LOGS = """
CREATE TABLE IF NOT EXISTS chat_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id   TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);"""


CREATE_PHOTOS ="""
CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    original_name TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
"""

CREATE_SESSIONS = """
CREATE TABLE IF NOT EXISTS chat_sessions (
  id           TEXT PRIMARY KEY,    
  user_id      INTEGER NOT NULL,          
  title        TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

# 3) 초기화 함수: 앱 시작 시 한 번만 호출
def init_db():
    """테이블이 없으면 생성하고 외래키 제약을 활성화"""
    conn = sqlite3.connect(database_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    for ddl in (CREATE_USERS, CREATE_SESSIONS, CREATE_CHAT_LOGS, CREATE_PHOTOS):
        try:
            conn.execute(ddl)
        except sqlite3.OperationalError as e:
            # 이미 만들어진 테이블만 무시
            if "already exists" in str(e):
                continue
            # 다른 에러면 그대로 올려서 보게끔
            logging.error("init_db DDL error: %s", e)
            raise
    conn.commit()
    logging.info("Initialized database and created tables.")


def get_db():
    conn = sqlite3.connect(database_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def save_chat(session_id: str, user_id: int, message: str,url:str,name:str,role: str = "user"):
    conn = get_db()
    print(f"name: {name}")
    try:
        conn.execute(
            "INSERT INTO chat_logs (session_id, user_id, message,url,name, role) VALUES (?, ?, ?,?,?, ?)",
            (session_id, user_id, message,url,name,role)
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        conn.rollback()
        return False  # 외래키 위반 등
    except sqlite3.Error as e:
        conn.rollback()
        print("save_chat error:", e)
        return False
    finally:
        conn.close()

def read_chat(session_id: str):
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT id, user_id, role, message, created_at AS timestamp " "FROM chat_logs WHERE session_id=? ORDER BY created_at", (session_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def save_photo_meta(user_id, file_path, original_name):
    conn = get_db()

    try:
        conn.execute("INSERT INTO photos (user_id, file_path, original_name) VALUES (?, ?, ?)", (user_id, file_path, original_name))
        conn.commit()
    except sqlite3.IntegrityError as e:
        conn.rollback()
    finally:
        conn.close()

def read_photos(user_id):
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT * FROM photos WHERE user_id = ? ORDER BY uploaded_at", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def create_session(user_id: int, title: str = None) -> str:
    session_id = str(uuid.uuid4())
    conn = get_db()
    conn.execute(
        "INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)",
        (session_id, user_id, title)
    )
    conn.commit()
    conn.close()
    return session_id

def read_sessions(user_id: int) -> list[dict]:
    conn = get_db()
    rows = conn.execute("""
        SELECT
            s.id,
            COALESCE(s.title, '') AS title,
            s.created_at,
            (
                SELECT message
                FROM chat_logs
                WHERE session_id = s.id
                ORDER BY created_at DESC
                LIMIT 1
            ) AS last_message,
            (
                SELECT created_at
                FROM chat_logs
                WHERE session_id = s.id
                ORDER BY created_at DESC
                LIMIT 1
            ) AS last_date
        FROM chat_sessions AS s
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC;
    """, (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def read_session_logs(session_id: str) -> list[dict]:
    conn = get_db()
    rows = conn.execute(
      "SELECT id, role, message,created_at AS createdAt,url,name FROM chat_logs WHERE session_id=? ORDER BY created_at",
      (session_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_log(session_id: str, user_id: int, role: str, text: str) -> bool:
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO chat_logs (session_id, user_id, role, message) VALUES (?, ?, ?, ?)",
            (session_id, user_id, role, text)
        )
        conn.commit()
        return True
    finally:
        conn.close()


def add_bookmark(user_id: int,name:str,url:str) -> bool:
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO bookmark ( user_id,name,url,created_at) VALUES (?, ?, ?,datetime('now','localtime'))",
            (user_id,name,url)
        )
        conn.commit()
        return True
    finally:
        conn.close()


def read_bookmarks(user_id):
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT * FROM bookmark WHERE user_id=? ORDER BY created_at", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

def delete_bookmark(bookmark_id:int) -> bool:
    conn = get_db()
    try:
        conn.execute(
            "DELETE FROM bookmark WHERE id=?",
            (bookmark_id,)
        )
        conn.commit()
        return True
    finally:
        conn.close()

def update_bookmark(bookmark_id:int,name:str,url:str) -> bool:
    conn = get_db()
    try:
        conn.execute(
            "UPDATE bookmark SET name=?,url=? WHERE id=?",
            (name,url,bookmark_id,)
        )
        conn.commit()
        return True
    finally:
        conn.close()
        
def delete_session(session_id: str) -> bool:
    conn = get_db()
    try:
        cur = conn.execute("DELETE FROM chat_sessions WHERE id = ?", (session_id,))
        conn.commit()
        return cur.rowcount > 0
    except sqlite3.Error as e:
        logging.error("delete_session error: %s", e)
        return False
    finally:
        conn.close()
        return True