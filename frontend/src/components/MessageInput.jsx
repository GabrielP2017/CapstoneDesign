/* -----------------------------------------------------------------------------------
 * 파일 이름    : MessageInput.jsx
 * 설명         : 채팅 입력창 컴포넌트 - 텍스트 메시지 및 이미지 파일 첨부, 전송 기능 제공
 * 주요 기능    :
 *   1) 텍스트 입력 상태 관리(useState)
 *   2) 이미지 파일 선택 및 미리보기 기능
 *   3) 이미지 제거 기능
 *   4) 메시지 전송(handleSendMessage) - 텍스트 및 이미지 첨부
 * ----------------------------------------------------------------------------------- */
import React, { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Image, Send } from "lucide-react";
import toast from "react-hot-toast";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) MessageInput 컴포넌트 정의
//    - 역할: 텍스트 및 이미지 입력, 메시지 전송 UI 제공
// ────────────────────────────────────────────────────────────────────────────────────
const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  // ──────────────────────────────────────────────────────────────────────────────────
  // 2) handleImageChange 함수
  //    - 역할: 이미지 파일 선택 시 미리보기 생성
  // ──────────────────────────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startswith("image/")) {
      toast.error("이미지 파일을 선택해주세요!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ──────────────────────────────────────────────────────────────────────────────────
  // 3) removeImage 함수
  //    - 역할: 선택된 이미지 미리보기 제거 및 input 초기화
  // ──────────────────────────────────────────────────────────────────────────────────
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ──────────────────────────────────────────────────────────────────────────────────
  // 4) handleSendMessage 함수
  //    - 역할: 텍스트 또는 이미지 있을 때 메시지 전송 후 폼 리셋
  // ──────────────────────────────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    setText("");
    let str = text;
    e.preventDefault();
    if (!str.trim() && !imagePreview) return;
    try {
      await sendMessage(str);

      // 클리어 폼
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("메세지 전송을 실패했습니다.", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-zinc-700" />
            <button
              onClick={removeImage}
              className="absolute -top1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
							flex items-center justify-center"
              type="button"
            >
              <X className="size-3"></X>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            id="message-input"
            name="message"
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="메세지를 입력해주세요..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
							${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button type="submit" className="btn btn-sm btn-circle" disabled={!text.trim() && !imagePreview}>
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
