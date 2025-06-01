/* -----------------------------------------------------------------------------------
 * 파일 이름    : HomePage.jsx
 * 설명         : 홈 페이지 컴포넌트 - 사이드바 및 채팅 컨테이너/웰컴 화면 구성
 * 주요 기능    :
 *   1) getUsers 호출 및 선택 사용자 초기화
 *   2) users 데이터 변경 시 첫 사용자 자동 선택
 *   3) Sidebar, NoChatSelected, ChatContainer 컴포넌트 배치
 * ----------------------------------------------------------------------------------- */
import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) 상태 및 ref 정의
//    - selectedUser, users, setSelectedUser, getUsers 훅 가져오기
//    - isLoadedRef: 초기 로드 여부 체크용 ref
// ────────────────────────────────────────────────────────────────────────────────────
const HomePage = ({ shiftLeft }) => {
  const { currentSessionId, getSessions } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { authUser } = useAuthStore();
  const isLoadedRef = useRef(false);
  

  // ──────────────────────────────────────────────────────────────────────────────────
  // 2) useEffect: 컴포넌트 마운트 시 사용자 목록 로드 및 선택 초기화
  // ──────────────────────────────────────────────────────────────────────────────────
  //   useEffect(() => {
  //     getSessions();
  //   }, []);

  // ──────────────────────────────────────────────────────────────────────────────────
  // 4) useEffect: 첫 렌더링 완료 시 플래그 설정
  // ──────────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    isLoadedRef.current = true;
  }, []);

  return (
    <>
      {/* ✅ PC 화면 전용 */}
      <div className="hidden md:flex h-screen bg-base-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 0 }}
          animate={{ opacity: 1, scale: 1, x: shiftLeft ? -120 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-center pt-20 px-4 w-full"
        >
          <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
            <div className="flex h-full rounded-lg overflow-hidden">
              <Sidebar />
              {!currentSessionId ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </motion.div>
      </div>
{/* ✅ 모바일 화면 전용 */}
<div className="flex md:hidden h-screen w-screen relative overflow-hidden">
  {/* 사이드바 오픈 버튼 */}
  <button
    className="fixed top-5 left-4 z-40 "
    onClick={() => setSidebarOpen(true)}
  >
    <Menu size={24} />
  </button>

  {/* 사이드바 오버레이 */}
  <AnimatePresence>
  {sidebarOpen && (
    <motion.div
      key="mobile-sidebar-wrapper"
      className="fixed inset-0 z-[998]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        // 바깥 클릭 시 닫힘, 안쪽 클릭 무시
        if (e.target === e.currentTarget) setSidebarOpen(false);
      }}
    >
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-full w-[280px] max-w-[80%] bg-white shadow-xl flex flex-col"
      >
        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


  {/* 채팅 or 노채팅 선택 화면 */}
  <div className="flex-1 min-w-0 flex flex-col h-full bg-white overflow-y-auto">
    {!currentSessionId ? <NoChatSelected /> : <ChatContainer />}
  </div>
</div>

    </>
  );
};
export default HomePage;
