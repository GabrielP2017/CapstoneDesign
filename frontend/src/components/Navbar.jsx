/* -----------------------------------------------------------------------------------
 * 파일 이름    : Navbar.jsx
 * 설명         : 상단 네비게이션 바 컴포넌트 - 홈 로고, 설정 및 로그아웃 버튼 제공
 * 주요 기능    :
 * 1) 홈 링크(로고) 렌더링
 * 2) 설정 페이지 링크 렌더링
 * 3) 인증된 사용자에 한해 로그아웃 버튼 렌더링
 * 4) 즐겨찾기 목록 렌더링
 * 5) 즐겨찾기 목록에서 장소 클릭 시 모달창으로 지도 출력
 * ----------------------------------------------------------------------------------- */
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"
import { LogOut, MessageSquare, Settings, User, Star } from "lucide-react";
import FavoritesList from './BookmarkList';
import React, { useState } from 'react';
import { AnimatePresence } from "framer-motion";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) 상태 및 함수 가져오기
//    - useAuthStore로 authUser(인증 정보) 및 logout 함수 가져오기
//    - useState(false)로 즐겨찾기 목록 표시(toggle 형태로 true일때 목록 표시)(5월 6일 추가)
// ────────────────────────────────────────────────────────────────────────────────────
const Navbar = ({ onPlaceClick, onSettingsClick }) => {
	const { logout, authUser } = useAuthStore();

	const [isFavoritesListVisible, setIsFavoritesListVisible] = useState(false);
    const toggleFavoritesList = () => {
        setIsFavoritesListVisible(!isFavoritesListVisible);
    };

	// ──────────────────────────────────────────────────────────────────────────────────
	// 2) JSX 반환
	//    - 헤더 요소로 네비게이션 바 구성
	//    - 홈 로고: Link to "/"
	//    - 설정 버튼: 모든 사용자에게 노출
	//    - 인증된 사용자에게만 로그아웃 버튼 노출
	//    - 마찬가지로 즐겨찾기 버튼 노출(5월 6일 추가)
	// ──────────────────────────────────────────────────────────────────────────────────
	return (
		<header
			className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40
			backdrop-blur-lg bg-base-100/80"
		>
			<div className="container mx-auto px-4 h-16">
				<div className="flex items-center justify-between h-full">
					<div className="flex items-center gap-8">
						<Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
							<div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
							<img
								src="/public/logo2.png" // 이미지 경로를 여기에 넣으세요
								alt="description"
								className="w-12 h-12 object-contain"
							/>
							</div>
							<h1 className="text-lg font-bold">마음맛집</h1>
						</Link>
					</div>
					{/* 설정창 */ }
					<div className="flex items-center gap-3">
					<button onClick={onSettingsClick} className="btn btn-sm gap-2 transition-colors">
						<Settings className="w-4 h-4" />
						<span className="hidden sm:inline">테마</span>
					</button>

						{/*5월 6일 추가 */}
						{
							authUser&&(
										
								<div className="relative">
								<button className="btn btn-sm gap-2" onClick={toggleFavoritesList}>
										<Star className="size-5" />
										<span className="hidden sm:inline">즐겨찾기</span>
								</button>
								<AnimatePresence>
								{isFavoritesListVisible && (
								<FavoritesList
								onClose={toggleFavoritesList}
								onPlaceClick={onPlaceClick}
								/>
								)}</AnimatePresence>
				</div>  		
							)
						}

						{authUser && (
							<>
								{/* <Link to={"/profile"} className={`btn btn-sm gap-2`}>
									<User className="size-5" />
									<span className="hidden sm:inline">프로필</span>
								</Link> */}
								{/* <div className={`btn btn-sm gap-2`}>
									<User className="size-5" />
									<span className="hidden sm:inline">저장</span>
								</div> */}

								<button className="flex gap-2 items-center" onClick={logout}>
									<LogOut className="size-5" />
									<span className="hidden sm:inline text-sm">로그아웃</span>
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}

export default Navbar