# 백엔드 세팅 & 실행.

## 주의)무조건 가상환경내에서 작업해야함. 의존성 혼탁해지는걸 막기위해

## 1) 백엔드 디렉터리로 이동
```
cd backend
```
※ backend 폴더 안에 .env 파일이 배치되어있어야한다. env파일의 양식은 다음과 같다.
```
CohereAPIKey = 
Username = 
Assistantname = 
GroqAPIKey =
GOOGLE_MAPS_API_KEY = 
OPENAI_API_KEY =
```

## 2) 가상환경 삭제
.venv 폴더를 삭제한다.

## 3) 가상환경 설치
```
python -m venv .venv
```

## 4)가상환경 활성화
```
.\.venv\Scripts\activate
```

## 5) 의존성 설치
```
pip install -r Requirements.txt
```
## 6) 서버 실행
python으로 실행하고 싶을 경우
```
python app.py
```
<br>
unicorn으로 실행하고 싶을 경우

```
uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```

<br>
<br>

---

# 프론트엔드 세팅 & 실행

## 1) 프론트엔드 디렉터리로 이동
```
cd frontend
```
## 2) 의존성 설치
```
npm run setup:npm
```
> mac
```
yarn setup:yarn
```
## 3) 개발 서버 실행
```
npm run dev
```
> mac
```
yarn dev
```
<br>
<br>

---

# 배포 절차

## 백엔드

pip freeze > requirements.txt

## 프론트엔드

### 빌드 후 node_modules 제거

npm run build `mac : yarn build`<br>
Remove-Item -Recurse -Force .\node_modules `MAC : rm -rf node_modules`