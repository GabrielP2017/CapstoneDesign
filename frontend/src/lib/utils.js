/* -----------------------------------------------------------------------------------
 * 파일 이름    : formatMessageTime.js
 * 설명         : 날짜/시간 정보를 'HH:MM' 형식의 한국어 시간 문자열로 변환하는 유틸 함수
 * 주요 기능    :
 *   1) toLocaleTimeString을 사용해 24시간제 HH:MM 포맷으로 변환
 * ----------------------------------------------------------------------------------- */

// ────────────────────────────────────────────────────────────────────────────────────
// 1) formatMessageTime 함수
//    - Args:
//        date (string | number | Date): 변환 대상 날짜/시간
//    - Returns:
//        string: 'HH:MM' 형식의 시간 문자열 (Asia.Seoul 타임존 적용)
// ────────────────────────────────────────────────────────────────────────────────────
export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("ko-KR", {
		timeZone: 'Asia.Seoul',
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}