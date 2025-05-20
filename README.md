# 백엔드 세팅 & 실행

## 1) 백엔드 디렉터리로 이동

cd backend

## 2) 의존성 설치

pip install -r Requirements.txt

## 3) 서버 실행

### (앱 파일명이 app.py인 경우)

uvicorn app:app --host 0.0.0.0 --port 5000 --reload

<br>
<br>

---

# 프론트엔드 세팅 & 실행

## 1) 프론트엔드 디렉터리로 이동

cd frontend

## 2) 의존성 설치

npm run setup:npm `mac : yarn setup:yarn`

## 3) 개발 서버 실행

npm run dev `mac : yarn dev`

<br>
<br>

---

# 배포 절차

## 백엔드

1. pip install pipreqs

2. pipreqs . --force --encoding=utf-8

## 프론트엔드

### 빌드 후 node_modules 제거

npm run build `mac : yarn build`<br>
Remove-Item -Recurse -Force .\node_modules `MAC : rm -rf node_modules`
