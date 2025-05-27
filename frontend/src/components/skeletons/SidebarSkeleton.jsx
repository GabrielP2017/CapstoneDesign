<<<<<<< HEAD
/* -----------------------------------------------------------------------------------
 * 파일 이름    : SidebarSkeleton.jsx
 * 설명         : 연락처 목록 로딩 시 표시할 사이드바 스켈레톤 UI 컴포넌트
 * 주요 기능    :
 *   1) 8개의 연락처 스켈레톤 아이템 배열 생성
 *   2) 사이드바 헤더 스켈레톤(아이콘 및 텍스트) 렌더링
 *   3) 연락처 리스트 스켈레톤 아이템(아바타, 사용자 정보) 렌더링
 * ----------------------------------------------------------------------------------- */

import React from 'react'
import { Users } from 'lucide-react'

const SidebarSkeleton = () => {
	// 8개의 임시 뼈대 생성
	const skeletonContacts = Array(8).fill(null);

	return (
		<aside className='h-full w-20 lg:w-72 border-r border-base-300
		flex flex-col transition-all duration-200'>
			{/* 헤더 */}
			<div className='border-b border-base-300 w-full p-5'>
				<div className='flex items-center gap-2'>
					<Users className='w-6 h-6' />
					<span className='font-medium hidden lg:block'>연락처</span>
				</div>
			</div>

			{/* 연락처 연결 */}
			<div className='overflow-y-auto w-full py-3'>
				{skeletonContacts.map((_, idx) => (
					<div key={idx} className='w-full p-3 flex items-center gap-3'>
						{/* 아바타 연결 */}
						<div className='relative mx-auto lg:mx-0'>
							<div className='skeleton size-12 rounded-full' />
						</div>

						{/* 유저 정보 연결 - 전체화면일 경우에만 등장 */}
						<div className='hidden lg:block text-left min-w-0 flex-1'>
							<div className='skeleton h-4 w-32 mb-2' />
							<div className='skeleeton h-3 w-16' />
						</div>
					</div>
				))}
			</div>
		</aside>
	)
}

=======
/* -----------------------------------------------------------------------------------
 * 파일 이름    : SidebarSkeleton.jsx
 * 설명         : 연락처 목록 로딩 시 표시할 사이드바 스켈레톤 UI 컴포넌트
 * 주요 기능    :
 *   1) 8개의 연락처 스켈레톤 아이템 배열 생성
 *   2) 사이드바 헤더 스켈레톤(아이콘 및 텍스트) 렌더링
 *   3) 연락처 리스트 스켈레톤 아이템(아바타, 사용자 정보) 렌더링
 * ----------------------------------------------------------------------------------- */

import React from 'react'
import { Users } from 'lucide-react'

const SidebarSkeleton = () => {
	// 8개의 임시 뼈대 생성
	const skeletonContacts = Array(8).fill(null);

	return (
		<aside className='h-full w-20 lg:w-72 border-r border-base-300
		flex flex-col transition-all duration-200'>
			{/* 헤더 */}
			<div className='border-b border-base-300 w-full p-5'>
				<div className='flex items-center gap-2'>
					<Users className='w-6 h-6' />
					<span className='font-medium hidden lg:block'>연락처</span>
				</div>
			</div>

			{/* 연락처 연결 */}
			<div className='overflow-y-auto w-full py-3'>
				{skeletonContacts.map((_, idx) => (
					<div key={idx} className='w-full p-3 flex items-center gap-3'>
						{/* 아바타 연결 */}
						<div className='relative mx-auto lg:mx-0'>
							<div className='skeleton size-12 rounded-full' />
						</div>

						{/* 유저 정보 연결 - 전체화면일 경우에만 등장 */}
						<div className='hidden lg:block text-left min-w-0 flex-1'>
							<div className='skeleton h-4 w-32 mb-2' />
							<div className='skeleeton h-3 w-16' />
						</div>
					</div>
				))}
			</div>
		</aside>
	)
}

>>>>>>> 5383d10 (최신)
export default SidebarSkeleton