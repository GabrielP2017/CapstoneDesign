/* -----------------------------------------------------------------------------------
 * 파일 이름    : HomePage.jsx
 * 설명         : 홈 페이지 컴포넌트 - 사이드바 및 채팅 컨테이너/웰컴 화면 구성
 * 주요 기능    :
 *   1) getUsers 호출 및 선택 사용자 초기화
 *   2) users 데이터 변경 시 첫 사용자 자동 선택
 *   3) Sidebar, NoChatSelected, ChatContainer 컴포넌트 배치
 * ----------------------------------------------------------------------------------- */
import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { motion } from "framer-motion";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) 상태 및 ref 정의
//    - selectedUser, users, setSelectedUser, getUsers 훅 가져오기
//    - isLoadedRef: 초기 로드 여부 체크용 ref
// ────────────────────────────────────────────────────────────────────────────────────
const HomePage = ({ shiftLeft }) => {
  const { currentSessionId, getSessions } = useChatStore();

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
    <div className="h-screen bg-base-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: 0 }}
        animate={{ opacity: 1, scale: 1, x: shiftLeft ? -120 : 0 }}  // ← animate x가 동적이어야 함!
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center justify-center pt-20 px-4"
      >
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!currentSessionId ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default HomePage;
