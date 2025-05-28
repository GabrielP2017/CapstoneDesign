# -----------------------------------------------------------------------------------
# 파일 이름   : app.py
# 설명        : FastAPI 기반 AI 챗봇 및 음식 추천 API 서버
# 주요 기능   :
#   1) .env 파일에서 환경 변수(SECRET_KEY, Maps_API_KEY) 로드
#   2) SQLite DB 초기화 및 사용자·채팅·사진 메타 관리 유틸 함수 import
#   3) FastAPI 앱 생성 및 CORS 설정
#   4) 이메일 유효성 검사·비밀번호 해싱 등 헬퍼 함수 정의
#   5) 홈·회원가입·로그인 페이지 라우팅 엔드포인트
#   6) 인증 API(signup, login, status, logout) 엔드포인트 구현
#   7) AI 챗 & 음식 추천 엔드포인트(get_response) 구현
#   8) 채팅 로그 조회·추가 API(read_chat_logs, add_chat_log) 구현
#   9) 사진 업로드 API (주석 처리된 상태) 플랜 제공
#   10) uvicorn을 통한 서버 실행 로직
# 요구 모듈   : os, uuid, logging, datetime, re, fastapi, python-dotenv,
#               jwt, sqlite3, bcrypt, typing, random, pydantic,
#               Logic, SearchContent
# -----------------------------------------------------------------------------------

import os
import uuid
import logging
import datetime
import re

from fastapi import (
    FastAPI, Request, Response, Depends, Cookie, Form, HTTPException,
    UploadFile, File, APIRouter
)
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import jwt
import sqlite3
import bcrypt
from typing import Optional
import random
from pydantic import BaseModel, Field, ConfigDict

from Ai.Logic import (
    IntegratedAI, classify_emotion_and_reply_with_gpt, is_emotion_related
)
from Ai.SearchContent import find_restaurant_nearby

# ────────────────────────────────────────────────
# 1) 환경 변수 & 상수
# ────────────────────────────────────────────────
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "capstone-secret")
Maps_API_KEY = os.getenv("Maps_API_KEY")
DATABASE = "AICHAT_database.db"
print(f"🔑 Loaded SECRET_KEY = {SECRET_KEY}", flush=True)

# 업로드 설정 (사용 예정)
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

# ────────────────────────────────────────────────
# 2) DB 유틸 함수 import & 초기화
# ────────────────────────────────────────────────
from users import (
    init_db,
    get_db, # sqlite 연결 + PRAGMA + row_factory
    save_chat,
    create_session, 
    read_sessions, 
    read_session_logs, 
    add_log,
    add_bookmark,
    read_bookmarks,
    delete_bookmark,
    update_bookmark,
    delete_session
)

# 앱 시작 시 한 번만 DB 스키마 생성
init_db()

# ─── 모든 세션 API에서 공용으로 쓰는 helper ─────────────
def current_user_id_or_401(token: Optional[str]) -> int:
    print(f"🛠 current_user_id_or_401() token: {token}", flush=True)
    email = verify_token(token)
    print(f"🛠 verify_token returned email: {email}", flush=True)
    if not email:
        raise HTTPException(401, "로그인이 필요합니다.")
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    row = cur.fetchone(); conn.close()
    if not row:
        raise HTTPException(401, "등록된 사용자가 아닙니다.")
    return row["id"]

# ────────────────────────────────────────────────
# 3) FastAPI 앱 생성 & CORS
# ────────────────────────────────────────────────
app = FastAPI()
print("🚀 FastAPI running with CORS on http://localhost:5000")

templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://43.203.44.237:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ────────────────────────────────────────────────
# 4) 헬퍼 함수
# ────────────────────────────────────────────────
def is_valid_email(email: str) -> bool:
    return bool(re.match(r"[^@]+@[^@]+\.[^@]+", email))

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def check_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def generate_token(email: str) -> str:
    payload = {
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=3)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(token: Optional[str]) -> Optional[str]:
    print(f"🐛 verify_token() got token: {token}", flush=True)
    if not token:
        print("🐛 → no token, returning None", flush=True)
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        print(f"🐛 → decoded payload: {payload}", flush=True)
        return payload.get("email")
    except jwt.ExpiredSignatureError:
        print("🐛 → token expired", flush=True)
        return None
    except jwt.InvalidTokenError as e:
        print(f"🐛 → invalid token: {e}", flush=True)
        return None
    
