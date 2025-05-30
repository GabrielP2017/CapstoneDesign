/* -----------------------------------------------------------------------------------
 * 파일 이름    : useChatStore.js
 * 설명         : Zustand 기반 채팅(Store) 관리 모듈 - 사용자 목록 및 메시지 상태, API 액션 제공
 * 주요 기능    :
 *   1) messages, users, selectedUser, isUsersLoading, isMessagesLoading 상태 관리
 *   2) getUsers: 사용자 목록 로드
 *   3) getMessages:  메시지 로드
 *   4) sendMessage: 메시지 전송 및 응답 처리, 지도 표시
 *   5) setSelectedUser: 선택된 사용자 설정
 * ----------------------------------------------------------------------------------- */
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

// ────────────────────────────────────────────────────────────────────────────────────
// 1) 상태 및 초기값 정의
//    - messages: 메시지 배열
//    - users: 사용자 목록 배열
//    - selectedUser: 현재 선택된 사용자
//    - isUsersLoading: 사용자 목록 로딩 상태
//    - isMessagesLoading: 메시지 로딩 상태
// ────────────────────────────────────────────────────────────────────────────────────
export const useChatStore = create((set, get) => ({
  // 상태
  sessions: [],
  users: [],
  selectedUser: null,
  messages: [], // 현재 ChatContainer 에서 보여줄 메시지
  isUsersLoading: false,
  isMessagesLoading: false,
  chatSessions: {},
  currentSessionId: null,

  // ────────────────────────────────────────────────────────────────────
  //  새 채팅 시작하기
  // ────────────────────────────────────────────────────────────────────
  resetMessages: () => {
    // 로컬 메시지 클리어
    set({ messages: [] });
  },

  // ────────────────────────────────────────────────────────────────────────────────────
  // 2) getUsers 액션
  //    - 역할: 서버에서 사용자 목록을 가져와 상태(users)에 설정
  // ────────────────────────────────────────────────────────────────────────────────────
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/api/users");
      set({ users: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      console.log("getUsers:" + err.response?.data?.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getSessions: async () => {
    set({ isSessionsLoading: true });
    try {
      const { data } = await axiosInstance.get("/api/sessions");
      set({ sessions: data });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      console.log("getSessions:" + err.response?.data?.message);
    } finally {
      set({ isSessionsLoading: false });
    }
  },

  // ────────────────────────────────────────────────────────────────────────────────────
  // 3.5) Session 액션
  //    - 역할:  새 세션 생성및 전환  로그 로드
  // ────────────────────────────────────────────────────────────────────────────────────

  createSession: async (title) => {
    try {
      const { data } = await axiosInstance.post("/api/sessions", { title });
      set((state) => ({
        sessions: [data, ...state.sessions],
        currentSessionId: data.id,
        messages: [],
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      console.log("createSession:" + err.response?.data?.message);
    }
  },

  setSession: async (sessionId) => {
    if (sessionId === null || sessionId === undefined) {
      set({ currentSessionId: null, messages: [] });
      return;
    }
    set({ currentSessionId: sessionId, isMessagesLoading: true, messages: [] });
    try {
      const { data } = await axiosInstance.get(`/api/sessions/${sessionId}/logs`);
      set({ messages: data });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      console.log("setSession:" + err.response?.data?.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await axiosInstance.delete(`/api/sessions/${sessionId}`, {
        withCredentials: true,
      });
      set((state) => {
        const sessions = state.sessions.filter((s) => s.id !== sessionId);
        // 삭제한 세션이 현재 보고 있던 세션이라면 비우기
        const currentSessionId = state.currentSessionId === sessionId ? null : state.currentSessionId;
        return { sessions, currentSessionId };
      });
      toast.success("세션을 삭제했습니다.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "삭제에 실패했습니다.");
      console.log("deleteSession:" + err.response?.data?.message);
    }
  },

  // ────────────────────────────────────────────────────────────────────────────────────
  // 5) setSelectedUser 액션
  //    - 역할: 선택된 사용자 변경
  // ────────────────────────────────────────────────────────────────────────────────────
  setSelectedUser: (user) => {
    if (!user || user.id == null) {
      // null·undefined·0 전부 차단
      set({ selectedUser: null, messages: [] });
      return;
    }
    set((state) => {
      const alreadyHas = Boolean(state.chatSessions[user.id]);
      const entry = state.chatSessions[user.id];
      const msgs = entry ? entry.sessions[entry.current] : [];

      return { selectedUser: user, messages: msgs };
    });
  },

  // ────────────────────────────────────────────────────────────────────────────────────
  // 4) sendMessage 액션
  //    - 역할: 메시지를 서버에 전송, 로컬 메시지 목록에 사용자 메시지 추가 후
  //            서버 응답 메시지 추가 및 지도 표시
  // ────────────────────────────────────────────────────────────────────────────────────
  // sendMessage: async (text) => {
  //   const { selectedUser } = get();
  //   if (!selectedUser) {
  //     toast.error("먼저 채팅 상대를 선택하세요.");
  //     return;
  //   }

  //   try {
  //     const uid        = selectedUser.id;
  //     const state      = get();
  //     const entry      = state.chatSessions[uid];
  //     const curIdx     = entry.current;
  //     const userMsg    = {
  //       id: Date.now(),
  //       role: "user",
  //       message: text,
  //       createdAt: new Date().toISOString(),
  //     };

  //     /* 1) 로컬 업데이트 */
  //     set(s => {
  //       const updated = entry.sessions.map((s2, i) =>
  //         i === curIdx ? [...s2, userMsg] : s2,
  //       );
  //       return {
  //         chatSessions: {
  //           ...s.chatSessions,
  //           [uid]: { sessions: updated, current: curIdx },
  //         },
  //         messages: updated[curIdx],
  //       };
  //     });

  //     /* 2) 서버 호출 → assistant 응답 */
  //     const form = new FormData();
  //     form.append("message", text);
  //     const res = await axiosInstance.post("/get_response", form, {
  //       withCredentials: true,            // ← 쿠키(JWT) 같이 보내기
  //       headers: { "Content-Type": "multipart/form-data" }
  //     });

  //     const assistantMsg = {
  //       id: Date.now(),
  //       role: "assistant",
  //       message: res.data.response,
  //       createdAt: new Date().toISOString(),
  //     };

  //     set(s => {
  //       const { sessions, current } = s.chatSessions[uid];
  //       const updated = sessions.map((s2, i) =>
  //         i === current ? [...s2, assistantMsg] : s2,
  //       );
  //       return {
  //         chatSessions: {
  //           ...s.chatSessions,
  //           [uid]: { sessions: updated, current },
  //         },
  //         messages: updated[current],
  //       };
  //     });

  //   if (res.data.restaurant) showMap(res.data.restaurant);
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || err.message);
  //   }
  // },

  sendMessage: async (text) => {
    const { currentSessionId, messages } = get();
    if (!currentSessionId) {
      toast.error("먼저 대화 세션을 생성하거나 선택하세요.");
      return;
    }

    // 1) 사용자 메시지 로컬 반영
    const userMsg = { id: Date.now(), role: "user", message: text, createdAt: new Date().toISOString() };
    set({ messages: [...messages, userMsg] });
    set((state) => ({
      sessions: state.sessions.map((sess) => (sess.id === currentSessionId ? { ...sess, last_message: userMsg.message, last_date: userMsg.createdAt } : sess)),
    }));

    // 2) 서버 호출 (session_id 포함)
    const form = new FormData();
    form.append("message", text);
    form.append("session_id", currentSessionId);
    const res = await axiosInstance.post("/get_response", form, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    // 3) assistant 메시지 로컬 반영
    const assistantMsg = {
      id: Date.now() + 1,
      role: "assistant",
      message: res.data.message,
      createdAt: new Date().toISOString(),
      url: res.data.url,
      name: res.data.name,
      restaurant: res.data.restaurant,
    };
    set({ messages: [...get().messages, assistantMsg] });

    set((state) => ({
      sessions: state.sessions.map((sess) =>
        sess.id === currentSessionId ? { ...sess, last_message: assistantMsg.message, last_date: assistantMsg.createdAt } : sess
      ),
    }));
    console.log(assistantMsg);
    // if (res.data.restaurant) showMap(res.data.restaurant);
  },

  $reset: () =>
    set({
      sessions: [],
      currentSessionId: null,
      messages: [],
      isMessagesLoading: false,
    }),
}));
