/* -----------------------------------------------------------------------------------
 * 파일 이름    : BookmarkList.jsx
 * 설명         : 즐겨찾기 목록 및 관리 컴포넌트 - 추가, 삭제, 목록 표시 기능 제공
 * 주요 기능    :
 * 1) 즐겨찾기 목록 표시 및 페이징 처리
 * 2) 즐겨찾기 추가/삭제 기능 (Modal 사용)
 * 3) 사용자 인터랙션에 대한 Toast 메시지 출력
 * ----------------------------------------------------------------------------------- */

import React, { useState, useMemo } from "react"; // React Hooks import (useState, useMemo)
import { Trash2, X, Star, Pencil } from "lucide-react"; // Lucide-react 아이콘 import
import useBookmarkStore from "../store/useBookmarkStore"; // Zustand 스토어 import (즐겨찾기 상태 관리)
import Modal from "react-modal"; // Modal 컴포넌트 라이브러리 import
import { useThemeStore } from "../store/useThemeStore"; // useThemeStore import
import { motion, AnimatePresence } from "framer-motion"; // 애니메이션 추가


const BookmarkList = ({ onClose, onPlaceClick }) => {
  // Zustand 스토어에서 상태 및 액션 가져오기
  const { bookmarks, addBookmark, deleteBookmark, updateBookmark } = useBookmarkStore();

  // 현재 테마 가져오기
  const { theme } = useThemeStore();

  // 즐겨찾기 추가 Modal 표시 여부 상태
  const [isAddBookmarkModalVisible, setIsAddBookmarkModalVisible] = useState(false);

  // 새로운 즐겨찾기 정보 상태
  const [newBookmark, setNewBookmark] = useState({
    name: "", // 즐겨찾기 이름
    address: "", // 즐겨찾기 주소
    place_id: "", // 즐겨찾기 ID (URL)
  });
  // 현재 페이지 및 페이지당 아이템 수 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 수정 모달의 표시 여부를 제어하는 상태
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // 현재 수정 중인 즐겨찾기 항목의 데이터를 저장하는 상태
  // 수정 모달이 열릴 때 선택된 즐겨찾기 항목의 id, 이름(name), 주소(url)을 여기에 저장함
  const [editingBookmark, setEditingBookmark] = useState({ id: null, name: "", url: "" });

  // ------------------------------------------------------------------------------------
  // handleAddBookmark: 즐겨찾기 추가 처리 함수
  // - 입력 필드 검증 후, 새 즐겨찾기 객체 생성 및 스토어에 추가
  // - 성공 Toast 메시지 출력 및 Modal 닫기, 입력 필드 초기화
  // ------------------------------------------------------------------------------------
  const handleAddBookmark = () => {
    // // 입력 필드 검증
    // if (!newBookmark.name || !newBookmark.address || !newBookmark.place_id) {
    //   toast.error("모든 필드를 입력해주세요.");
    //   return;
    // }

    // // 새 즐겨찾기 객체 생성 (UUID 사용)
    // const bookmarkToAdd = {
    //   id: uuidv4(),
    //   ...newBookmark,
    // };

    // // 스토어에 즐겨찾기 추가 및 성공 메시지 출력
    // addBookmark(bookmarkToAdd);
    // toast.success("즐겨찾기가 추가되었습니다. (주의: 임시 저장이며, 새로고침 시 사라집니다.)");

    // // 입력 필드 초기화 및 Modal 닫기
    // setNewBookmark({ name: "", address: "", place_id: "" });
    addBookmark(newBookmark);
    setIsAddBookmarkModalVisible(false);
  };

  const handleUpdateBookmark = () => {
    updateBookmark(editingBookmark);
    setIsEditModalVisible(false);
  };

  // ------------------------------------------------------------------------------------
  // handleBookmarkClick: 즐겨찾기 클릭 처리 함수
  // - 이벤트 전파 방지 및 새 창에서 즐겨찾기 URL 열기
  // ------------------------------------------------------------------------------------
  const handleBookmarkClick = (e, name) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    if (onPlaceClick) {
      onPlaceClick(name); // 장소 이름을 상위로 전달
    }
  };

  // ------------------------------------------------------------------------------------
  // handleDeleteBookmark: 즐겨찾기 삭제 처리 함수
  // - 이벤트 전파 방지 및 스토어에서 즐겨찾기 삭제
  // - 성공 Toast 메시지 출력
  // ------------------------------------------------------------------------------------
  const handleDeleteBookmark = (e, id) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    deleteBookmark(id); // 스토어에서 즐겨찾기 삭제
  };

  // ------------------------------------------------------------------------------------
  // handleEditBookmark: 즐겨찾기 수정 함수
  // updateBookmark    : 수정된 즐겨찾기 정보를 서버에 전송하고, 모달을 닫고 목록을 새로고침함
  // - 요청 실패 시 에러 메시지를 toast로 출력
  // ------------------------------------------------------------------------------------
  const handleEditBookmark = (id) => {
    const target = bookmarks.find((b) => b.id === id);
    console.log(target);
    if (target) {
      setEditingBookmark({
        id: target.id,
        name: target.name,
        url: target.url,
      });
      setIsEditModalVisible(true);
    }
  };

  // ------------------------------------------------------------------------------------
  // displayedBookmarks: 현재 페이지에 표시할 즐겨찾기 목록 계산 (useMemo 사용)
  // - 의존성 배열 [bookmarks, currentPage] 변경 시에만 계산 수행하여 성능 최적화
  // ------------------------------------------------------------------------------------
  const displayedBookmarks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return bookmarks.slice(startIndex, endIndex);
  }, [bookmarks, currentPage]);

  // ------------------------------------------------------------------------------------
  // pageNumbers: 전체 페이지 번호 배열 생성 (useMemo 사용)
  // - 의존성 배열 [bookmarks, itemsPerPage] 변경 시에만 계산 수행하여 성능 최적화
  // ------------------------------------------------------------------------------------
  const pageNumbers = useMemo(() => {
    const totalPages = Math.ceil(bookmarks.length / itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [bookmarks, itemsPerPage]);

  // Modal 스타일 정의
  const modalStyle = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "80%",
      maxWidth: "400px",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0)",
      zIndex: 1000,
    },
  };

  // ------------------------------------------------------------------------------------
  // JSX 렌더링
  // - 즐겨찾기 목록 표시, 페이징 처리, 추가/삭제 Modal 포함
  // ------------------------------------------------------------------------------------
  return (
    // 애니메이션 추가
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute top-full right-0 mt-2 bg-base-200 rounded-md shadow-lg border border-gray-200 z-50"
      style={{ width: "400px", maxHeight: "400px", overflowY: "auto" }}
    >
      {/* 헤더: 제목 및 추가/닫기 버튼 */}
      <div className="flex justify-between items-center px-4 py-2">
        <h2 className="text-lg font-bold">즐겨찾기 목록</h2>
        <button className="btn btn-sm btn-ghost gap-2" onClick={() => setIsAddBookmarkModalVisible(true)}>
          <span>추가</span>
          <Star size={16} />
        </button>
        <button className="btn btn-sm btn-ghost gap-2" onClick={onClose}>
          <span>닫기</span>
          <X size={16} />
        </button>
      </div>

      {/* 즐겨찾기 목록 표시 */}
      <ul className="py-2">
        {displayedBookmarks.length > 0 ? (
          displayedBookmarks.map((bookmark) => (
            <li
              key={bookmark.id}
              className="px-4 py-2 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
              onClick={(e) => handleBookmarkClick(e, bookmark.name)}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-col">
                  <strong className="block">{bookmark.name}</strong>
                  <span className="text-sm text-gray-600">{bookmark.address}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-circle btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBookmark(e, bookmark.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-circle btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditBookmark(bookmark.id);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="px-4 py-2 text-gray-500">등록된 즐겨찾기가 없습니다.</li>
        )}
      </ul>

      {/* 페이징 컨트롤 */}
      {bookmarks.length > itemsPerPage && (
        <div className="flex justify-center px-4 py-2 border-t border-gray-200">
          {pageNumbers.map((number) => (
            <button key={number} className={`btn btn-xs mx-1 ${currentPage === number ? "btn-primary" : ""}`} onClick={() => setCurrentPage(number)}>
              {number}
            </button>
          ))}
        </div>
      )}

      {/* 즐겨찾기 추가 및 수정 Modal */}
      {isAddBookmarkModalVisible && (
  <div
    className="fixed w-screen h-screen inset-0 z-50 flex items-center justify-center bg-black/50"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setIsAddBookmarkModalVisible(false);
      }
    }}
  >
    <AnimatePresence>
      <motion.div
        key="add-modal"
        className="w-[80%] max-w-[400px] bg-base-200 rounded-lg shadow-lg p-6 z-[1001] outline-none"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <h2 className="text-lg font-bold mb-4">즐겨찾기 추가</h2>
        <input
          type="text"
          placeholder="즐겨찾기 이름 입력"
          className="input input-bordered w-full mb-2"
          value={newBookmark.name}
          onChange={(e) =>
            setNewBookmark({ ...newBookmark, name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="식당 주소 입력"
          className="input input-bordered w-full mb-2"
          value={newBookmark.url}
          onChange={(e) =>
            setNewBookmark({ ...newBookmark, url: e.target.value })
          }
        />
        <div className="flex justify-end gap-2">
          <button
            className="btn btn-sm"
            onClick={() => setIsAddBookmarkModalVisible(false)}
          >
            취소
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleAddBookmark}>
            저장
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
)}
{isEditModalVisible && (
  <div
    className="fixed w-screen h-screen inset-0 z-50 flex items-center justify-center bg-black/50"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setIsEditModalVisible(false);
      }
    }}
  >
    <AnimatePresence>
      <motion.div
        key="edit-modal"
        className="w-[80%] max-w-[400px] bg-base-200 rounded-lg shadow-lg p-6 z-[1001] outline-none"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <h2 className="text-lg font-bold mb-4">즐겨찾기 수정</h2>
        <input
          type="text"
          placeholder="즐겨찾기 이름 입력"
          className="input input-bordered w-full mb-2"
          value={editingBookmark.name}
          onChange={(e) =>
            setEditingBookmark({ ...editingBookmark, name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="식당 주소 입력"
          className="input input-bordered w-full mb-2"
          value={editingBookmark.url}
          onChange={(e) =>
            setEditingBookmark({ ...editingBookmark, url: e.target.value })
          }
        />
        <div className="flex justify-end gap-2">
          <button
            className="btn btn-sm"
            onClick={() => setIsEditModalVisible(false)}
          >
            취소
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleUpdateBookmark}>
            수정
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
)}
    </motion.div>
  );
};

export default BookmarkList;