def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ────────────────────────────────────────────────
# 5) 페이지 라우팅
# ────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        "index.html", {"request": request, "google_api_key": Maps_API_KEY}
    )

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

# ────────────────────────────────────────────────
# 6) 인증 API
# ────────────────────────────────────────────────
@app.post("/api/signup")
async def api_signup(data: dict):
    name  = data.get("name")
    email = data.get("email")
    pw    = data.get("password")

    if not (name and email and pw):
        raise HTTPException(400, "이름, 이메일, 비밀번호를 모두 입력해주세요.")
    if not is_valid_email(email):
        raise HTTPException(400, "이메일 형식이 올바르지 않습니다.")

    conn = get_db(); cur = conn.cursor()

    if cur.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
        conn.close()
        raise HTTPException(409, "이미 가입된 이메일입니다.")

    hashed = hash_password(pw)
    try:
        cur.execute(
            "INSERT INTO users (name, email, hashed_password) VALUES (?, ?, ?)",
            (name, email, hashed)
        )
        user_id = cur.lastrowid # ★ 새 id 확보
        conn.commit()
    except sqlite3.Error as e:
        conn.rollback()
        raise HTTPException(500, f"회원가입 오류: {e}")
    finally:
        conn.close()

    # JWT 발급 & 쿠키에 심기
    token = generate_token(email)

    resp = JSONResponse({
        "success": True,
        "message": "회원가입 성공",
        "data": {"id": user_id, "name": name, "email": email}
    })
    resp.set_cookie("token", token, httponly=True)

    return resp


@app.post("/api/login")
async def api_login(response: Response, data: dict):
    print("data")
    print(data)
    email = data.get("email")
    pw = data.get("password")

    if not (email and pw):
        raise HTTPException(400, "이메일과 비밀번호를 모두 입력해주세요.")
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, name, hashed_password FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()

    print("rowId")
    print(row["id"])
    if not row or not check_password(pw, row["hashed_password"]):
        raise HTTPException(401, "이메일 또는 비밀번호가 틀렸습니다.")
    
    token = generate_token(email)
    print("token")
    print(token)
    json_response = JSONResponse(content={
        "success": True, 
        "message": "로그인 성공", 
        "data": {"id": row["id"], "name": row["name"], "email": email}
    })

    print("json_response")
    print(json_response)
    json_response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="None", # 크로스 오리진 허용
        secure=False
    )

    return json_response

@app.get("/api/status")
async def api_status(token: Optional[str] = Cookie(None)):
    email = verify_token(token)
    if not email:
        raise HTTPException(401, "로그인 필요")
    
    # 로그인된 이메일의 user_id 조회
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(401, "등록된 사용자가 아닙니다.")
    return {"logged_in": True, "email": email, "id": row["id"], "name": row["name"]}

@app.post("/api/logout")
async def api_logout(response: Response):
    response.delete_cookie("token")
    return {"success": True, "message": "로그아웃 되었습니다."}

