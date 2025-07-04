import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { initializeKakaoMap, getMarkerManager } from '../../services/kakaoMapService.js';
import { getAllSidoAirQuality } from '../../services/airKoreaAPI.js';
import { getAirQualityGrade, getOverallAirQuality } from '../../utils/airQualityGrades.js';
import { REFRESH_INTERVAL } from '../../utils/constants.js';

const MapContainer = styled.div`
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 8px;
`;

const ErrorMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #e74c3c;
  background: #fdf2f2;
  border: 1px solid #f8d7da;
  border-radius: 8px;
  margin: 10px 0;
`;

const RefreshButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const KoreaMap = ({ onStationClick }) => {
  const mapRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 지도 초기화
  useEffect(() => {
    const initMap = async () => {
      try {
        console.log('=== 지도 초기화 시작 ===');
        setIsLoading(true);
        setError(null);
        
        if (!mapRef.current) {
          throw new Error('지도 컨테이너를 찾을 수 없습니다.');
        }

        console.log('지도 컨테이너 확인됨:', mapRef.current);
        
        try {
          console.log('카카오맵 초기화 시도...');
          await initializeKakaoMap(mapRef.current);
          console.log('카카오맵 초기화 성공');
        } catch (mapError) {
          console.error('카카오맵 초기화 실패:', mapError);
          console.log('테스트 데이터만 로드합니다...');
          // 지도 없이도 테스트 데이터는 로드
        }
        
        console.log('측정소 데이터 로드 시작...');
        await loadStationData();
        console.log('측정소 데이터 로드 완료');
        
        // 자동 새로고침 설정
        startAutoRefresh();
        console.log('=== 지도 초기화 완료 ===');
        
      } catch (error) {
        console.error('=== 지도 초기화 실패 ===');
        console.error('에러 상세:', error);
        console.error('에러 스택:', error.stack);
        
        let errorMessage = '지도를 불러올 수 없습니다.';
        if (error.message.includes('API 키')) {
          errorMessage = 'API 키를 설정해주세요. 브라우저 콘솔을 확인하세요.';
        } else if (error.message.includes('네트워크')) {
          errorMessage = '네트워크 연결을 확인해주세요.';
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initMap();

    // 컴포넌트 언마운트 시 정리
    return () => {
      stopAutoRefresh();
    };
  }, []);

  // 측정소 데이터 로드
  const loadStationData = async () => {
    try {
      const markerManager = getMarkerManager();
      if (!markerManager) {
        console.error('마커 매니저를 찾을 수 없습니다.');
        return;
      }
      
      // 기존 마커 제거
      markerManager.clearMarkers();
      
      console.log('=== 실제 에어코리아 API 데이터 로드 시작 ===');
      
      try {
        // 실제 에어코리아 API 호출
        const realStationData = await getAllSidoAirQuality();
        
        if (realStationData && realStationData.length > 0) {
          console.log(`실제 API 데이터 로드 성공: ${realStationData.length}개 지역`);
          
          // 좌표 데이터 보완을 위한 기본 좌표 맵핑
          const coordinateMap = getDefaultCoordinates();
          
          realStationData.forEach((stationData) => {
            try {
              // 좌표가 없으면 기본 좌표 사용
              const coords = getStationCoordinates(stationData, coordinateMap);
              
              if (coords) {
                const markerData = createMarkerData(stationData);
                console.log(`${stationData.stationName} 실제 데이터 마커:`, markerData);
                
                markerManager.addMarker(
                  stationData.stationName,
                  coords.lat,
                  coords.lng,
                  markerData,
                  (data) => {
                    console.log('실제 데이터 마커 클릭됨:', data);
                    if (onStationClick) {
                      onStationClick(data);
                    }
                  }
                );
                
                console.log(`${stationData.stationName} 실제 데이터 마커 생성 완료`);
              } else {
                console.warn(`${stationData.stationName}: 좌표 정보 없음, 건너뜀`);
              }
            } catch (error) {
              console.error(`${stationData.stationName} 마커 생성 실패:`, error);
            }
          });
          
          console.log('=== 실제 API 데이터 로드 완료 ===');
          setLastUpdate(new Date());
          
        } else {
          throw new Error('API에서 데이터를 받아오지 못했습니다.');
        }
        
      } catch (apiError) {
        console.error('실제 API 호출 실패, 백업 데이터 사용:', apiError);
        
        // API 실패 시 백업 테스트 데이터 사용
        await loadBackupTestData(markerManager);
        setLastUpdate(new Date());
      }
      
    } catch (error) {
      console.error('측정소 데이터 로드 실패:', error);
      setError('대기질 데이터를 불러올 수 없습니다: ' + error.message);
    }
  };

  // 백업 테스트 데이터 로드
  const loadBackupTestData = async (markerManager) => {
    console.log('=== 백업 테스트 데이터 로드 ===');
    
    const testStations = [
      {
        stationName: '서울 종로구',
        sidoName: '서울',
        dmX: '126.9784',
        dmY: '37.5944',
        pm25Value: '15',
        pm10Value: '35',
        o3Value: '0.045',
        dataTime: '2024-01-01 14:00'
      },
      {
        stationName: '부산 중구',
        sidoName: '부산',
        dmX: '129.0756',
        dmY: '35.1796',
        pm25Value: '25',
        pm10Value: '45',
        o3Value: '0.055',
        dataTime: '2024-01-01 14:00'
      },
      {
        stationName: '대구 중구',
        sidoName: '대구',
        dmX: '128.6014',
        dmY: '35.8714',
        pm25Value: '35',
        pm10Value: '65',
        o3Value: '0.065',
        dataTime: '2024-01-01 14:00'
      },
      {
        stationName: '인천 중구',
        sidoName: '인천',
        dmX: '126.7052',
        dmY: '37.4563',
        pm25Value: '45',
        pm10Value: '85',
        o3Value: '0.075',
        dataTime: '2024-01-01 14:00'
      },
      {
        stationName: '광주 동구',
        sidoName: '광주',
        dmX: '126.8526',
        dmY: '35.1595',
        pm25Value: '20',
        pm10Value: '40',
        o3Value: '0.050',
        dataTime: '2024-01-01 14:00'
      }
    ];

    testStations.forEach((stationData) => {
      try {
        const markerData = createMarkerData(stationData);
        
        markerManager.addMarker(
          stationData.stationName,
          parseFloat(stationData.dmY),
          parseFloat(stationData.dmX),
          markerData,
          (data) => {
            if (onStationClick) {
              onStationClick(data);
            }
          }
        );
      } catch (error) {
        console.error(`${stationData.stationName} 테스트 마커 생성 실패:`, error);
      }
    });
    
    console.log('백업 테스트 데이터 로드 완료');
  };

  // 기본 좌표 매핑 (에어코리아 API에 좌표가 없는 경우 대비)
  const getDefaultCoordinates = () => {
    return {
      '서울': { lat: 37.5665, lng: 126.9780 },
      '부산': { lat: 35.1796, lng: 129.0756 },
      '대구': { lat: 35.8714, lng: 128.6014 },
      '인천': { lat: 37.4563, lng: 126.7052 },
      '광주': { lat: 35.1595, lng: 126.8526 },
      '대전': { lat: 36.3504, lng: 127.3845 },
      '울산': { lat: 35.5384, lng: 129.3114 },
      '경기': { lat: 37.4138, lng: 127.5183 },
      '강원': { lat: 37.8228, lng: 128.1555 },
      '충북': { lat: 36.8, lng: 127.7 },
      '충남': { lat: 36.5, lng: 126.8 },
      '전북': { lat: 35.7175, lng: 127.153 },
      '전남': { lat: 34.8679, lng: 126.991 },
      '경북': { lat: 36.4919, lng: 128.888 },
      '경남': { lat: 35.4606, lng: 128.2132 },
      '제주': { lat: 33.4996, lng: 126.5312 }
    };
  };

  // 측정소 좌표 가져오기
  const getStationCoordinates = (stationData, coordinateMap) => {
    // 1. API에서 좌표가 있으면 사용
    if (stationData.dmX && stationData.dmY) {
      return {
        lat: parseFloat(stationData.dmY),
        lng: parseFloat(stationData.dmX)
      };
    }
    
    // 2. 시도명으로 기본 좌표 찾기
    if (stationData.sido && coordinateMap[stationData.sido]) {
      return coordinateMap[stationData.sido];
    }
    
    // 3. 측정소명에서 지역명 추출해서 찾기
    for (const [region, coords] of Object.entries(coordinateMap)) {
      if (stationData.stationName && stationData.stationName.includes(region)) {
        return coords;
      }
    }
    
    return null;
  };

  // 마커 데이터 생성 (실제 API 데이터 구조에 맞게 개선)
  const createMarkerData = (stationData) => {
    console.log('원본 측정소 데이터:', stationData);
    
    // 값 파싱 및 정리 (API에서 문자열로 올 수 있음)
    const pm25Value = parseNumericValue(stationData.pm25Value);
    const pm10Value = parseNumericValue(stationData.pm10Value);
    const o3Value = parseNumericValue(stationData.o3Value);
    
    console.log('파싱된 값들:', { pm25Value, pm10Value, o3Value });
    
    // 전체 대기질 등급 계산
    const overallGrade = getOverallAirQuality({
      pm25: pm25Value,
      pm10: pm10Value,
      o3: o3Value
    });
    
    // 개별 오염물질 등급
    const pm25Grade = pm25Value ? getAirQualityGrade('PM25', pm25Value) : null;
    const pm10Grade = pm10Value ? getAirQualityGrade('PM10', pm10Value) : null;
    const o3Grade = o3Value ? getAirQualityGrade('O3', o3Value) : null;
    
    console.log('계산된 등급들:', { overallGrade, pm25Grade, pm10Grade, o3Grade });
    
    return {
      stationName: stationData.stationName || '측정소명 없음',
      addr: stationData.sido || stationData.sidoName || '지역 정보 없음',
      grade: overallGrade.label,
      color: overallGrade.color,
      pm25Value: pm25Value,
      pm25Color: pm25Grade?.color,
      pm10Value: pm10Value,
      pm10Color: pm10Grade?.color,
      o3Value: o3Value,
      o3Color: o3Grade?.color,
      dataTime: stationData.dataTime || '시간 정보 없음',
      rawData: stationData
    };
  };

  // 숫자 값 파싱 유틸리티 함수
  const parseNumericValue = (value) => {
    if (value === null || value === undefined || value === '-' || value === '') {
      return null;
    }
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  // 자동 새로고침 시작
  const startAutoRefresh = () => {
    stopAutoRefresh(); // 기존 타이머 정리
    
    refreshIntervalRef.current = setInterval(() => {
      loadStationData();
    }, REFRESH_INTERVAL);
  };

  // 자동 새로고침 중지
  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  // 수동 새로고침
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await loadStationData();
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
      setError('데이터 새로고침에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <RefreshButton 
        onClick={handleRefresh} 
        disabled={isLoading}
        title={lastUpdate ? `마지막 업데이트: ${lastUpdate.toLocaleTimeString()}` : '새로고침'}
      >
        🔄 새로고침
      </RefreshButton>
      
      <MapContainer ref={mapRef} />
      
      {isLoading && (
        <LoadingOverlay>
          <div>지도 데이터를 불러오는 중...</div>
        </LoadingOverlay>
      )}
    </div>
  );
};

export default KoreaMap; 