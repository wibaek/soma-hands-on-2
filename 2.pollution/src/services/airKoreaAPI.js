import axios from "axios";
import { API_CONFIG } from "../utils/constants.js";

// Axios 인스턴스 생성
const airKoreaAPI = axios.create({
  baseURL: API_CONFIG.AIR_KOREA_BASE_URL,
  timeout: 10000,
});

/**
 * 측정소 목록 조회
 * @param {string} addr - 지역명 (선택사항)
 * @returns {Promise<Array>} 측정소 목록
 */
export const getStationList = async (addr = "") => {
  try {
    const response = await airKoreaAPI.get(
      "/MsrstnInfoInqireSvc/getMsrstnList",
      {
        params: {
          serviceKey: API_CONFIG.AIR_KOREA_API_KEY,
          returnType: "json",
          numOfRows: 1000,
          pageNo: 1,
          addr: addr,
        },
      }
    );

    if (response.data.response.header.resultCode === "00") {
      return response.data.response.body.items || [];
    } else {
      throw new Error(response.data.response.header.resultMsg);
    }
  } catch (error) {
    console.error("측정소 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 측정소별 실시간 대기질 데이터 조회
 * @param {string} stationName - 측정소명
 * @returns {Promise<Object>} 대기질 데이터
 */
export const getRealtimeAirQuality = async (stationName) => {
  try {
    const response = await airKoreaAPI.get(
      "/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty",
      {
        params: {
          serviceKey: API_CONFIG.AIR_KOREA_API_KEY,
          returnType: "json",
          numOfRows: 1,
          pageNo: 1,
          stationName: stationName,
          dataTerm: "DAILY",
          ver: "1.0",
        },
      }
    );

    if (response.data.response.header.resultCode === "00") {
      const items = response.data.response.body.items;
      return items && items.length > 0 ? items[0] : null;
    } else {
      throw new Error(response.data.response.header.resultMsg);
    }
  } catch (error) {
    console.error(`${stationName} 대기질 데이터 조회 실패:`, error);
    throw error;
  }
};

/**
 * 여러 측정소의 실시간 대기질 데이터를 병렬로 조회
 * @param {Array<string>} stationNames - 측정소명 배열
 * @returns {Promise<Array>} 대기질 데이터 배열
 */
export const getMultipleStationData = async (stationNames) => {
  try {
    const promises = stationNames.map((stationName) =>
      getRealtimeAirQuality(stationName).catch((error) => {
        console.warn(`${stationName} 데이터 조회 실패:`, error);
        return null;
      })
    );

    const results = await Promise.all(promises);
    return results.filter((result) => result !== null);
  } catch (error) {
    console.error("다중 측정소 데이터 조회 실패:", error);
    throw error;
  }
};

/**
 * 지역별 대기질 데이터 조회
 * @param {string} sidoName - 시도명
 * @returns {Promise<Array>} 지역별 대기질 데이터
 */
export const getSidoAirQuality = async (sidoName) => {
  try {
    console.log(`${sidoName} 지역 대기질 데이터 요청 시작...`);

    const response = await airKoreaAPI.get(
      "/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty",
      {
        params: {
          serviceKey: API_CONFIG.AIR_KOREA_API_KEY,
          returnType: "json",
          numOfRows: 100,
          pageNo: 1,
          sidoName: sidoName,
          ver: "1.0",
        },
      }
    );

    console.log(`${sidoName} API 응답:`, response.data);

    if (response.data.response.header.resultCode === "00") {
      const items = response.data.response.body.items || [];
      console.log(`${sidoName} 데이터 개수:`, items.length);
      return items;
    } else {
      const errorMsg = response.data.response.header.resultMsg;
      console.error(`${sidoName} API 에러:`, errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error(`${sidoName} 지역 대기질 데이터 조회 실패:`, error);
    if (error.response) {
      console.error("응답 상태:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    }
    throw error;
  }
};

/**
 * 모든 시도의 대기질 데이터 조회 (최적화된 버전)
 * @returns {Promise<Array>} 전국 대기질 데이터
 */
export const getAllSidoAirQuality = async () => {
  const sidoList = [
    "서울",
    "부산",
    "대구",
    "인천",
    "광주",
    "대전",
    "울산",
    "경기",
    "강원",
    "충북",
    "충남",
    "전북",
    "전남",
    "경북",
    "경남",
    "제주",
  ];

  console.log("전국 대기질 데이터 조회 시작...");

  const results = [];

  // 순차적으로 API 호출 (동시 호출 시 API 제한 방지)
  for (const sido of sidoList) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms 딜레이
      const data = await getSidoAirQuality(sido);

      if (data && data.length > 0) {
        // 각 시도에서 대표 측정소 선택
        const representativeStation = selectRepresentativeStation(data, sido);
        if (representativeStation) {
          results.push({
            ...representativeStation,
            sido: sido,
          });
        }
      }
    } catch (error) {
      console.warn(`${sido} 데이터 로드 실패, 건너뜀:`, error.message);
      continue;
    }
  }

  console.log(`전국 대기질 데이터 조회 완료: ${results.length}개 지역`);
  return results;
};

/**
 * 시도별 대표 측정소 선택
 * @param {Array} stations - 측정소 목록
 * @param {string} sidoName - 시도명
 * @returns {Object} 대표 측정소 데이터
 */
const selectRepresentativeStation = (stations, sidoName) => {
  if (!stations || stations.length === 0) return null;

  // 1. 시도명과 같은 이름의 측정소 우선 선택
  let representative = stations.find(
    (station) => station.stationName && station.stationName.includes(sidoName)
  );

  // 2. 없으면 첫 번째 유효한 측정소 선택 (데이터가 있는)
  if (!representative) {
    representative = stations.find(
      (station) =>
        station.pm25Value &&
        station.pm25Value !== "-" &&
        station.pm10Value &&
        station.pm10Value !== "-"
    );
  }

  // 3. 그것도 없으면 첫 번째 측정소
  if (!representative && stations.length > 0) {
    representative = stations[0];
  }

  return representative;
};