# ────────────────────────────────────────────────
# 7) AI 챗 & 음식 추천
# ────────────────────────────────────────────────
@app.post("/get_response")
async def get_response(
    request: Request,
    message: str = Form(...),
    session_id: Optional[str] = Form(None)
):
    # 1) JWT에서 이메일 꺼내기
    token = request.cookies.get("token")
    email = verify_token(token)
    if not email:
        raise HTTPException(401, "로그인 정보가 없습니다.")

    # 2) user_id 조회
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(401, "등록된 사용자가 아닙니다.")
    user_id = row["id"]

    if not session_id:
        session_id = create_session(user_id, title=(message[:30] or None))

    text = message.strip()

    # 3) 사용자 메시지 저장
    save_chat(session_id, user_id, message ,None,None,"user") #

    # 타임스탬프 생성
    created_at = datetime.datetime.utcnow().isoformat() + "Z"
    
    off_topic_message = "주제와 맞지 않는 대화입니다. 감정이나 기분에 대해 말씀해주시면 관련된 음식을 추천해 드릴게요."

    # 4) AI 응답 로직
    if not text:
        reply = "기분이나 명령을 입력해 주세요!"
        save_chat(session_id, user_id, reply,None,None,"assistant") 
        return {"message": reply, "createdAt": created_at}

    if is_emotion_related(text): #
        emotion, food, reply_text = classify_emotion_and_reply_with_gpt(text) 
        if not food:
            food = random.choice(["김밥","떡볶이","비빔밥","갈비탕","파스타","치킨"])
            reply_text = f"{food} 추천해드려요!"

        restaurant = find_restaurant_nearby(food) #
        if restaurant:
            # ◀ 변경: 지도 링크 포함
            lat = restaurant.get("latitude")
            lng = restaurant.get("longitude")
            map_url = (
                f"https://www.google.com/maps/place/?q=place_id:{restaurant['place_id']}"
            )
            name=restaurant.get("name")
            formatted = (
                f"{reply_text}<br><br>"
                f"추천 식당: <strong>{restaurant['name']}</strong><br>"
                f"주소: {restaurant['address']}<br>"
                f"평점: {restaurant.get('rating','정보 없음')}점 "
                f"(리뷰 {restaurant.get('reviews','없음')}명)<br>"
            )
            save_chat(session_id, user_id, formatted,map_url,name,"assistant") #
            print(map_url)
            print("aa")
            return {
                "message": formatted,
                "restaurant": restaurant,
                "name":name,
                "url": map_url,
                "createdAt": created_at,
            }
        else:
            reply = f"{reply_text}<br><br>근처 '{food}' 식당을 찾지 못했습니다."
            save_chat(session_id, user_id, reply,None,None, "assistant") #
            return {"message": reply, "createdAt": created_at}
    else:
        # 감정 관련 내용이 아니면 모든 다른 기능(IntegratedAI 호출)을 비활성화하고 거절 메시지 반환
        save_chat(session_id, user_id, off_topic_message, None, None, "assistant") 
        return {"message": off_topic_message, "createdAt": created_at}

# ────────────────────────────────────────────────
# 8) 채팅 로그 API
# ────────────────────────────────────────────────

#유저목록 API
@app.get("/api/users")
async def api_list_users():
    conn = get_db()
    rows = conn.execute("SELECT id, name FROM users").fetchall()
    conn.close()
    return [{"id": r["id"], "name": r["name"]} for r in rows]

# ────────────────────────────────────────────────
# 10) 채팅 로그 수정 API
# ────────────────────────────────────────────────
class SessionCreate(BaseModel):
    title: Optional[str] = None

class SessionOut(BaseModel):
    id: str
    title: Optional[str]
    created_at: datetime.datetime
    last_message: Optional[str] = Field(None, alias="last_message")
    class Config:
        populate_by_name = True

class ChatLogIn(BaseModel):
    message: str

class ChatLogOut(BaseModel):
    id: int
    role: str
    message: str
    createdAt: datetime.datetime
    name:str|None
    url:str|None

# 1) 세션 생성
@app.post("/api/sessions", response_model=SessionOut)
async def api_create_session(body: SessionCreate, token: Optional[str] = Cookie(None),):
    user_id   = current_user_id_or_401(token)
    session_id = create_session(user_id, body.title)
    return {
      "id": session_id,
      "title": body.title,
      "created_at": datetime.datetime.utcnow()
    }

# 2) 세션 목록 조회
@app.get("/api/sessions", response_model=list[SessionOut])
async def api_read_sessions(token: Optional[str] = Cookie(None)):
    user_id = current_user_id_or_401(token)
    return read_sessions(user_id)

