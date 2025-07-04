import { AIR_QUALITY_GRADES } from "./constants.js";

/**
 * 대기오염물질 농도에 따른 등급을 반환
 * @param {string} pollutant - 오염물질 타입 (PM25, PM10, O3)
 * @param {number} value - 농도 값
 * @returns {object} 등급 정보 (label, color, min, max)
 */
export const getAirQualityGrade = (pollutant, value) => {
  if (!value || value < 0) return null;

  const grades = AIR_QUALITY_GRADES[pollutant];
  if (!grades) return null;

  for (const [key, grade] of Object.entries(grades)) {
    if (value >= grade.min && value <= grade.max) {
      return { ...grade, grade: key };
    }
  }

  return null;
};

/**
 * 여러 오염물질의 농도로 전체 대기질 등급을 계산
 * @param {object} pollutants - 오염물질 농도 데이터
 * @returns {object} 최종 대기질 등급
 */
export const getOverallAirQuality = (pollutants) => {
  const { pm25, pm10, o3 } = pollutants;

  const grades = [];

  if (pm25) grades.push(getAirQualityGrade("PM25", pm25));
  if (pm10) grades.push(getAirQualityGrade("PM10", pm10));
  if (o3) grades.push(getAirQualityGrade("O3", o3));

  // 가장 나쁜 등급을 반환
  const gradeOrder = ["GOOD", "MODERATE", "BAD", "VERY_BAD"];
  let worstGrade = "GOOD";

  grades.forEach((grade) => {
    if (
      grade &&
      gradeOrder.indexOf(grade.grade) > gradeOrder.indexOf(worstGrade)
    ) {
      worstGrade = grade.grade;
    }
  });

  // 가장 나쁜 등급의 정보를 반환 (첫 번째로 해당하는 오염물질 기준)
  for (const grade of grades) {
    if (grade && grade.grade === worstGrade) {
      return grade;
    }
  }

  return AIR_QUALITY_GRADES.PM25.GOOD;
};

/**
 * 대기질 등급에 따른 건강 정보 메시지
 * @param {string} grade - 등급 (GOOD, MODERATE, BAD, VERY_BAD)
 * @returns {object} 건강 정보
 */
export const getHealthInfo = (grade) => {
  const healthMessages = {
    GOOD: {
      title: "좋음",
      message: "대기오염 관련 질환자군에서도 영향이 거의 없는 수준",
      recommendation: "모든 연령층에서 실외활동 가능",
    },
    MODERATE: {
      title: "보통",
      message:
        "민감군에서는 장시간 또는 무리한 실외활동 시 영향이 있을 수 있음",
      recommendation: "민감군은 장시간 실외활동을 줄이는 것이 좋음",
    },
    BAD: {
      title: "나쁨",
      message: "민감군에서는 단시간 실외활동도 영향이 있을 수 있음",
      recommendation:
        "민감군은 실외활동을 자제하고, 일반인도 장시간 실외활동을 자제",
    },
    VERY_BAD: {
      title: "매우나쁨",
      message: "모든 사람들에게 영향이 있을 수 있음",
      recommendation: "모든 연령층에서 실외활동을 자제하고 실내 생활을 권장",
    },
  };

  return healthMessages[grade] || healthMessages.GOOD;
};
