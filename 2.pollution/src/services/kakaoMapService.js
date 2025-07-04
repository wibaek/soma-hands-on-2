import { API_CONFIG, MAP_CONFIG } from "../utils/constants.js";

let kakaoMap = null;
let markerManager = null;

/**
 * 카카오맵 SDK 로드
 * @returns {Promise<boolean>} 로드 성공 여부
 */
export const loadKakaoMapSDK = () => {
  return new Promise((resolve, reject) => {
    // API 키가 없으면 에러 메시지 표시
    if (
      !API_CONFIG.KAKAO_MAP_API_KEY ||
      API_CONFIG.KAKAO_MAP_API_KEY === "your_kakao_map_api_key_here"
    ) {
      console.error("카카오맵 API 키가 설정되지 않았습니다.");
      console.log(
        "1. https://developers.kakao.com 에서 API 키를 발급받으세요."
      );
      console.log(
        "2. .env 파일에 VITE_KAKAO_MAP_API_KEY=발급받은키 를 추가하세요."
      );
      reject(new Error("카카오맵 API 키가 필요합니다. 콘솔을 확인하세요."));
      return;
    }

    if (window.kakao && window.kakao.maps) {
      console.log("카카오맵 SDK 이미 로드됨");
      resolve(true);
      return;
    }

    console.log("카카오맵 SDK 로드 중...");
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${API_CONFIG.KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;

    script.onload = () => {
      console.log("카카오맵 SDK 스크립트 로드 완료");
      window.kakao.maps.load(() => {
        console.log("카카오맵 API 초기화 완료");
        resolve(true);
      });
    };

    script.onerror = () => {
      console.error("카카오맵 SDK 스크립트 로드 실패");
      reject(new Error("카카오맵 SDK 로드 실패"));
    };

    document.head.appendChild(script);
  });
};

/**
 * 카카오맵 초기화
 * @param {HTMLElement} container - 지도를 표시할 컨테이너
 * @returns {Object} 카카오맵 인스턴스
 */
export const initializeKakaoMap = async (container) => {
  try {
    await loadKakaoMapSDK();

    const options = {
      center: new window.kakao.maps.LatLng(
        MAP_CONFIG.DEFAULT_CENTER.lat,
        MAP_CONFIG.DEFAULT_CENTER.lng
      ),
      level: MAP_CONFIG.DEFAULT_ZOOM,
      minLevel: MAP_CONFIG.MIN_ZOOM,
      maxLevel: MAP_CONFIG.MAX_ZOOM,
    };

    kakaoMap = new window.kakao.maps.Map(container, options);
    markerManager = new MarkerManager(kakaoMap);

    return kakaoMap;
  } catch (error) {
    console.error("카카오맵 초기화 실패:", error);
    throw error;
  }
};

/**
 * 마커 관리 클래스
 */
class MarkerManager {
  constructor(map) {
    this.map = map;
    this.markers = new Map();
    this.infoWindows = new Map();
  }

  /**
   * 마커 추가
   * @param {string} id - 마커 ID
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @param {object} data - 마커 데이터
   * @param {function} clickCallback - 클릭 콜백
   */
  addMarker(id, lat, lng, data, clickCallback) {
    const position = new window.kakao.maps.LatLng(lat, lng);

    // 커스텀 마커 이미지 생성
    const markerImage = this.createMarkerImage(data.grade, data.color);

    const marker = new window.kakao.maps.Marker({
      position: position,
      image: markerImage,
      map: this.map,
    });

    // 마커 클릭 이벤트
    window.kakao.maps.event.addListener(marker, "click", () => {
      if (clickCallback) {
        clickCallback(data);
      }
      this.showInfoWindow(id, marker, data);
    });

    this.markers.set(id, marker);
  }

  /**
   * 커스텀 마커 이미지 생성
   * @param {string} grade - 대기질 등급
   * @param {string} color - 색상
   * @returns {Object} 마커 이미지
   */
  createMarkerImage(grade, color) {
    const canvas = document.createElement("canvas");
    canvas.width = 30;
    canvas.height = 30;
    const ctx = canvas.getContext("2d");

    // 원형 마커 그리기
    ctx.beginPath();
    ctx.arc(15, 15, 12, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 데이터 URL로 변환
    const dataURL = canvas.toDataURL();

    return new window.kakao.maps.MarkerImage(
      dataURL,
      new window.kakao.maps.Size(30, 30),
      { offset: new window.kakao.maps.Point(15, 15) }
    );
  }

  /**
   * 정보창 표시
   * @param {string} id - 마커 ID
   * @param {Object} marker - 마커 인스턴스
   * @param {Object} data - 데이터
   */
  showInfoWindow(id, marker, data) {
    // 기존 정보창 닫기
    this.closeAllInfoWindows();

    const content = this.createInfoWindowContent(data);

    const infoWindow = new window.kakao.maps.InfoWindow({
      content: content,
      removable: true,
    });

    infoWindow.open(this.map, marker);
    this.infoWindows.set(id, infoWindow);
  }

  /**
   * 정보창 컨텐츠 생성
   * @param {Object} data - 데이터
   * @returns {string} HTML 컨텐츠
   */
  createInfoWindowContent(data) {
    return `
      <div style="padding: 10px; min-width: 200px;">
        <div style="font-weight: bold; margin-bottom: 5px;">${
          data.stationName
        }</div>
        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${
          data.addr || ""
        }</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>PM2.5:</span>
          <span style="color: ${data.pm25Color || "#666"}; font-weight: bold;">
            ${data.pm25Value || "-"}㎍/㎥
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>PM10:</span>
          <span style="color: ${data.pm10Color || "#666"}; font-weight: bold;">
            ${data.pm10Value || "-"}㎍/㎥
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>O3:</span>
          <span style="color: ${data.o3Color || "#666"}; font-weight: bold;">
            ${data.o3Value || "-"}ppm
          </span>
        </div>
        <div style="text-align: center; margin-top: 8px; padding: 5px; background: ${
          data.color || "#f5f5f5"
        }; border-radius: 4px;">
          <span style="color: white; font-weight: bold;">${
            data.grade || "정보없음"
          }</span>
        </div>
      </div>
    `;
  }

  /**
   * 모든 정보창 닫기
   */
  closeAllInfoWindows() {
    this.infoWindows.forEach((infoWindow) => {
      infoWindow.close();
    });
    this.infoWindows.clear();
  }

  /**
   * 마커 제거
   * @param {string} id - 마커 ID
   */
  removeMarker(id) {
    const marker = this.markers.get(id);
    if (marker) {
      marker.setMap(null);
      this.markers.delete(id);
    }

    const infoWindow = this.infoWindows.get(id);
    if (infoWindow) {
      infoWindow.close();
      this.infoWindows.delete(id);
    }
  }

  /**
   * 모든 마커 제거
   */
  clearMarkers() {
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });
    this.markers.clear();
    this.closeAllInfoWindows();
  }
}

/**
 * 현재 마커 매니저 반환
 * @returns {MarkerManager} 마커 매니저 인스턴스
 */
export const getMarkerManager = () => markerManager;

/**
 * 현재 카카오맵 인스턴스 반환
 * @returns {Object} 카카오맵 인스턴스
 */
export const getKakaoMap = () => kakaoMap;
