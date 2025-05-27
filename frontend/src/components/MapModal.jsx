/* -----------------------------------------------------------------------------------
 * 파일 이름    : MapModal.jsx
 * 설명         : 구글 지도 장소 정보를 모달창으로 표시하는 컴포넌트
 * 주요 기능    :
 *   1) placeName에 해당하는 장소를 구글맵 임베드로 표시
 *   2) ESC 키 또는 배경 클릭 시 모달 닫힘 처리
 *   3) Framer Motion을 활용한 모달 열기/닫기 애니메이션
 *   4) 반응형 스타일 적용 (최대 크기 제한 및 가운데 정렬)
 * ----------------------------------------------------------------------------------- */

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MapModal = ({ isOpen, onClose, placeName }) => {
  const apiKey = "AIzaSyB_zYo6VBFj4O8nKKG-QvNfzECe52Asp7w"; // ← 여기에 API 키 입력
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(placeName)}`;

  const overlayRef = useRef();

  // ESC 키 누르면 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 바깥 클릭 감지
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <motion.div
            className="bg-white rounded-lg p-4 relative w-full"
            style={{
              maxWidth: "95vw",
              width: "1200px",
              maxHeight: "90vh",
            }}
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <iframe
              src={embedUrl}
              width="100%"
              height="600"
              style={{
                border: 0,
                minHeight: "300px",
                maxHeight: "80vh",
              }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );  
};

export default MapModal;
