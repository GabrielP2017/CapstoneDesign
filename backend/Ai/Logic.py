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
    lowered = text.lower()

    emotion_keywords = [
        "갈등", "갈등 있어", "감사하", "감사하다", "감사한", "감사함", "고맙", "고마워", "고맙다", "고마운", "고마움",
        "고민되", "고민돼", "고민되다", "고민된", "고민됨", "공허하", "공허하다", "공허한", "공허함",
        "귀찮", "귀찮다", "귀찮아", "귀찮은", "귀찮음", "기대되", "기대돼", "기대되다", "기대한", "기대됨",
        "기뻐", "기쁘", "기쁘다", "기쁜", "기쁨", "기분 좋아", "기분이 좋아", "나른하", "나른하다", "나른한", "나른함",
        "당당하", "당당하다", "당당해", "당당한", "당당함", "당황하", "당황하다", "당황했어", "당황한", "당황함",
        "다정하", "다정하다", "다정해", "다정한", "다정함", "든든하", "든든하다", "든든해", "든든한", "든든함",
        "무덤덤하", "무덤덤하다", "무덤덤해", "무덤덤한", "무덤덤함", "무기력하", "무기력하다", "무기력해", "무기력한", "무기력함",
        "무섭", "무섭다", "무서워", "무서운", "무서움", "미안하", "미안하다", "미안해", "미안한", "미안함",
        "분하", "분하다", "분해", "분한", "분함", "부끄럽", "부끄럽다", "부끄러워", "부끄러운", "부끄러움",
        "불안하", "불안하다", "불안해", "불안한", "불안함", "뿌듯하", "뿌듯하다", "뿌듯해", "뿌듯한", "뿌듯함",
        "비참하", "비참하다", "비참한", "비참함", "사랑하", "사랑하다", "사랑해", "사랑한", "사랑함",
        "상실되", "상실되다", "상실감", "상실된", "상실됨", "설레", "설레다", "설레여", "설렌다",
        "슬프", "슬프다", "슬퍼", "슬펐어", "슬픈", "슬픔", "스트레스", "스트레스 받아", "스트레스 받다", "스트레스를 받은",
        "스트레스 받음", "싫", "싫다", "싫어", "싫은", "싫음", "심란하", "심란하다", "심란해", "심란한", "심란함",
        "신나", "신난다", "신났어", "신나는", "신남", "아무 느낌 없어", "애틋하", "애틋하다", "애틋해", "애틋한", "애틋함",
        "얼떨떨하", "얼떨떨하다", "얼떨떨해", "얼떨떨한", "얼떨떨함", "억울하", "억울하다", "억울해", "억울한", "억울함",
        "여유롭", "여유롭다", "여유로워", "여유로운", "여유로움", "연민", "우울하", "우울하다", "우울해", "우울한", "우울함",
        "웃기", "웃긴", "웃김", "위로 받고 싶다", "위로 받고 싶어", "위로가 필요해", "유쾌하", "유쾌하다", "유쾌해", "유쾌한", "유쾌함",
        "의기소침하", "의기소침하다", "의기소침한", "의기소침함", "이해받고 싶어", "자랑스럽", "자랑스럽다", "자랑스러워", "자랑스러운", "자랑스러움",
        "자신 있", "자신 있다", "자신있어", "자신감", "재미없", "재미없다", "재미없어", "재미없는", "재미없음",
        "적적하", "적적하다", "적적한", "적적함", "조마조마하", "조마조마하다", "조마조마해", "조마조마한", "조마조마함",
        "죄책감", "죄책감 들어", "즐겁", "즐겁다", "즐거워", "즐거운", "즐거웠", "즐거움", "지루하", "지루하다", "지루해", "지루한", "지루함",
        "지치", "지치다", "지쳤어", "지친", "지침", "진절머리", "차분하", "차분하다", "차분해", "차분한", "차분함",
        "창피하", "창피하다", "창피해", "창피한", "창피함", "초조하", "초조하다", "초조해", "초조한", "초조함",
        "칭찬받고 싶어", "편안하", "편안하다", "편안해", "편안한", "편안함", "평온하", "평온하다", "평온해", "평온한", "평온함",
        "피곤하", "피곤하다", "피곤해", "피곤한", "피곤함", "혼란스럽", "혼란스럽다", "혼란스러워", "혼란스러운", "혼란스러움",
        "화나", "화나다", "화났어", "화난", "화남", "흥미롭", "흥미롭다", "흥미로워", "흥미로운", "흥미로움"
    ]

    return any(kw in lowered for kw in emotion_keywords)



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
