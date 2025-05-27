<<<<<<< HEAD
/* -----------------------------------------------------------------------------------
 * 파일 이름    : App.jsx
 * 설명         : 애플리케이션 루트 컴포넌트 - 인증 상태 확인, 테마 적용, 라우팅 처리
 * 주요 기능    :
 *   1) useAuthStore로 인증 상태 확인 및 로딩 처리
 *   2) useThemeStore로 다크/라이트 테마 적용
 *   3) react-router-dom을 이용한 페이지 라우팅
 *   4) 전역 토스트(Toaster) 컴포넌트 렌더링
 *   5) 지도 모달 상태 전역 관리
 * ----------------------------------------------------------------------------------- */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import MapModal from "./components/MapModal";
import { motion, AnimatePresence } from "framer-motion";


import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import useBookmarkStore from "./store/useBookmarkStore";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) App 컴포넌트 정의
//    - 인증 상태 확인 및 로딩 처리
//    - 테마 적용(data-theme 속성 설정)
//    - 라우팅 및 전역 UI 컴포넌트 렌더링
// ────────────────────────────────────────────────────────────────────────────────────
const App = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPlaceName, setCurrentPlaceName] = useState("");
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { readBookmarks } = useBookmarkStore();
  const { theme } = useThemeStore();
  const [isSettingsOpen, setSettingsOpen] = useState(false);


  // ──────────────────────────────────────────────────────────────────────────────────
  // 2) useEffect: 마운트 시 한 번만 인증 상태 확인
  // ──────────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    readBookmarks();
  }, []);
  console.log({ authUser });

  // ──────────────────────────────────────────────────────────────────────────────────
  // 3) 로딩 스피너 표시
  //    - 인증 확인 중이고 인증된 사용자 정보가 없으면 전체 화면으로 스피너 렌더링
  // ──────────────────────────────────────────────────────────────────────────────────

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  // ──────────────────────────────────────────────────────────────────────────────────
  // 4) 메인 렌더링
  //    - data-theme으로 테마 적용
  //    - 네비게이션 바
  //    - 페이지 라우팅
  //    - 전역 Toaster 컴포넌트
  // ──────────────────────────────────────────────────────────────────────────────────
  return (
    <div data-theme={theme}>
      <Navbar
      onPlaceClick={(name) => {
        setCurrentPlaceName(name);
        setModalOpen(true);
      }}
      onSettingsClick={() => {
        setSettingsOpen(true);
      }}
    />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage shiftLeft={isSettingsOpen} /> : <Navigate to="/login" />}
        />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
      <MapModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        placeName={currentPlaceName}
      />

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 w-[450px] max-w-full h-full bg-base-100 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.1)] z-50"
          >
            <SettingsPage onClose={() => setSettingsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
=======
/* -----------------------------------------------------------------------------------
 * 파일 이름    : App.jsx
 * 설명         : 애플리케이션 루트 컴포넌트 - 인증 상태 확인, 테마 적용, 라우팅 처리
 * 주요 기능    :
 *   1) useAuthStore로 인증 상태 확인 및 로딩 처리
 *   2) useThemeStore로 다크/라이트 테마 적용
 *   3) react-router-dom을 이용한 페이지 라우팅
 *   4) 전역 토스트(Toaster) 컴포넌트 렌더링
 *   5) 지도 모달 상태 전역 관리
 * ----------------------------------------------------------------------------------- */

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import MapModal from "./components/MapModal";
import { motion, AnimatePresence } from "framer-motion";


import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import useBookmarkStore from "./store/useBookmarkStore";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) App 컴포넌트 정의
//    - 인증 상태 확인 및 로딩 처리
//    - 테마 적용(data-theme 속성 설정)
//    - 라우팅 및 전역 UI 컴포넌트 렌더링
// ────────────────────────────────────────────────────────────────────────────────────
const App = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPlaceName, setCurrentPlaceName] = useState("");
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { readBookmarks } = useBookmarkStore();
  const { theme } = useThemeStore();
  const [isSettingsOpen, setSettingsOpen] = useState(false);


  // ──────────────────────────────────────────────────────────────────────────────────
  // 2) useEffect: 마운트 시 한 번만 인증 상태 확인
  // ──────────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    readBookmarks();
  }, []);
  console.log({ authUser });

  // ──────────────────────────────────────────────────────────────────────────────────
  // 3) 로딩 스피너 표시
  //    - 인증 확인 중이고 인증된 사용자 정보가 없으면 전체 화면으로 스피너 렌더링
  // ──────────────────────────────────────────────────────────────────────────────────

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  // ──────────────────────────────────────────────────────────────────────────────────
  // 4) 메인 렌더링
  //    - data-theme으로 테마 적용
  //    - 네비게이션 바
  //    - 페이지 라우팅
  //    - 전역 Toaster 컴포넌트
  // ──────────────────────────────────────────────────────────────────────────────────
  return (
    <div data-theme={theme}>
      <Navbar
      onPlaceClick={(name) => {
        setCurrentPlaceName(name);
        setModalOpen(true);
      }}
      onSettingsClick={() => {
        setSettingsOpen(true);
      }}
    />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage shiftLeft={isSettingsOpen} /> : <Navigate to="/login" />}
        />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
      <MapModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        placeName={currentPlaceName}
      />

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 w-[450px] max-w-full h-full bg-base-100 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.1)] z-50"
          >
            <SettingsPage onClose={() => setSettingsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
>>>>>>> 5383d10 (최신)
