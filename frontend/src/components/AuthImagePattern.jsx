/* -----------------------------------------------------------------------------------
 * 파일 이름    : AuthImagePattern.jsx
 * 설명         : 인증(로그인/회원가입) 페이지의 배경 패턴 생성 및 타이틀/서브타이틀 렌더링 컴포넌트
 * 주요 기능    :
 *   1) 3x3 그리드 패턴으로 배경 블록 렌더링
 *   2) title, subtitle props 기반 텍스트 중앙 정렬 표시
 *   3) 홀수 인덱스 블록에 pulse 애니메이션 적용
 * ----------------------------------------------------------------------------------- */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion";

/* ────────────────────────────────────────────────────────────────────────────────────
 * 1) AuthImagePattern 컴포넌트 정의
 *    - title (string): 메인 타이틀 텍스트
 *    - subtitle (string): 부제목 텍스트
 *    - 역할: 인증 페이지의 시각적 패턴 및 텍스트 렌더링
 * ──────────────────────────────────────────────────────────────────────────────────── */
const AuthImagePattern = ({ title, subtitle }) => {
	const [timeStr, setTimeStr] = useState("");
	const [dateStr, setDateStr] = useState("");
	const [isClockVisible, setIsClockVisible] = useState(true);

  
	useEffect(() => {
	  const interval = setInterval(() => {
		const now = new Date();
  
		const time = now.toLocaleTimeString("en-GB", {
		  hour: "2-digit",
		  minute: "2-digit",
		  second: "2-digit",
		  hour12: false,
		});
  
		const date = now.toLocaleDateString("en-GB", {
		  weekday: "long",
		  day: "numeric",
		  month: "numeric",
		  year: "numeric",
		}).replaceAll(",", "");
  
		setTimeStr(time);
		setDateStr(date);
	  }, 1000);
  
	  return () => clearInterval(interval);
	}, []);
	
	return (
		<div className="relative w-full h-full bg-base-200 overflow-hidden">
			<AnimatePresence mode="wait">
				{isClockVisible ? (
					<motion.div
						key="clock"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.4, ease: "easeInOut" }}
						onClick={() => setIsClockVisible(false)}
						className="absolute top-[49%] left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[90vw] max-w-xl h-[20rem] rounded-2xl
            flex flex-col items-center justify-center text-white shadow-xl cursor-pointer"

					>
					<div
						className="absolute rounded-full border-[14px] border-primary/5"
						style={{
							width: '1000px',
							height: '1000px',
							top: '150px',
							right: '-650px',
							zIndex: 0,
						}}
					/>
					<div className="absolute inset-0 bg-primary/10 rounded-md animate-pulse z-0" />
					<div
						className="absolute w-40 h-32 bg-primary/20 rounded-md animate-pulse"
						style={{ top: '-60px', right: '490px' }}
					/>
					<div className="relative z-10 text-center">
						<p className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold drop-shadow-lg">{timeStr}</p>
						<p className="text-sm md:text-base lg:text-xl mt-3 font-light tracking-wide drop-shadow-sm">{dateStr}</p>
					</div>
					</motion.div>
				) : (
					<motion.div
						key="cube"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.4, ease: "easeInOut" }}
						onClick={() => setIsClockVisible(true)}
						className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
									w-[36rem] h-[20rem] flex items-center justify-center cursor-pointer"
					>
					<div className="grid grid-cols-3 gap-4">
						{[...Array(9)].map((_, i) => (
						<div
							key={i}
							className={`w-35 h-35 rounded-2xl bg-primary/10 ${
							i % 2 === 0 ? "animate-pulse" : ""
							}`}
						/>
						))}
					</div>
					</motion.div>
				)}
			</AnimatePresence>
		{/* ✅ title/subtitle: 항상 아래 고정 */}
		<div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center px-2">
			<h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>
			<p className="text-sm sm:text-base text-base-content/60">{subtitle}</p>
		</div>
	  </div>
	  );
}
export default AuthImagePattern