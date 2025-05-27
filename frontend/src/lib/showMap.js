/* -----------------------------------------------------------------------------------
 * 파일 이름    : showMap.js
 * 설명         : 추천 식당 객체의 위도·경도를 기반으로 Google Map을 생성하고 마커를 표시하는 유틸 함수
 * 주요 기능    :
 *   1) mapDiv 요소 조회 (#map)
 *   2) Google Maps API로 지도(Map) 초기화
 *   3) 추천 식당 위치에 Marker 표시
 * ----------------------------------------------------------------------------------- */

// ────────────────────────────────────────────────────────────────────────────────────
// 1) showMap 함수
//    - Args:
//        restaurant (object): 
//            lat (number): 위도
//            lng (number): 경도
//            name (string): 식당 이름 (마커 툴팁에 사용)
//    - Returns:
//        void: 지정된 #map 요소에 지도를 렌더링하고 마커를 표시
// ────────────────────────────────────────────────────────────────────────────────────
export function showMap(restaurant) {
  const mapDiv = document.getElementById("map");
  if (!mapDiv || !window.google) return;

  const location = { lat: restaurant.lat, lng: restaurant.lng };

  const map = new window.google.maps.Map(mapDiv, {
    center: location,
    zoom: 16,
  });

  new window.google.maps.Marker({
    position: location,
    map: map,
    title: restaurant.name,
  });
}
