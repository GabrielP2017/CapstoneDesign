/* -----------------------------------------------------------------------------------
 * 파일 이름    : SignUpPage.jsx
 * 설명         : 회원가입 페이지 컴포넌트 - 이름, 이메일, 비밀번호 입력 및 계정 생성 처리, 인증 배경 패턴 표시
 * 주요 기능    :
 *   1) 이름, 이메일, 비밀번호 입력 상태 관리 및 유효성 검사
 *   2) 패스워드 가시성 토글 기능
 *   3) react-hot-toast를 이용한 입력 오류 알림
 *   4) 계정 생성 API 호출 및 로딩 상태 표시
 *   5) AuthImagePattern으로 시각적 배경 패턴 렌더링
 * ----------------------------------------------------------------------------------- */

import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { User, Mail, Lock, EyeOff, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) 상태 및 훅 정의
//    - showPassword (boolean): 비밀번호 가시성 토글
//    - formData (object): fullName, email, password 상태 관리
//    - signup (function), isSigningUp (boolean): 회원가입 처리 및 로딩 플래그
// ────────────────────────────────────────────────────────────────────────────────────
const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  // ──────────────────────────────────────────────────────────────────────────────────
  // 2) validateForm 함수
  //    - 역할: 입력값 검증 및 오류 시 toast 알림
  //    - Returns: 유효하면 true, 아니면 false
  // ────────────────────────────────────────────────────────────────────────────────────
  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("이름을 입력해주세요!");
    if (!formData.email.trim()) return toast.error("이메일을 입력해주세요!");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("이메일 형식이 올바르지 않습니다!");
    if (!formData.password) return toast.error("패스워드를 입력해주세요!");
    if (formData.password.length < 6) return toast.error("패스워드는 최소 6자 이상이어야 합니다!");

    return true;
  };

  // ──────────────────────────────────────────────────────────────────────────────────
  // 3) handleSubmit 함수
  //    - 역할: 폼 제출 시 validateForm 후 signup 호출
  //    - Args: e (Event) - form submit 이벤트
  // ────────────────────────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      signup({
        name: formData.fullName, // ✅ fullName을 name으로 매핑하여 백엔드에 전달
        email: formData.email,
        password: formData.password,
      });
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────────
  // 4) JSX 반환
  //    - 화면 왼쪽: 회원가입 폼 (로고, 입력 필드, 버튼, 로그인 링크)
  //    - 화면 오른쪽: AuthImagePattern 배경 컴포넌트
  // ────────────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* 왼쪽 화면 */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* 로고 */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
							group-hover:bg-primary/20 transition-colors"
              >
                <img
                  src="/newlogo2.png" // 이미지 경로를 여기에 넣으세요
                  alt="description"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold mt-2">계정 생성하기</h1>
              <p className="text-base-content/60">이 사이트는 데모용 체험 사이트입니다.<br/>
              실제로 사용하는 이메일이나 비밀번호는 입력하지 마세요.<br/>
              가상의 이메일과 비밀번호를 자유롭게 입력해 주세요.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이름 입력 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm font-medium">이름</span>
              </label>
              <div className="relative">
                <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="Your Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* 이메일 입력 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm font-medium">이메일</span>
              </label>
              <div className="relative">
                <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* 패스워드 입력 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm font-medium">패스워드</span>
              </label>
              <div className="relative">
                <div className="absolute z-10 inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                {/* 암호 숨기기 기능 버튼 */}
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="size-5 text-base-content/40" /> : <Eye className="size-5 text-base-content/40" />}
                </button>
              </div>
            </div>
            {/* 계정 생성 버튼 */}
            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "계정 만들기"
              )}
            </button>
          </form>
          {/* 로그인 화면 이동 링크 */}
          <div className="text-center">
            <p className="text-base-content/60">
              이미 계정이 있으신가요?{" "}
              <Link to="/login" className="link link-primary">
                로그인하기
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 오른쪽 화면 */}
      <AuthImagePattern title="당신의 하루를 마무리 하는 식사" subtitle="당신의 오늘을 알아채고, 가장 필요한 식사를 찾아드립니다" />
    </div>
  );
};

export default SignUpPage;
