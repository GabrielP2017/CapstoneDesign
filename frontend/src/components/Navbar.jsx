/* -----------------------------------------------------------------------------------
 * 파일 이름    : Navbar.jsx
 * 설명         : 상단 네비게이션 바 컴포넌트 - 홈 로고, 설정 및 로그아웃 버튼 제공
 * 주요 기능    :
 * 1) 홈 링크(로고) 렌더링
 * 2) 설정 페이지 링크 렌더링
 * 3) 인증된 사용자에 한해 로그아웃 버튼 렌더링
 * 4) 즐겨찾기 목록 렌더링
 * 5) 즐겨찾기 목록에서 장소 클릭 시 모달창으로 지도 출력
 * 6) 위치 설정 버튼 및 주소 입력 모달 추가
 *    - 주소 입력 시 Zustand 전역 상태에 저장
 * 7) 최근 검색어 localStorage 저장 기능
 *    - 최대 5개까지 저장, 중복 제거
 *    - 입력창 위에 버튼 형태로 출력
 *    - 각 주소 옆에 ✕ 버튼으로 개별 삭제 가능
 * ----------------------------------------------------------------------------------- */
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, Settings, Star, MapPin, Info } from "lucide-react";
import FavoritesList from "./BookmarkList";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationStore } from "../store/useLocationStore";
import HelpModal from "./HelpModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const setLocation = useLocationStore((state) => state.setLocation);

  const [recentLocations, setRecentLocations] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const match = document.cookie.match(/user_location=([^;]+)/);
    if (match) {
      const decoded = decodeURIComponent(match[1].replace(/"/g, ""));
      setLocation(decoded); // Zustand 초기화
    }
  }, []);

  const saveToRecentLocations = (newAddress) => {
    const key = "recentLocations";
    const existing = JSON.parse(localStorage.getItem(key)) || [];
    const updated = [newAddress, ...existing.filter((loc) => loc !== newAddress)].slice(0, 5);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  useEffect(() => {
    if (isModalOpen) {
      const stored = JSON.parse(localStorage.getItem("recentLocations")) || [];
      setRecentLocations(stored);
    }
  }, [isModalOpen]);

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
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all md:flex"
          >
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center md:flex hidden">
              <img src="/newlogo2.png" alt="description" className="w-7 h-7 object-contain" />
            </div>
            <h1 className="text-lg font-bold hidden md:block">마음맛집</h1>
          </Link>
          </div>
          {/* 설정창 */}
          <div className="flex items-center gap-3">
            <button className="btn btn-sm gap-2" onClick={() => setIsHelpModalOpen(true)}>
              <Info className="w-4 h-4" />
            </button>

            {authUser && (
              <button className="btn btn-sm gap-2" onClick={() => setIsModalOpen(true)}>
                <MapPin className="size-4" />
                <span className="hidden sm:inline">위치</span>
              </button>
            )}
            <button onClick={onSettingsClick} className="btn btn-sm gap-2 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">테마</span>
            </button>

            {/*5월 6일 추가 */}
            {authUser && (
              <div className="relative">
                <button className="btn btn-sm gap-2" onClick={toggleFavoritesList}>
                  <Star className="size-5" />
                  <span className="hidden sm:inline">즐겨찾기</span>
                </button>
                <AnimatePresence>{isFavoritesListVisible && <FavoritesList onClose={toggleFavoritesList} onPlaceClick={onPlaceClick} />}</AnimatePresence>
              </div>
            )}

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
      {isModalOpen && (
        <div
          className="fixed w-screen h-screen inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <AnimatePresence>
            <motion.div
              key="location-modal"
              className="w-[80%] max-w-[400px] bg-base-200 rounded-lg shadow-lg p-6 z-[1001] outline-none"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <h2 className="text-lg font-bold mb-4">주소를 입력하세요</h2>
              <input
                ref={inputRef}
                type="text"
                placeholder="주소입력"
                className="input input-bordered w-full mb-2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setLocation(inputValue);
                    saveToRecentLocations(inputValue);
                    document.cookie = `user_location=${encodeURIComponent(inputValue)}; path=/`;
                    setIsModalOpen(false);
                  }
                }}
              />
              {recentLocations.length > 0 && (
                <div className="mb-3">
                  <ul className="flex flex-wrap gap-2">
                    {recentLocations.map((addr, i) => (
                      <div key={i} className="flex items-center px-2 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">
                        <button
                          onClick={() => {
                            setInputValue(addr);
                            setTimeout(() => {
                              inputRef.current?.focus();
                            }, 0);
                          }}
                          className="mr-1 text-sm"
                        >
                          {addr}
                        </button>
                        <button
                          onClick={() => {
                            const updated = recentLocations.filter((a) => a !== addr);
                            setRecentLocations(updated);
                            localStorage.setItem("recentLocations", JSON.stringify(updated));
                          }}
                          className="ml-1 text-xs text-gray-500 hover:text-red-500"
                          title="삭제"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button className="btn btn-sm" onClick={() => setIsModalOpen(false)}>
                  취소
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    setLocation(inputValue);
                    saveToRecentLocations(inputValue);
                    document.cookie = `user_location=${encodeURIComponent(inputValue)}; path=/`;
                    setIsModalOpen(false);
                  }}
                >
                  확인
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </header>
  );
};

export default Navbar;
