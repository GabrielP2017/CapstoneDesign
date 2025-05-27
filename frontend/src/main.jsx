/* -----------------------------------------------------------------------------------
 * 파일 이름    : main.jsx
 * 설명         : React 애플리케이션 진입점 - 걍 메인페이지라 생각하면 됨.
 * 주요 기능    :
 *   1) CSS 및 App 컴포넌트 불러오기
 *   2) BrowserRouter로 애플리케이션 라우팅 설정
 *   3) React 18 createRoot API를 사용한 렌더링
 * ----------------------------------------------------------------------------------- */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom';

// ────────────────────────────────────────────────────────────────────────────────────
// 1) React 애플리케이션 렌더링
//    - StrictMode는 임시로 해제된 상태
//    - BrowserRouter로 App 컴포넌트를 감싸 클라이언트 측 라우팅 설정
// ────────────────────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')).render(
  //<StrictMode> 임시로 해제함
		<BrowserRouter>
			<App />
		</BrowserRouter>
  //</StrictMode>,
)
