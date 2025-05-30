/* -----------------------------------------------------------------------------------
 * 파일 이름    : Sidebar.jsx
 * 설명         : 채팅 목록 사이드바 컴포넌트 - 사용자 목록 로드, 선택, 온라인 상태 표시
 * 주요 기능    :
 *   1) useChatStore로 사용자 목록 로드(getUsers) 및 로딩 상태 관리
 *   2) 새로운 채팅 버튼으로 첫 번째 사용자 선택 처리
 *   3) 사용자 리스트 렌더링 및 선택된 사용자 강조
 *   4) useAuthStore로 온라인 사용자 표시
 *   5) Zustand를 통해 저장된 사용자 주소(location) 표시
 *    - 주소 미입력 시 "시작하기" 텍스트 표시
 * ----------------------------------------------------------------------------------- */

import React from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Trash2, MapPin, MessageSquarePlus } from "lucide-react"; // 휴지통 아이콘
import { useLocationStore } from "../store/useLocationStore";

{
  /* 백엔드가 연결되어있지 않아 유저 현재 상태에 대한 코드가 작동되지 않고 있음 */
}

const Sidebar = () => {
  const { getSessions, createSession, sessions, currentSessionId, setSession, deleteSession } = useChatStore();

  const { onlineUsers, authUser } = useAuthStore();

  // ────────────────────────────────────────────────────────────────────────────────────
  // 1) 사용자 목록 초기 로드
  //    - 컴포넌트 마운트 시 getUsers 호출하여 사용자 목록 가져오기
  // ────────────────────────────────────────────────────────────────────────────────────

  const myId = authUser?.id;
  const me = authUser;
  /*const sessions = chatSessions[myId]?.sessions || []; */
  const location = useLocationStore((state) => state.location);
  React.useEffect(() => {
    getSessions();
  }, [getSessions]);

  /*   useEffect(() => {
    getUsers();
  }, [getUsers]);
 */

  /*   useEffect(() => {
    if (authUser) getLogs(myId);
  }, [authUser, getLogs, myId]);
 */

  // ────────────────────────────────────────────────────────────────────────────────────
  // 2) 로딩 상태 처리
  //    - isUsersLoading이 true일 때 스켈레톤 UI 렌더링
  // ────────────────────────────────────────────────────────────────────────────────────
  /* if (isUsersLoading) return <SidebarSkeleton />; */

  // ────────────────────────────────────────────────────────────────────────────────────
  // 3) 사이드바 렌더링
  //    - 헤더: 새 채팅 버튼
  //    - 사용자 리스트: 프로필 이미지, 이름, 온라인 상태 표시
  // ────────────────────────────────────────────────────────────────────────────────────
  /*   const entry = chatSessions[myId];
  const logs = entry ? entry.sessions[entry.current] : []; */

  return (
    <aside
      className="h-full w-20 lg:w-72 border-r border-base-300
		flex flex-col transition-all duration-200"
    >
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="size-5" />
          <span className="font-bold hidden lg:block">{location || "위치를 설정해주세요"}</span>
        </div>
        {/* 새 채팅은 “내” id 로 메시지 배열 초기화 */}
        <button
          onClick={() => createSession("")}
          className="btn btn-primary w-[100%] mx-auto lg:flex justify-start gap-2 pl-18.5"
        >
          <MessageSquarePlus className="w-5 h-5" />
          새 채팅
        </button>

      </div>

      <div className="overflow-y-auto w-full py-3">
        {sessions.map((sess, idx) => {
          const selected = sess.id === currentSessionId;
          const lastText = sess.last_message ? sess.last_message.slice(0, 10) : "새 대화";

          return (
            <div
              key={sess.id}
              className={`
                flex items-center justify-between p-3 cursor-pointer
                hover:bg-base-200 transition-colors
                ${selected ? "bg-base-300 ring-1 ring-base-300" : ""}
              `}
              onClick={() => setSession(sess.id)}
            >
              {/* 왼쪽 클릭 영역 */}
              <div className="flex items-center gap-3 flex-1">
                {/* <img src={me.profilePic || "/avatar.png"} alt={me.name} className="size-12 rounded-full" /> */}
                <div className="ml-2 truncate">
                  <div className="font-medium">{`${authUser.name} #${idx + 1}`}</div>
                  <div className="text-sm text-zinc-400 truncate">{lastText}</div>
                </div>
              </div>

              {/* 삭제 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 부모 onClick 방지
                  deleteSession(sess.id);
                }}
                className="p-1 hover:text-red-500"
                title="세션 삭제"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
