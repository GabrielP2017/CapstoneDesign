<<<<<<< HEAD
# -----------------------------------------------------------------------------------
# 파일 이름   : chatbot_main.py
# 설명        : Groq API 기반의 한국어 대화형 AI 챗봇 메인 스크립트
# 주요 기능   :
#   1) .env 파일에서 사용자 및 AI 정보(Username, Assistantname, API 키) 로드
#   2) 기존 채팅 로그를 JSON 파일(Data/ChatLog.json)에서 읽고 관리
#   3) 현재 시각 및 요일 등 실시간 정보를 한글 포맷으로 제공
#   4) 사용자 질문을 Groq LLM에 전달해 스트리밍 응답 수신
#   5) AI 응답 후 불필요 문자를 정제하고 채팅 로그에 저장
#   6) 예외 발생 시 로그 초기화 후 재시도
# 요구 모듈   : groq, python-dotenv, datetime, json, re
# -----------------------------------------------------------------------------------

from groq import Groq
from json import load, dump
import datetime
import re
from dotenv import dotenv_values

# ────────────────────────────────────────────────────────────────────────────────────
# 1) 환경 변수 로드
#    - .env 파일에서 Username, Assistantname, GroqAPIKey 읽어오기
#    - Groq 클라이언트 초기화
# ────────────────────────────────────────────────────────────────────────────────────
env_vars = dotenv_values(".env")
Username = env_vars.get("Username")
Assistantname = env_vars.get("Assistantname")
GroqAPIKey = env_vars.get("GroqAPIKey")
client = Groq(api_key=GroqAPIKey)

# ────────────────────────────────────────────────────────────────────────────────────
# 2) 시스템 메시지 초기화
#    - AI 챗봇의 역할, 언어, 응답 방식 등을 정의한 시스템 메시지
# ────────────────────────────────────────────────────────────────────────────────────

System = f"""안녕하세요, 저는 {Username}입니다. 당신은 {Assistantname}이라는 이름의 AI 챗봇입니다.
*** 당신은 친절한 한국어 대화형 AI 어시스턴트입니다. ***
*** 모든 답변은 한국어로 작성해주세요. ***
*** 사용자의 질문에 대해 자연스럽고 상세한 답변을 제공합니다. ***
"""
SystemChatBot = [
    {"role": "system", "content": System}
]

# ────────────────────────────────────────────────────────────────────────────────────
# 3) 채팅 로그 파일 초기화
#    - Data/ChatLog.json 파일이 없으면 새로 생성, 있으면 기존 내용을 로드
# ────────────────────────────────────────────────────────────────────────────────────
messages = []

try:
    with open("Data/ChatLog.json", "r", encoding="utf-8") as f:
        messages = load(f)
except FileNotFoundError:
    with open("Data/ChatLog.json", "w", encoding="utf-8") as f:
        dump([], f)

# ────────────────────────────────────────────────────────────────────────────────────
# 4) RealtimeInformation 함수
#    - 현재 시각과 요일을 한글 포맷으로 리턴
#    - AI 프롬프트에 포함시켜 실시간 참조 정보로 사용
# ────────────────────────────────────────────────────────────────────────────────────
def RealtimeInformation():
    days_kor = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
    current_date_time = datetime.datetime.now()

    data = "필요시 사용할 실시간 정보:\n"
    data += f"요일: {days_kor[current_date_time.weekday()]}\n"
    data += f"일자: {current_date_time.year}년 {current_date_time.month}월 {current_date_time.day}일\n"
    data += f"시간: {current_date_time.hour}시 {current_date_time.minute}분 {current_date_time.second}초\n"
    return data

