<<<<<<< HEAD
# -----------------------------------------------------------------------------------
# 파일 이름   : SearchContent.py
# 설명        : Google Maps Places API를 사용하여 지정된 음식과 위치 기준으로 근처 음식점을 검색하는 유틸 모듈
# 주요 기능   :
#   1) .env 파일에서 GOOGLE_MAPS_API_KEY 로드
#   2) find_restaurant_nearby 함수로 음식 및 위치 기준 첫 번째 검색 결과 반환
# 요구 모듈   : requests, python-dotenv, os
# -----------------------------------------------------------------------------------
import requests
import os
from dotenv import load_dotenv

load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def find_restaurant_nearby(food, location="서울, 경기"):
    endpoint = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": f"{location} {food}",
        "key": GOOGLE_MAPS_API_KEY,
        "language": "ko"
    }

    res = requests.get(endpoint, params=params)
    results = res.json()

    if results.get("status") == "OK" and results["results"]:
        place = results["results"][0]
        return {
            "name": place.get("name"),
            "address": place.get("formatted_address"),
            "latitude": place["geometry"]["location"]["lat"],
            "longitude": place["geometry"]["location"]["lng"],
            "rating": place.get("rating"),
            "reviews": place.get("user_ratings_total"),
            "place_id":place.get("place_id")
        }

=======
# -----------------------------------------------------------------------------------
# 파일 이름   : SearchContent.py
# 설명        : Google Maps Places API를 사용하여 지정된 음식과 위치 기준으로 근처 음식점을 검색하는 유틸 모듈
# 주요 기능   :
#   1) .env 파일에서 GOOGLE_MAPS_API_KEY 로드
#   2) find_restaurant_nearby 함수로 음식 및 위치 기준 첫 번째 검색 결과 반환
# 요구 모듈   : requests, python-dotenv, os
# -----------------------------------------------------------------------------------
import requests
import os
from dotenv import load_dotenv

load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def find_restaurant_nearby(food, location="서울, 경기"):
    endpoint = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": f"{location} {food}",
        "key": GOOGLE_MAPS_API_KEY,
        "language": "ko"
    }

    res = requests.get(endpoint, params=params)
    results = res.json()

    if results.get("status") == "OK" and results["results"]:
        place = results["results"][0]
        return {
            "name": place.get("name"),
            "address": place.get("formatted_address"),
            "latitude": place["geometry"]["location"]["lat"],
            "longitude": place["geometry"]["location"]["lng"],
            "rating": place.get("rating"),
            "reviews": place.get("user_ratings_total"),
            "place_id":place.get("place_id")
        }

>>>>>>> 5383d10 (최신)
    return None