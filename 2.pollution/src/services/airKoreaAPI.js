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

    if (response.data.response.header.resultCode === "00") {
      return response.data.response.body.items || [];
    } else {
      throw new Error(response.data.response.header.resultMsg);
    }
  } catch (error) {
    console.error(`${sidoName} 지역 대기질 데이터 조회 실패:`, error);
    throw error;
  }
};
