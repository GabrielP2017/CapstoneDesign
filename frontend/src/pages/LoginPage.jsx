/* -----------------------------------------------------------------------------------
 * 파일 이름    : LoginPage.jsx
 * 설명         : 로그인 페이지 컴포넌트 - 이메일/비밀번호 입력 및 로그인 처리, 인증 배경 패턴 표시
 * 주요 기능    :
 *   1) 이메일·비밀번호 입력 상태 관리 및 폼 제출 처리
 *   2) 패스워드 가시성 토글 기능
 *   3) 로그인 로딩 상태 표시
 *   4) AuthImagePattern으로 시각적 배경 패턴 렌더링
 * ----------------------------------------------------------------------------------- */
import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

import AuthImagePattern from "../components/AuthImagePattern";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) 상태 정의 및 훅 가져오기
//    - showPassword (boolean): 패스워드 입력 가시성 토글
//    - formData (object): email, password 상태 관리
//    - login (function), isLoggingIn (boolean): 인증 처리 및 로딩 플래그
// ────────────────────────────────────────────────────────────────────────────────────
const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();

  const subtitles = [
    "오늘 당신의 기분, 어떤 맛으로 위로받고 싶으신가요?",
    "이 사이트는 체험용 데모입니다. \n실제 정보 없이 자유롭게 이용해보세요.",
    "감정에 따라 음식이 추천되고, \n가까운 맛집까지 한눈에 확인할 수 있어요.",
    "기분에 맞춰 맛집을 추천해주는 맞춤형 AI 검색 서비스입니다."
  ];
  
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
    }, 3000); // 3초 간격
    return () => clearInterval(interval);
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  // ──────────────────────────────────────────────────────────────────────────────────
  // 3) JSX 반환
  //    - 레이아웃: lg:grid-cols-2로 좌우 분할
  //    - 왼쪽: 로그인 폼 (로고, 이메일/비밀번호 입력, 로그인 버튼, 회원가입 링크)
  //    - 오른쪽: AuthImagePattern 컴포넌트 렌더링
  // ──────────────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen grid lg:grid-cols-2">
      {/* 왼쪽 화면 */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* 로고 */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <img src="/newlogo2.png" alt="description" className="w-9 h-9 object-contain" />
              </div>
              <h1 className="text-2xl font-bold mt-2">환영합니다</h1>
              <p className="text-base-content/60">로그인 정보를 입력하세요</p>
            </div>
          </div>

          {/* 로그인 화면 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm font-medium">이메일</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 z-10 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            {/* 패스워드 입력 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm font-medium">패스워드</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 z-10 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5 text-base-content/40" /> : <Eye className="h-5 w-5 text-base-content/40" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "로그인 하기"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              계정이 없으신가요?{" "}
              <Link to="/signup" className="link link-primary">
                계정 생성하기
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 오른쪽 화면 (PC 전용) */}
      <div className="hidden lg:block">
        <AuthImagePattern
          title={"마음맛집에 오신걸 환영합니다!"}
          subtitle={subtitles[subtitleIndex]}
        />
      </div>
    </div>
  ); 
};

export default LoginPage;
