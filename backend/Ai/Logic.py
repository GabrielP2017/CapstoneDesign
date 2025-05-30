# -----------------------------------------------------------------------------------
# 파일 이름   : Logic.py
# 설명        : 통합 AI 서비스 모듈 - 일반 챗, 실시간 검색, 앱 제어, 감정 기반 추천, 키워드 감지 기능 제공
# 주요 기능   :
#   1) 쿼리 분류(일반, 실시간, 앱 열기/닫기) 후 각 처리기 호출  
#   2) GPT 기반 감정 분석 및 한국 음식 추천  
#   3) 감정 관련 메시지 판별  
#   4) 인사/작별 메시지 판별  
# 요구 모듈   : Model, Chatbot, RealtimeSearchEngine, AppControl, openai, dotenv, datetime, os
# -----------------------------------------------------------------------------------

from Ai.Model import FirstLayerDMM
from Ai.Chatbot import Chatbot
from Ai.RealtimeSearchEngine import RealtimeSearchEngine
from Ai.AppControl import open_app, close_app
from openai import OpenAI
import os
from dotenv import load_dotenv
from datetime import datetime

# 환경변수 로드 및 GPT 클라이언트 초기화
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ────────────────────────────────────────────────────────────────────────────────────
# 1) 일반 태스크 기반 처리 함수
#    - 함수명: IntegratedAI
#    - 역할: DMM으로 분류된 태스크를 순회하며 일반 대화, 실시간 검색, 앱 제어 등을 실행
# ────────────────────────────────────────────────────────────────────────────────────

def IntegratedAI(query):

    greeting_responses = ["안녕하세요", "안녕", "하이", "안녕!"]
    farewell_responses = ["안녕히 가세요", "잘가", "바이"]

    query_cleaned = query.strip()

    # 인사 직접 처리
    if query_cleaned in greeting_responses:
        return "안녕하세요! 무엇을 도와드릴까요?"

    if query_cleaned in farewell_responses:
        return "안녕히 가세요! 좋은 하루 보내세요."

    # 실시간 뉴스/음악 검색 우선 처리
    if any(keyword in query for keyword in ["뉴스", "주요 소식"]):
        return RealtimeSearchEngine("오늘 뉴스")

    if any(keyword in query for keyword in ["노래", "음악", "곡", "뮤직", "추천해줘"]):
        return RealtimeSearchEngine(query + " site:youtube.com")

    # 나머지 일반 태스크 분기
    tasks = FirstLayerDMM(query)
    response = ""

    for task in tasks:
        task = task.strip()

        if task.startswith("general"):
            general_query = task.replace("general", "").strip()
            response += Chatbot(general_query) + "\n"

        elif task.startswith("realtime"):
            realtime_query = task.replace("realtime", "").strip()
            response += RealtimeSearchEngine(realtime_query) + "\n"

        elif task.startswith("open"):
            app_name = task.replace("open", "").strip()
            open_app(app_name)
            response += f"{app_name}을(를) 열었습니다.\n"

        elif task.startswith("close"):
            app_name = task.replace("close", "").strip()
            close_app(app_name)
            response += f"{app_name}을(를) 닫았습니다.\n"

        else:
            response += "해당 명령을 이해하지 못했습니다.\n"

    return response.strip()

# ────────────────────────────────────────────────────────────────────────────────────
# 2) 감정 기반 추천 함수
#    - 함수명: classify_emotion_and_reply_with_gpt
#    - 역할: 텍스트 감정 분석 후 적절한 한국 음식 추천 프롬프트 생성 및 결과 파싱
# ────────────────────────────────────────────────────────────────────────────────────

def classify_emotion_and_reply_with_gpt(text, recent_foods=None):
    if recent_foods is None:
        recent_foods = []

    hour = datetime.now().hour
    today_str = datetime.now().strftime("%Y년 %m월 %d일")

    if hour < 11:
        time_slot = "아침"
    elif hour < 17:
        time_slot = "점심"
    else:
        time_slot = "저녁"

    recent_foods_str = ", ".join(recent_foods)

    prompt = f"""
사용자의 메시지: \"{text}\"

- 현재 시간은 {today_str} {time_slot}입니다.
- 사용자의 기분을 하나의 감정(행복, 우울, 스트레스, 화남, 긴장, 지루함)으로 분석해주세요.
- 그 감정에 어울리는 한국 음식을 추천해주세요.
- 최근 추천된 음식({recent_foods_str})은 제외하고 추천해주세요.
- 흔하지 않고 특별한 음식을 추천해주세요.
- 추천 이유는 감정과 연결하여 따뜻하게 설명해주세요.

형식:
기분 요약: (감정)
추천 음식: (음식 이름)
추천 이유: (이유)
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
        temperature=0.7
    )

    content = response.choices[0].message.content.strip()

    emotion, food, reason = None, None, None
    for line in content.splitlines():
        if line.startswith("기분 요약:"):
            emotion = line.replace("기분 요약:", "").strip()
        elif line.startswith("추천 음식:"):
            food = line.replace("추천 음식:", "").strip()
        elif line.startswith("추천 이유:"):
            reason = line.replace("추천 이유:", "").strip()

    return emotion, food, reason

# ────────────────────────────────────────────────────────────────────────────────────
# 3) 감정 관련 키워드 감지 함수
#    - 함수명: is_emotion_related
#    - 역할: 텍스트에 감정 관련 키워드가 포함되었는지 여부 판별
# ────────────────────────────────────────────────────────────────────────────────────

def is_emotion_related(text):
    keywords = [
        "기분", "감정", "스트레스", "위로",
        "먹고 싶어", "배고파",
        # Positive emotions from your list
        "기분 좋다", "즐겁다", "신난다", "행복하다", "만족스럽다", "뿌듯하다", "유쾌하다",  # 기쁨
        "안정된다", "차분하다", "평온하다", "여유롭다", "마음이 놓인다",  # 편안함
        "자랑스럽다", "자신 있다", "당당하다", "든든하다",  # 자신감
        "사랑스럽다", "애틋하다", "다정하다", "감사하다", "고맙다",  # 사랑/애정
        "기대된다", "설렌다", "흥미롭다", "호기심 있다",  # 기대/설렘
        "화난다", "짜증난다", "분하다", "억울하다", "거슬린다",  # 분노 
        "슬프다", "우울하다", "눈물 난다", "허전하다", "외롭다", "상실감 든다",  # 슬픔 
        "불안하다", "초조하다", "긴장된다", "걱정된다", "심란하다", "조마조마하다",  # 불안/걱정 
        "무섭다", "겁난다", "불안정하다", "떨린다",  # 두려움
        "창피하다", "부끄럽다", "미안하다", "죄책감 든다",  # 수치심/죄책감
        "피곤하다", "지친다", "귀찮다", "하기 싫다", "무기력하다", "재미없다", "지루해", "힘들어", # 지침
        "헷갈린다", "복잡하다", "어리둥절하다", "멍하다",  # 혼란
        "놀랐다", "당황스럽다", "얼떨떨하다",  # 당황
        "아무 느낌 없다", "공허하다", "무덤덤하다",  # 무감각
        "갈등된다", "고민된다", "결정 못 하겠다"  # 고민
    ]
    # 중복 제거 
    keywords = list(set(keywords))
    return any(kw in text for kw in keywords)

# ────────────────────────────────────────────────────────────────────────────────────
# 4) 인사/작별 감지 함수
#    - 함수명: is_greeting
#    - 역할: 텍스트에 인사 또는 작별 키워드 포함 여부 판별 후 타입 반환
# ────────────────────────────────────────────────────────────────────────────────────

def is_greeting(text):
    farewell_keywords = ["잘 가", "다음에", "또 봐", "그럼 안녕", "나 갈게", "끝"]
    greeting_keywords = ["안녕", "하이", "안녕하세요", "반가워"]
    text = text.lower()
    if any(kw in text for kw in farewell_keywords):
        return "farewell"
    elif any(kw in text for kw in greeting_keywords):
        return "greeting"
    return None
