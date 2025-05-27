/* -----------------------------------------------------------------------------------
 * 파일 이름    : ProfilePage.jsx
 * 설명         : 사용자 프로필 페이지 컴포넌트 - 아바타 업로드, 사용자 정보 및 계정 상태 표시
 * 주요 기능    :
 *   1) 프로필 사진 업로드 및 미리보기
 *   2) 사용자 이름, 이메일 정보 표시
 *   3) 친구 목록 생성일 및 계정 상태 표시
 * ----------------------------------------------------------------------------------- */
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Camera, User, Mail } from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────────────
// 2) ProfilePage 컴포넌트
//    - 역할  : 로그인된 사용자 프로필 화면 렌더링, 프로필 사진 변경, 사용자 정보 및 계정 상태 표시
// ────────────────────────────────────────────────────────────────────────────────────
const ProfilePage = () => {
	const { authUser, isUpdatingProfile, updateProfile }= useAuthStore();
	const [selectedImg, setSelectedImg] = useState(null);

	// ────────────────────────────────────────────────────────────────────────────────────
	// 1) handleImageUpload 함수
	//    - 역할  : 사용자가 선택한 이미지 파일을 Base64로 변환하여 미리보기 및 프로필 업데이트 호출
	//    - Args  : e (Event): input[type="file"] change 이벤트
	//    - 내부 처리:
	//        1) 파일이 없으면 리턴
	//        2) FileReader로 Base64 읽기
	//        3) reader.onload 시 Base64 문자열 상태에 저장 및 updateProfile 호출
	// ────────────────────────────────────────────────────────────────────────────────────
	const handleImageUpload = async(e) => {
		const file = e.target.files[0];
		if(!file) return;

		const reader = new FileReader();

		reader.readAsDataURL(file);

		reader.onload = async () => {
			const base64Image = reader.result;
			setSelectedImg(base64Image);
			await updateProfile({ profilePic: base64Image });
		}
	};

	return (
		<div className='h-screen pt-20'>
			<div className='max-w-2xl mx-auto p-4 py-8'>
				<div className='bg-base-300 rounded-xl p-6 space-y-8'>
					<div className='text-center'>
						<h1 className='text-2xl font-semibold'>프로필</h1>
						<p className='mt-2'>내 프로필 정보</p>
					</div>

					{/* 아바타 업로드 */}
					<div className='flex flex-col items-center gap-4'>
						<div className='relative'>
							<img
								src={selectedImg || authUser.profilePic || "/avatar.png"}
								alt='Profile'
								className='size-32 rounded-full object-cover border-4'
							/>
							<label
								htmlFor='avatar-upload'
								className={`absolute bottom-0 right-0 bg-base-content hover:scale-105
									p-2 rounded-full cursor-pointer transition-all duration-200 
									${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
								`}
							>
								<Camera className='w-5 h-5 text-base-200' />
								<input
									type='file'
									id='avatar-upload'
									className='hidden'
									accept='image/*'
									onChange={handleImageUpload}
									disabled={isUpdatingProfile}
								/>
							</label>
						</div>
						<p className='text-sm text-zinc-400'>
							{isUpdatingProfile ? "업로드 중..." : "카메라 아이콘을 클릭해 사진을 변경하세요"}
						</p>
					</div>

					<div className='space-y-6'>
						<div className='space-y-1.5'>
							<div className='text-sm text-zinc-400 flex items-center gap-2'>
								<User className='w-4 h-4' />
								이름
							</div>
							<p className='px-4 py-2.5 bg-base-200 rounded-lg border'>{authUser?.fullName}</p>
						</div>

						<div className='space-y-1.5'>
							<div className='text-sm text-zinc-400 flex items-center gap-2'>
								<Mail className='w-4 h-2' />
								이메일 주소
							</div>
							<p className='px-4 py-2.5 bg-base-200 rounded-lg border'>{authUser?.email}</p>
						</div>
					</div>

					<div className='mt-6 bg-base-300 rounded-xl p-6'>
						<h2 className='text-lg font-medium mb-4'>계정 정보</h2>
						<div className='space-y-3 text-sm'>
							<div className='flex items-center justify-between py-2 border-b border-zinc-700'>
								<span>친구 목록</span>
								<span>{authUser.createAt?.split("T")[0]}</span>
							</div>
							<div className='flex items-center justify-between py-2'>
								<span>계정 상태</span>
								<span className='text-green-500'>활성화</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProfilePage