// API 관련 상수
export const API_CONFIG = {
  AIR_KOREA_BASE_URL: "https://apis.data.go.kr/B552584",
  AIR_KOREA_API_KEY: import.meta.env.VITE_AIR_KOREA_API_KEY || "",
  KAKAO_MAP_API_KEY: import.meta.env.VITE_KAKAO_MAP_API_KEY || "",
};

// 대기질 등급 기준
export const AIR_QUALITY_GRADES = {
  PM25: {
    GOOD: { min: 0, max: 15, label: "좋음", color: "#4CAF50" },
    MODERATE: { min: 16, max: 35, label: "보통", color: "#FFC107" },
    BAD: { min: 36, max: 75, label: "나쁨", color: "#FF9800" },
    VERY_BAD: { min: 76, max: Infinity, label: "매우나쁨", color: "#F44336" },
  },
  PM10: {
    GOOD: { min: 0, max: 30, label: "좋음", color: "#4CAF50" },
    MODERATE: { min: 31, max: 80, label: "보통", color: "#FFC107" },
    BAD: { min: 81, max: 150, label: "나쁨", color: "#FF9800" },
    VERY_BAD: { min: 151, max: Infinity, label: "매우나쁨", color: "#F44336" },
  },
  O3: {
    GOOD: { min: 0, max: 0.03, label: "좋음", color: "#4CAF50" },
    MODERATE: { min: 0.031, max: 0.09, label: "보통", color: "#FFC107" },
    BAD: { min: 0.091, max: 0.15, label: "나쁨", color: "#FF9800" },
    VERY_BAD: {
      min: 0.151,
      max: Infinity,
      label: "매우나쁨",
      color: "#F44336",
    },
  },
};

// 지도 설정
export const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: 36.5,
    lng: 127.5,
  },
  DEFAULT_ZOOM: 7,
  MIN_ZOOM: 6,
  MAX_ZOOM: 13,
};

// 자동 새로고침 간격 (5분)
export const REFRESH_INTERVAL = 5 * 60 * 1000;
