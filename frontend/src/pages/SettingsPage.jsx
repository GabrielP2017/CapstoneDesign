/* -----------------------------------------------------------------------------------
 * 파일 이름    : SettingsPage.jsx
 * 설명         : 설정 페이지 컴포넌트 - 테마 선택
 * 주요 기능    :
 *   1) useThemeStore로 현재 테마(theme)와 변경 함수(setTheme) 가져오기
 *   2) THEMES 배열 기반 테마 색상 버튼 렌더링 및 선택 처리
 * ----------------------------------------------------------------------------------- */
import React from 'react'
import {THEMES} from '../constants';
import { useThemeStore } from '../store/useThemeStore';

// ────────────────────────────────────────────────────────────────────────────────────
// 1) SettingsPage 컴포넌트 정의
//    - 역할: 사용자에게 테마 선택 UI 제공
// ────────────────────────────────────────────────────────────────────────────────────
const SettingsPage = ({ onClose }) => {
	const { theme, setTheme } = useThemeStore();

	return (
		<div className='min-h-screen max-h-screen overflow-y-auto container mx-auto px-4 max-w-5xl'>
			<div className='space-y-6'>
			<div className="relative">
				<button
					onClick={onClose}
					className="absolute top-1 right-0 text-3xl font-bold hover:opacity-80"
				>
					x
				</button>
				<div className="pt-4 pr-10">
				<h2 className="text-2xl font-bold text-left mt-4">테마</h2>
				<p className="text-sm text-base-content/70 text-left mt-4 mb-8">
					마음에 드는 색상을 골라 채팅창을 꾸며보세요!
					</p>
				</div>
				</div>
				<div className="grid grid-cols-4 gap-2 mt-4">
					{THEMES.map((t) => (
						<button
							key={t}
							className={`
							w-full min-w-[80px] flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
							${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}
							`}
							onClick={() => setTheme(t)}
						>					  
							<div className='relative h-8 w-full rounded-md overflow-hidden' data-theme={t}>
								<div className='absolute inset-0 grid grid-cols-4 gap-px p-1'>
									<div className='rounded bg-primary'></div>
									<div className='rounded bg-secondary'></div>
									<div className='rounded bg-accent'></div>
									<div className='rounded bg-neutral'></div>
								</div>
							</div>
							<span className='text-[11px] font-medium truncate w-full text-center'>
								{t.charAt(0).toUpperCase() + t.slice(1)}
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

export default SettingsPage