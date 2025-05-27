/* -----------------------------------------------------------------------------------
 * 파일 이름    : ChatContainer.jsx
 * 설명         : 채팅 화면 컨테이너 컴포넌트 - 메시지 로딩, 렌더링, 맵 표시, 입력창 핸들링
 * 주요 기능    :
 *   1) formatMessageTime: timestamp를 한국어 AM/PM 형식으로 변환
 *   2) 메시지 로딩 상태 처리 및 스켈레톤 렌더링
 *   3) 실제 메시지 리스트 렌더링 (텍스트, 이미지, 시간)
 *   4) 구글 맵 API로 추천 식당 위치 표시
 *   5) MessageInput 컴포넌트 렌더링
 *   6) 음식 추천 응답에 포함된 "지도 보기" 버튼 클릭 시 모달창으로 지도 출력
 * ----------------------------------------------------------------------------------- */

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import useBookmarkStore from "../store/useBookmarkStore";
import MapModal from "./MapModal";
import { motion } from "framer-motion";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) formatMessageTime 함수
// ────────────────────────────────────────────────────────────────────────────────────
const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date)) return "";

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours < 12 ? "오전" : "오후";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${ampm} ${hour12}:${String(minutes).padStart(2, "0")}`;
};

// ────────────────────────────────────────────────────────────────────────────────────
// 2) ChatContainer 컴포넌트 정의
// ────────────────────────────────────────────────────────────────────────────────────
const ChatContainer = () => {
  const { messages: rawMessages, isMessagesLoading, sendMessage } = useChatStore();

  // Zustand 스토어에서 상태 및 액션 가져오기
  const { bookmarks, addBookmark, deleteBookmark, readBookmarks } = useBookmarkStore();

  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPlaceName, setCurrentPlaceName] = useState("");  

  // rawMessages가 undefined일 때를 방어
  const messages = Array.isArray(rawMessages) ? rawMessages : [];

  const scrollRef=useRef(null);

  const mapRef = useRef(null); // div#map
  const linkRef = useRef(null); // a#map-link
  const hasAnimated = useRef(false);

  useEffect(()=>{
    scrollToBottom();
  },[messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };



  // 로딩 중 스켈레톤
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput onSend={sendMessage} />
      </div>
    );
  }


  // 메시지 렌더링
  return (
    <motion.div
      initial={hasAnimated.current ? false : { x: 100, opacity: 0 }}
      animate={hasAnimated.current ? false : { x: 0, opacity: 1 }}
      // 처음만 채팅 불러오는 애니메이션 함수
      // (지우면 채팅 클릭시 애니메이션 계속 출력)
      onAnimationComplete={() => {
        hasAnimated.current = true;
      }}
      transition={{ type: "tween", duration: 0.3 }}
      className="relative flex-1 flex flex-col overflow-auto"
    >
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={msg.id ?? idx} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
            <div className="chat-header mb-1">
              {msg.createdAt && <time className="text-xs opacity-50 ml-1">{formatMessageTime(msg.createdAt)}</time>}
              <div className="chat-bubble flex flex-col max-w-[80%]">
                {/* 이미지가 있으면 */}
                {msg.image && <img src={msg.image} alt="Attachment" className="sm:max-w-[200px] rounded-md mb-2" />}
                {/* response (HTML) 우선, 없으면 plain message */}
                {/*<div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.response }} />*/}
                <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.message }}></div>
                {msg.name && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setCurrentPlaceName(msg.name);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1.5  btn btn-primary btn-sm no-underline rounded font-bold w-22 text-center transition-colors duration-200 hover:bg-base-600"
                    >
                      지도 보기
                    </button>
                    <a
                      className="px-3 py-1.5 btn btn-primary btn-sm no-underline rounded font-bold w-28 text-center cursor-pointer transition-colors duration-200 hover:bg-base-600"
                      onClick={() => {
                        addBookmark({ name: msg.name, url: msg.url });
                      }}
                    >
                      즐겨찾기 추가
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <MessageInput onSend={sendMessage} />
      <MapModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        placeName={currentPlaceName}
      />
    </motion.div>
  );
};

export default ChatContainer;