# ────────────────────────────────────────────────────────────────────────────────────
# 5) AnswerModifier 함수
#    - AI가 생성한 응답에서 특수문자를 제거하고
#      빈 줄·공백을 정리한 후 반환
# ────────────────────────────────────────────────────────────────────────────────────
def AnswerModifier(Answer):
    Answer = re.sub(r'[^\uAC00-\uD7A30-9a-zA-Z\s.,!?~():-]', '', Answer)

    lines = Answer.split('\n')
    non_empty_lines = [line.strip() for line in lines if line.strip()]
    modified_answer = "\n".join(non_empty_lines)
    return modified_answer

# ────────────────────────────────────────────────────────────────────────────────────
# 6) Chatbot 함수
#    - 사용자 질문을 받아 Groq LLM에 전송하고 스트리밍으로 응답 수신
#    - 메시지를 채팅 로그에 저장하고 후처리 후 반환
#    - 예외 발생 시 로그 초기화 후 재귀 호출로 재시도
# ────────────────────────────────────────────────────────────────────────────────────
def Chatbot(Query):
    try:
        with open("Data/ChatLog.json", "r", encoding="utf-8") as f:
            messages = load(f)
        messages.append({"role": "user", "content": Query})
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=SystemChatBot + [{"role": "system", "content": RealtimeInformation()}] + messages,
            max_tokens=1024,
            temperature=0.7,
            top_p=1,
            stream=True,
            stop=None
        )
        Answer = ""
        for chunk in completion:
            if chunk.choices[0].delta.content:
                Answer += chunk.choices[0].delta.content
        Answer = Answer.replace("</s>", "")
        messages.append({"role": "assistant", "content": Answer})
        with open("Data/ChatLog.json", "w", encoding="utf-8") as f:
            dump(messages, f, indent=4)
        return AnswerModifier(Answer=Answer)
    except Exception as e:
        print(f"에러 발생: {e}")
        with open("Data/ChatLog.json", "w", encoding="utf-8") as f:
            dump([], f, indent=4)
        return Chatbot(Query)

# ────────────────────────────────────────────────────────────────────────────────────
# 7) 스크립트 직접 실행 시 반복 입력 루프
# ────────────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    while True:
        user_input = input("질문을 입력하세요: ")
        print(Chatbot(user_input))
=======
# -----------------------------------------------------------------------------------
# 파일 이름   : chatbot_main.py
# 설명        : Groq API 기반의 한국어 대화형 AI 챗봇 메인 스크립트
# 주요 기능   :
#   1) .env 파일에서 사용자 및 AI 정보(Username, Assistantname, API 키) 로드
#   2) 기존 채팅 로그를 JSON 파일(Data/ChatLog.json)에서 읽고 관리
#   3) 현재 시각 및 요일 등 실시간 정보를 한글 포맷으로 제공
#   4) 사용자 질문을 Groq LLM에 전달해 스트리밍 응답 수신
#   5) AI 응답 후 불필요 문자를 정제하고 채팅 로그에 저장
#   6) 예외 발생 시 로그 초기화 후 재시도
# 요구 모듈   : groq, python-dotenv, datetime, json, re
# -----------------------------------------------------------------------------------

from groq import Groq
from json import load, dump
import datetime
import re
from dotenv import dotenv_values

# ────────────────────────────────────────────────────────────────────────────────────
# 1) 환경 변수 로드
#    - .env 파일에서 Username, Assistantname, GroqAPIKey 읽어오기
#    - Groq 클라이언트 초기화
# ────────────────────────────────────────────────────────────────────────────────────
env_vars = dotenv_values(".env")
Username = env_vars.get("Username")
Assistantname = env_vars.get("Assistantname")
GroqAPIKey = env_vars.get("GroqAPIKey")
client = Groq(api_key=GroqAPIKey)

# ────────────────────────────────────────────────────────────────────────────────────
# 2) 시스템 메시지 초기화
#    - AI 챗봇의 역할, 언어, 응답 방식 등을 정의한 시스템 메시지
# ────────────────────────────────────────────────────────────────────────────────────

