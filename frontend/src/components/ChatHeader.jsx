/* -----------------------------------------------------------------------------------
 * 파일 이름    : ChatHeader.jsx
 * 설명         : 채팅 헤더 컴포넌트 - 선택된 사용자 정보(아바타, 이름, 상태) 및 닫기 버튼 렌더링
 * 주요 기능    :
 *   1) 선택된 사용자 아바타 및 이름 표시
 *   2) 
 *   3) 닫기 버튼으로 채팅창 종료 처리
 * ----------------------------------------------------------------------------------- */
import React from "react";
import { X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) ChatHeader 컴포넌트 정의
//    - 역할: 채팅창 상단 헤더(아바타, 이름, 상태 및 닫기 버튼) 렌더링
// ────────────────────────────────────────────────────────────────────────────────────
const ChatHeader = () => {
  /* 로그인한 내 정보 */
  const { authUser, onlineUsers } = useAuthStore();

  /* 현재 세션·세션 해제 액션 */
  const { currentSessionId, setSession } = useChatStore();

  /* 아바타·이름 */
  const avatar = authUser?.profilePic || "/avatar.png";
  const name = authUser?.name || "Me";

  /* 제목: 세션이 없으면 “새 대화”, 있으면 앞 6글자 */
  const room = currentSessionId ? `대화 ${currentSessionId.slice(0, 6)}…` : "새 대화";

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 아바타 */}
          {/* <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={avatar} alt={name} />
            </div>
          </div> */}

          {/* 유저 정보 */}
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-base-content/70">{room}</p>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <button onClick={() => setSession(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