# 3) 특정 세션의 로그 조회
@app.get("/api/sessions/{session_id}/logs", response_model=list[ChatLogOut])
async def api_read_session_logs(session_id: str, token: Optional[str] = Cookie(None)):
    email = verify_token(token)
    if not email:
        raise HTTPException(401, "로그인이 필요합니다.")
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email,)); row = cur.fetchone()
    if not row: raise HTTPException(401, "등록된 사용자가 아닙니다.")
    user_id = row["id"]
    # 소유권 확인
    if session_id not in [s["id"] for s in read_sessions(user_id)]:
        raise HTTPException(403, "권한이 없습니다.")
    return read_session_logs(session_id)

# 4) 세션에 메시지 추가 (유저·어시스턴트 공용)
@app.post("/api/sessions/{session_id}/messages", response_model=ChatLogOut)
async def api_add_message(session_id: str, body: ChatLogIn, token: Optional[str] = Cookie(None)):
    # 소유권 검증 생략…
    user_id = current_user_id_or_401(token)
    add_log(session_id, user_id, "user", body.message)
    # AI 응답 생성 (기존 get_response 로직 재사용)
    # 여기서는 get_response를 직접 호출하기보다 해당 로직을 따르거나 필요한 부분만 가져와야 함
    # 현재 요청은 모든 다른 기능을 거절하므로 이 API는 사용되지 않을 가능성이 높음
    # 만약 이 API가 다른 경로로 사용된다면 AI 응답 로직도 수정된 정책을 따라야 함
    # 지금은 classify_emotion_and_reply_with_gpt를 호출하지만 이는 off_topic_message로 대체될 수 있음
    
    # 수정된 정책 적용: 감정 기반이 아니면 off_topic_message 반환
    text = body.message.strip()
    ai_resp = ""
    off_topic_message_alt = "주제와 맞지 않는 대화입니다. 감정이나 기분에 대해 말씀해주시면 관련된 음식을 추천해 드릴게요."

    if is_emotion_related(text): 
        emotion, food, reply_text = classify_emotion_and_reply_with_gpt(text) 
        if not food:
            food = random.choice(["김밥","떡볶이","비빔밥","갈비탕","파스타","치킨"])
            reply_text = f"{food} 추천해드려요!"
        restaurant = find_restaurant_nearby(food) 
        if restaurant:
            map_url = f"https://www.google.com/maps/place/?q=place_id:{restaurant['place_id']}"
            name = restaurant.get("name")
            ai_resp = (
                f"{reply_text}<br><br>"
                f"추천 식당: <strong>{restaurant['name']}</strong><br>"
                f"주소: {restaurant['address']}<br>"
                f"평점: {restaurant.get('rating','정보 없음')}점 "
                f"(리뷰 {restaurant.get('reviews','없음')}명)<br>"
            )
            add_log(session_id, user_id, "assistant", ai_resp, map_url, name)
        else:
            ai_resp = f"{reply_text}<br><br>근처 '{food}' 식당을 찾지 못했습니다."
            add_log(session_id, user_id, "assistant", ai_resp)
    else:
        ai_resp = off_topic_message_alt
        add_log(session_id, user_id, "assistant", ai_resp)

    return { "id": 0, "role":"assistant", "message": ai_resp, "createdAt": datetime.datetime.utcnow(), "name": name if 'name' in locals() else None, "url": map_url if 'map_url' in locals() else None }


@app.delete("/api/sessions/{session_id}", response_model=dict)
async def api_delete_session(session_id: str, token: Optional[str] = Cookie(None)):
    user_id = current_user_id_or_401(token)

    # 2) 소유권 확인
    user_sessions = [s["id"] for s in read_sessions(user_id)]
    if session_id not in user_sessions:
        raise HTTPException(status_code=403, detail="권한이 없습니다.")

    # 3) 삭제 시도
    ok = delete_session(session_id)
    if not ok:
        raise HTTPException(status_code=500, detail="삭제에 실패했습니다.")

    return {"success": True}
