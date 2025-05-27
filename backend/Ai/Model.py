# -----------------------------------------------------------------------------------
# 파일 이름   : Model.py
# 설명        : Cohere 기반 DMM(Dispatch Mapping Model) 모듈 – 입력 쿼리를 태스크별 명령어로 분류
# 주요 기능   :
#   1) .env 파일에서 Cohere API 키 로드 및 클라이언트 초기화
#   2) 태스크 키워드 목록 정의 및 대화 이력(preamble, ChatHistory) 설정
#   3) FirstLayerDMM 함수로 입력 쿼리 분류 및 태스크 리스트 반환
#   4) 스크립트 직접 실행 시 반복 입력으로 분류 결과 테스트
# 요구 모듈   : cohere, rich, python-dotenv, os, datetime
# -----------------------------------------------------------------------------------

import cohere 
from rich import print 
from dotenv import dotenv_values 

env_vars = dotenv_values(".env")
CohereAPIKey = env_vars.get("CohereAPIKey")
co = cohere.Client(api_key=CohereAPIKey)

# ────────────────────────────────────────────────────────────────────────────────────
# 1) 태스크 키워드 및 대화 이력 설정
#    - funcs: 지원하는 태스크 키워드 목록
#    - messages: 사용자 입력 이력 저장용 리스트
#    - preamble: DMM 분류용 시스템 프롬프트
#    - ChatHistory: 샘플 대화 히스토리
# ────────────────────────────────────────────────────────────────────────────────────
funcs = [
  "exit", "general", "realtime", "open", "close", "play",
  "generate image", "system", "content", "google search",
  "youtube search", "reminder"
]

messages = []

preamble = """
당신은 매우 정확한 결정 모델입니다. 주어진 쿼리가 어떤 종류의 작업인지 판단해주세요.
예를 들어,
- 최신 정보가 필요한 경우 'realtime (쿼리)'로 응답하세요.
- 일반 대화나 정보 제공의 경우 'general (쿼리)'로 응답하세요.
- 특정 애플리케이션 실행, 닫기, 음악 재생 등 작업 요청인 경우 해당 키워드를 사용하세요.
만약 판단이 어려운 경우 'general (쿼리)'로 응답합니다.
"""

ChatHistory = [
  {"role": "User", "message": "안녕하세요?"},
  {"role": "Chatbot", "message": "general 안녕하세요?"},
  {"role": "User", "message": "피자 좋아하세요?"},
  {"role": "Chatbot", "message": "general 피자 좋아하세요?"},
  {"role": "User", "message": "크롬 열고 세종대왕에 대해 알려주세요."},
  {"role": "Chatbot", "message": "open 크롬, general 세종대왕에 대해 알려주세요."},
  {"role": "User", "message": "크롬과 파이어폭스 열어줘"},
  {"role": "Chatbot", "message": "open 크롬, open 파이어폭스"},
  {"role": "User", "message": "오늘 날짜가 뭐고, 8월 5일 오후 11시에 댄스 공연이 있다고 알려줘"},
  {"role": "Chatbot", "message": "general 오늘 날짜, reminder 11:00 오후 8월 5일 댄스 공연"},
  {"role": "User", "message": "대화 좀 해줘"},
  {"role": "Chatbot", "message": "general 대화 좀 해줘"},
]

# ────────────────────────────────────────────────────────────────────────────────────
# 2) FirstLayerDMM 함수 정의
#    - 함수명: FirstLayerDMM
#    - 역할   : Cohere DMM 모델에 프롬프트 전송 후 태스크별로 분류된 리스트 반환
#    - Args   :
#        prompt (str): 분류할 사용자 입력 문자열
#    - Returns:
#        List[str]: '키워드 (파라미터)' 형식으로 분류된 태스크 문자열 리스트
# ────────────────────────────────────────────────────────────────────────────────────
def FirstLayerDMM(prompt: str = "test"):
    messages.append({"role": "user", "content": prompt})
    stream = co.chat_stream (
        model='command-r-plus', 
        message=prompt,
        temperature=0.7,
        chat_history=ChatHistory,
        prompt_truncation='OFF',
        connectors=[],
        preamble=preamble
    )
    response = ""
    for event in stream:
        if event.event_type == "text-generation":
            response += event.text
    response = response.replace("\n", "")
    response = response.split(",")
    response = [i.strip() for i in response]
    temp = []
    for task in response:
        for func in funcs:
            if task.startswith(func):
                temp.append(task)
    response = temp
    if "(query)" in response:
        newresponse = FirstLayerDMM(prompt=prompt)
        return newresponse
    else:
        return response
  
# ────────────────────────────────────────────────────────────────────────────────────
# 3) 스크립트 직접 실행용 엔트리포인트
#    - 사용자 입력을 받아 FirstLayerDMM 결과를 반복 출력
# ────────────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    while True:
        print(FirstLayerDMM(input(">>> ")))