<<<<<<< HEAD
/* -----------------------------------------------------------------------------------
 * 파일 이름    : MessageSkeleton.jsx
 * 설명         : 채팅 메시지 로딩 시 표시할 스켈레톤 UI 컴포넌트
 * 주요 기능    :
 *   1) 지정된 개수만큼 메시지 스켈레톤 생성
 *   2) 좌/우 교차 배치로 사용자 vs. 챗봇 메시지 시각적 구분
 *   3) Tailwind CSS 유틸리티 클래스 활용한 스타일 적용
 * ----------------------------------------------------------------------------------- */

import React from 'react'

const MessageSkeleton = () => {

	const skeletonMessages = Array(6).fill(null);

	return (
		<div className='flex-1 overflow-y-auto p-4 space-y-4'>
			{skeletonMessages.map((_, idx) => (
				<div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
					<div className='chat-image avatar'>
						<div className='size-10 rounded-full'>
							<div className='skeleton w-full h-full rounded-full' />
						</div>
					</div>

					<div className='chat-header mb-1'>
						<div className='skeleton h-4 w-16' />
					</div>

					<div className='chat-bubble bg-transparent p-0'>
						<div className='skeleton h-16 w-[200px]' />
					</div>
				</div>
			))}
		</div>
	)
}

=======
/* -----------------------------------------------------------------------------------
 * 파일 이름    : MessageSkeleton.jsx
 * 설명         : 채팅 메시지 로딩 시 표시할 스켈레톤 UI 컴포넌트
 * 주요 기능    :
 *   1) 지정된 개수만큼 메시지 스켈레톤 생성
 *   2) 좌/우 교차 배치로 사용자 vs. 챗봇 메시지 시각적 구분
 *   3) Tailwind CSS 유틸리티 클래스 활용한 스타일 적용
 * ----------------------------------------------------------------------------------- */

import React from 'react'

const MessageSkeleton = () => {

	const skeletonMessages = Array(6).fill(null);

	return (
		<div className='flex-1 overflow-y-auto p-4 space-y-4'>
			{skeletonMessages.map((_, idx) => (
				<div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
					<div className='chat-image avatar'>
						<div className='size-10 rounded-full'>
							<div className='skeleton w-full h-full rounded-full' />
						</div>
					</div>

					<div className='chat-header mb-1'>
						<div className='skeleton h-4 w-16' />
					</div>

					<div className='chat-bubble bg-transparent p-0'>
						<div className='skeleton h-16 w-[200px]' />
					</div>
				</div>
			))}
		</div>
	)
}

>>>>>>> 5383d10 (최신)
export default MessageSkeleton