# ────────────────────────────────────────────────
# 11) 즐겨찾기 등록,리스트,삭제,수정
# ────────────────────────────────────────────────
@app.post("/api/add_bookmark")
async def api_add_bookmark(
    request: Request,
):
    # 1) JWT에서 이메일 꺼내기
    token = request.cookies.get("token")
    email = verify_token(token) 
    data = await request.json()
    name = data.get("name")
    url =data.get("url")
    print(name)
    print(url)
    if not email:
        raise HTTPException(401, "로그인 정보가 없습니다.")

    # 2) user_id 조회
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(401, "등록된 사용자가 아닙니다.")
    user_id = row["id"]

    # 3) 즐겨찾기 추가
    add_bookmark(user_id,name,url)

    return {"success": True, "message": "즐겨찾기 추가 성공"}

@app.get("/api/bookmarks")
async def api_bookmarks(
    request: Request,
):
    # 1) JWT에서 이메일 꺼내기
    token = request.cookies.get("token")
    email = verify_token(token) 
    if not email:
        raise HTTPException(401, "로그인 정보가 없습니다.")

    # 2) user_id 조회
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(401, "등록된 사용자가 아닙니다.")
    user_id = row["id"]


    # 3) 즐겨찾기 읽어오기
    return read_bookmarks(user_id)

@app.post("/api/delete_bookmark")
async def api_delete_bookmark(
    request: Request,
):
    # 1) JWT에서 이메일 꺼내기
    token = request.cookies.get("token")
    email = verify_token(token) 
    data = await request.json()
    bookmark_id =data.get("bookmark_id")
    if not email:
        raise HTTPException(401, "로그인 정보가 없습니다.")

    # 2) user_id 조회
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(401, "등록된 사용자가 아닙니다.")
    user_id = row["id"]

    # 3) 즐겨찾기 추가
    print(bookmark_id)
    delete_bookmark(bookmark_id)

    return {"success": True, "message": "즐겨찾기 삭제 성공"}

# 클라이언트로부터 받을 수정 요청의 JSON 데이터 형식을 정의한 Pydantic 모델

# 즐겨찾기 정보를 수정하는 API 엔드포인트
# 클라이언트에서 POST 요청을 보낼 때 /api/update_bookmark 경로를 사용함
@app.post("/api/update_bookmark")
async def api_update_bookmark(
    request: Request,
):
    # 1) JWT에서 이메일 꺼내기
    token = request.cookies.get("token")
    email = verify_token(token) 
    data = await request.json()
    name = data.get("name")
    url =data.get("url")
    bookmark_id=data.get("id")
    print(bookmark_id)
    print(name)
    print(url)
    if not email:
        raise HTTPException(401, "로그인 정보가 없습니다.")

    # 2) user_id 조회
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(401, "등록된 사용자가 아닙니다.")
    user_id = row["id"]

    # 3) 즐겨찾기 추가
    update_bookmark(bookmark_id,name,url)

    return {"success": True, "message": "즐겨찾기 수정 성공"}

# ────────────────────────────────────────────────
# 사진 업로드 API (대기 중)
# ────────────────────────────────────────────────

""" @app.post("/api/upload_photo")
async def api_upload_photo(
    user_id: int = Form(...),
    photo: UploadFile = File(...)
):
    if photo.filename == "" or not allowed_file(photo.filename):
        raise HTTPException(400, "유효한 이미지 파일을 선택하세요.")
    fname = secure_filename(photo.filename)
    ext = fname.rsplit(".", 1)[1]
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    user_dir = os.path.join(UPLOAD_DIR, str(user_id))
    os.makedirs(user_dir, exist_ok=True)

    dest = os.path.join(user_dir, unique_name)
    with open(dest, "wb") as f:
        f.write(await photo.read())

    ok = save_photo_meta(user_id, dest, fname)
    if not ok:
        raise HTTPException(500, "메타 저장에 실패했습니다.")
    return {"success": True, "url": f"/uploads/{user_id}/{unique_name}"}
 """

# ────────────────────────────────────────────────
# 12) 서버 실행
# ────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=False)
