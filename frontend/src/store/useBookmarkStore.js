/* -----------------------------------------------------------------------------------
 * 파일 이름    : useBookmarkStore.js
 * 설명         : Zustand 기반 즐겨찾기(북마크) 상태 관리 모듈 - 북마크 추가, 삭제 기능 제공
 * 주요 기능    :
 * 1) bookmarks 상태: 현재 저장된 북마크 목록
 * 2) addBookmark 액션: 새로운 북마크를 목록에 추가
 * 3) deleteBookmark 액션: 특정 ID의 북마크를 목록에서 제거
 * ----------------------------------------------------------------------------------- */
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) useBookmarkStore 정의
//    - Zustand를 사용하여 전역 북마크 상태 관리
//    - bookmarks 배열, addBookmark, deleteBookmark 액션 포함
// ────────────────────────────────────────────────────────────────────────────────────
export const useBookmarkStore = create((set, get) => ({
  bookmarks: [], // 북마크 목록 초기화
  addBookmark: async (
    bookmark // 새로운 북마크 추가 액션
  ) => {
    try {
      console.log(bookmark);
      const { data } = await axiosInstance.post(`/api/add_bookmark`, bookmark);
      get().readBookmarks();
      toast.success("즐겨찾기를 추가했습니다.");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  },
  readBookmarks: async () => {
    const { data } = await axiosInstance.get(`/api/bookmarks`);
    set({ bookmarks: data });
  },
  deleteBookmark: async (
    id // 특정 ID의 북마크 삭제 액션
  ) => {
    const { data } = await axiosInstance.post(`/api/delete_bookmark`, { bookmark_id: id });
    get().readBookmarks();
    toast.success("즐겨찾기를 삭제했습니다.");
  },
  updateBookmark: async (
    bookmark // 북마크 수정
  ) => {
    try {
      console.log(bookmark);
      const { data } = await axiosInstance.post(`/api/update_bookmark`, bookmark);
      get().readBookmarks();
      toast.success("즐겨찾기를 수정했습니다.");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || err.message);
    }
  },
}));

export default useBookmarkStore;