System = f"""안녕하세요, 저는 {Username}입니다. 당신은 {Assistantname}이라는 이름의 AI 챗봇입니다.
*** 당신은 친절한 한국어 대화형 AI 어시스턴트입니다. ***
*** 모든 답변은 한국어로 작성해주세요. ***
*** 사용자의 질문에 대해 자연스럽고 상세한 답변을 제공합니다. ***
"""
SystemChatBot = [
    {"role": "system", "content": System}
]

# ────────────────────────────────────────────────────────────────────────────────────
# 3) 채팅 로그 파일 초기화
#    - Data/ChatLog.json 파일이 없으면 새로 생성, 있으면 기존 내용을 로드
# ────────────────────────────────────────────────────────────────────────────────────
messages = []

try:
    with open("Data/ChatLog.json", "r", encoding="utf-8") as f:
        messages = load(f)
except FileNotFoundError:
    with open("Data/ChatLog.json", "w", encoding="utf-8") as f:
        dump([], f)

# ────────────────────────────────────────────────────────────────────────────────────
# 4) RealtimeInformation 함수
#    - 현재 시각과 요일을 한글 포맷으로 리턴
#    - AI 프롬프트에 포함시켜 실시간 참조 정보로 사용
# ────────────────────────────────────────────────────────────────────────────────────
def RealtimeInformation():
    days_kor = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"]
    current_date_time = datetime.datetime.now()

    data = "필요시 사용할 실시간 정보:\n"
    data += f"요일: {days_kor[current_date_time.weekday()]}\n"
    data += f"일자: {current_date_time.year}년 {current_date_time.month}월 {current_date_time.day}일\n"
    data += f"시간: {current_date_time.hour}시 {current_date_time.minute}분 {current_date_time.second}초\n"
    return data

# ────────────────────────────────────────────────────────────────────────────────────
# 5) AnswerModifier 함수
#    - AI가 생성한 응답에서 특수문자를 제거하고
#      빈 줄·공백을 정리한 후 반환
# ────────────────────────────────────────────────────────────────────────────────────
def AnswerModifier(Answer):
    Answer = re.sub(r'[^\uAC00-\uD7A30-9a-zA-Z\s.,!?~():-]', '', Answer)

    lines = Answer.split('\n')
    non_empty_lines = [line.strip() for line in lines if line.strip()]
    modified_answer = "\n".join(non_empty_lines)
    return modified_answer

# ────────────────────────────────────────────────────────────────────────────────────
# 6) Chatbot 함수
#    - 사용자 질문을 받아 Groq LLM에 전송하고 스트리밍으로 응답 수신
#    - 메시지를 채팅 로그에 저장하고 후처리 후 반환
#    - 예외 발생 시 로그 초기화 후 재귀 호출로 재시도
# ────────────────────────────────────────────────────────────────────────────────────
def Chatbot(Query):
    try:
        with open("Data/ChatLog.json", "r", encoding="utf-8") as f:
            messages = load(f)
        messages.append({"role": "user", "content": Query})
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=SystemChatBot + [{"role": "system", "content": RealtimeInformation()}] + messages,
            max_tokens=1024,
            temperature=0.7,
            top_p=1,
            stream=True,
            stop=None
        )
        Answer = ""
        for chunk in completion:
            if chunk.choices[0].delta.content:
                Answer += chunk.choices[0].delta.content
        Answer = Answer.replace("</s>", "")
        messages.append({"role": "assistant", "content": Answer})
        with open("Data/ChatLog.json", "w", encoding="utf-8") as f:
            dump(messages, f, indent=4)
        return AnswerModifier(Answer=Answer)
    except Exception as e:
        print(f"에러 발생: {e}")
        with open("Data/ChatLog.json", "w", encoding="utf-8") as f:
            dump([], f, indent=4)
        return Chatbot(Query)

# ────────────────────────────────────────────────────────────────────────────────────
# 7) 스크립트 직접 실행 시 반복 입력 루프
# ────────────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    while True:
        user_input = input("질문을 입력하세요: ")
        print(Chatbot(user_input))
>>>>>>> 5383d10 (최신)
