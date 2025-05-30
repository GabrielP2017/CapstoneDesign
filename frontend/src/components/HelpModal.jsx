// HelpModal.jsx
import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
// 필요한 아이콘들을 여기서 import
import { Home, MapPin, Settings, Star, LogOut, MessageSquare  } from "lucide-react"; 

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed w-screen h-screen inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <AnimatePresence>
        <motion.div
          key="help-modal"
          className="w-[80%] max-w-[500px] bg-base-200 rounded-lg shadow-lg p-6 z-[1001] outline-none"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <h2 className="text-xl font-bold mb-5 text-center text-primary-content">마음맛집 사용 가이드</h2> {/* 제목 스타일 변경 */}
          <div className="text-base-content leading-relaxed"> {/* 텍스트 기본 스타일 */}
            <p className="mb-4">
              저희 <strong className="text-primary">마음맛집</strong>을 이용해 주셔서 감사합니다! 
              아래에서 주요 기능들을 확인하고 앱을 더욱 효율적으로 사용해보세요.
            </p>
            
            <h3 className="text-lg font-semibold mt-6 mb-3 text-secondary">주요 기능 안내:</h3> {/* 소제목 스타일 변경 */}
            <ul className="list-none space-y-4"> {/* 점 제거, 간격 크게 */}
              <li className="flex items-start gap-3"> {/* 아이콘과 텍스트 정렬 */}
                <img src="/newlogo2.png" alt="Home Logo" className="w-6 h-6 flex-shrink-0 text-blue-500 mt-0.5" /> {/* 아이콘 크기, 색상, 정렬 조정 */}
                <div>
                  <strong className="text-lg font-bold text-primary-focus">홈 로고</strong>
                  <p className="text-sm text-base-content mt-1">
                    로고를 클릭하시면 언제든지 <span className="font-semibold">메인 페이지로 돌아갈 수 있습니다.</span> 새로운 맛집 검색을 시작하거나 초기 화면으로 이동할 때 편리합니다.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 flex-shrink-0 text-purple-500 mt-0.5" /> {/* 아이콘 추가 */}
                <div>
                  <strong className="text-lg font-bold text-primary-focus">채팅 기능</strong>
                  <p className="text-sm text-base-content mt-1">
                    저희 마음맛집은 사용자의 기분을 중점으로 식당을 추천해드리기에 <span className="font-semibold"> 기분에 관련된 내용을 채팅에 입력해주세요.</span>
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-6 h-6 flex-shrink-0 text-green-500 mt-0.5" />
                <div>
                  <strong className="text-lg font-bold text-primary-focus">위치 설정</strong>
                  <p className="text-sm text-base-content mt-1">
                    현재 계신 곳이나 원하는 <span className="font-semibold">위치를 설정하여 주변 맛집을 검색</span>할 수 있습니다. 정확한 위치 정보로 맞춤형 결과를 경험하세요.<br/>
                    (예: 서울특별시 중구, 경기도 안양시 동안구 비산1동)
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Settings className="w-6 h-6 flex-shrink-0 text-gray-500 mt-0.5" />
                <div>
                  <strong className="text-lg font-bold text-primary-focus">테마 변경</strong>
                  <p className="text-sm text-base-content mt-1">
                    사용자님의 취향에 따라 앱의 <span className="font-semibold">시각적인 테마를 변경</span>할 수 있습니다.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Star className="w-6 h-6 flex-shrink-0 text-yellow-500 mt-0.5" />
                <div>
                  <strong className="text-lg font-bold text-primary-focus">즐겨찾기</strong>
                  <p className="text-sm text-base-content mt-1">
                    마음에 드는 맛집을 <span className="font-semibold">즐겨찾기 목록에 저장</span>하고, 나중에 쉽게 찾아볼 수 있습니다. 나만의 맛집 리스트를 만들어보세요!
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <LogOut className="w-6 h-6 flex-shrink-0 text-red-500 mt-0.5" />
                <div>
                  <strong className="text-lg font-bold text-primary-focus">로그아웃</strong>
                  <p className="text-sm text-base-content mt-1">
                    현재 로그인된 계정에서 <span className="font-semibold">안전하게 연결을 해제</span>합니다. 개인 정보 보호를 위해 사용 후에는 로그아웃하는 것을 권장합니다.
                  </p>
                </div>
              </li>
            </ul>

          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              className="btn btn-sm btn-primary"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HelpModal;