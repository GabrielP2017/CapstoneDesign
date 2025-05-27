# -----------------------------------------------------------------------------------
# 파일 이름   : realtime_search_service.py
# 설명        : Groq LLM과 구글 검색 연동을 통해 최신 정보를 실시간으로 제공하는 모듈
# 주요 기능   :
#   1) .env 파일에서 환경 변수(Username, Assistantname, GroqAPIKey) 로드
#   2) 구글 검색(GoogleSearch) 함수로 상위 5개 결과 수집
#   3) LLM 응답 후후 처리를 위한 AnswerModifier 함수
#   4) 실시간 정보(날짜·시간·요일) 제공 함수 Information
#   5) RealtimeSearchEngine 엔드포인트 로직 구현
#   6) __main__ 블록에서 반복 입력 테스트 지원
# 요구 모듈   : googlesearch, groq, json, datetime, python-dotenv, os
# -----------------------------------------------------------------------------------

from googlesearch import search
from groq import Groq
from json import load, dump
import datetime
from dotenv import dotenv_values

# .env 파일에서 환경변수 로드
env_vars = dotenv_values(".env")
Username = env_vars.get("Username")
Assistantname = env_vars.get("Assistantname")
GroqAPIKey = env_vars.get("GroqAPIKey")

# Groq 클라이언트 초기화
client = Groq(api_key=GroqAPIKey)

# 시스템 메시지를 한국어로 작성
System = f"""안녕하세요, 저는 {Username}입니다. 당신은 {Assistantname}이라는 이름의 고급 AI 챗봇이며, 최신 정보를 실시간으로 제공합니다.
*** 답변은 항상 전문적인 문장으로, 올바른 구두점과 문법을 사용하여 작성해주세요. ***
*** 제공된 데이터를 바탕으로 질문에 정확하게 답변해주세요. ***
"""

# ChatLog 파일 읽기/쓰기 (Data/ChatLog.json)
try:
    with open("Data/ChatLog.json", "r", encoding="utf-8") as f:
        messages = load(f)
except:
    with open("Data/ChatLog.json", "w", encoding="utf-8") as f:
        dump([], f)

# ────────────────────────────────────────────────────────────────────────────────────
# 1) GoogleSearch 함수
#    - 역할: 주어진 쿼리에 대해 구글 검색 결과 상위 5건을 제목·설명과 함께 반환
#    - Args:
#        query (str): 검색할 키워드
#    - Returns:
#        str: 포맷팅된 검색 결과 문자열
# ────────────────────────────────────────────────────────────────────────────────────
def GoogleSearch(query):
    results = list(search(query, advanced=True, num_results=5))
    Answer = f"'{query}'에 대한 구글 검색 결과:\n[start]\n"
    for i in results:
        Answer += f"제목: {i.title}\n설명: {i.description}\n\n"
    Answer += "[end]"
    return Answer

# ────────────────────────────────────────────────────────────────────────────────────
# 2) AnswerModifier 함수
#    - 역할: LLM 응답 텍스트에서 빈 줄 제거 및 공백 조정
#    - Args:
#        Answer (str): 원본 응답 문자열
#    - Returns:
#        str: 정제된 응답 문자열
# ────────────────────────────────────────────────────────────────────────────────────
def AnswerModifier(Answer):
    lines = Answer.split('\n')
    non_empty_lines = [line for line in lines if line.strip()]
    modified_answer = '\n'.join(non_empty_lines)
    return modified_answer

# 초기 시스템 대화 (한국어)
SystemChatBot = [
    {"role": "system", "content": System},
    {"role": "user", "content": "안녕"},
    {"role": "assistant", "content": "안녕하세요, 무엇을 도와드릴까요?"},
]

# ────────────────────────────────────────────────────────────────────────────────────
# 3) Information 함수
#    - 역할: 현재 날짜·시간·요일 등 실시간 정보를 한글 포맷으로 제공
#    - Returns:
#        str: 포맷팅된 실시간 정보 문자열
# ────────────────────────────────────────────────────────────────────────────────────
def Information():
    current_date_time = datetime.datetime.now()
    data = "필요시 사용할 최신 실시간 정보:\n"
    data += f"요일: {current_date_time.strftime('%A')}\n"
    data += f"일자: {current_date_time.strftime('%d')}\n"
    data += f"월: {current_date_time.strftime('%B')}\n"
    data += f"연도: {current_date_time.strftime('%Y')}\n"
    data += f"시간: {current_date_time.strftime('%H')}시 {current_date_time.strftime('%M')}분 {current_date_time.strftime('%S')}초\n"
    return data

# ────────────────────────────────────────────────────────────────────────────────────
# 4) RealtimeSearchEngine 함수
#    - 역할: 채팅 로그 로드, 사용자 메시지 추가, 구글 검색 결과 삽입 후
#            Groq LLM에 스트리밍 요청하고 응답 저장/반환
#    - Args:
#        prompt (str): 사용자 입력 프롬프트
#    - Returns:
#        str: 정제된 LLM 응답 문자열
# ────────────────────────────────────────────────────────────────────────────────────
def RealtimeSearchEngine(prompt):
    global SystemChatBot, messages
    with open("Data/ChatLog.json", "r", encoding="utf-8") as f:
        messages = load(f)
    messages.append({"role": "user", "content": prompt})
    
    # 구글 검색 결과 추가
    SystemChatBot.append({"role": "assistant", "content": GoogleSearch(prompt)})
    
    completion = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=SystemChatBot + [{"role": "system", "content": Information()}] + messages,
        temperature=0.7,
        max_tokens=2048,
        top_p=1,
        stream=True,
        stop=None
    )
    Answer = ""
    for chunk in completion:
        if chunk.choices[0].delta.content:
            Answer += chunk.choices[0].delta.content
    Answer = Answer.strip().replace("</s>", "")
    messages.append({"role": "assistant", "content": Answer})
    with open("Data/ChatLog.json", "w", encoding="utf-8") as f:
        dump(messages, f, indent=4)
    SystemChatBot.pop()  # 추가된 시스템 메시지 제거
    return AnswerModifier(Answer=Answer)

# ────────────────────────────────────────────────────────────────────────────────────
# 5) 스크립트 직접 실행용 엔트리포인트
#    - 반복 입력을 받아 RealtimeSearchEngine 결과 출력
# ────────────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    while True:
        prompt = input("질문을 입력하세요: ")
        print(RealtimeSearchEngine(prompt))