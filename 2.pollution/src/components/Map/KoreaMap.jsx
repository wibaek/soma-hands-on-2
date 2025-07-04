import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { initializeKakaoMap, getMarkerManager } from '../../services/kakaoMapService.js';
import { getSidoAirQuality } from '../../services/airKoreaAPI.js';
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
        setIsLoading(true);
        setError(null);
        
        if (mapRef.current) {
          await initializeKakaoMap(mapRef.current);
          await loadStationData();
          
          // 자동 새로고침 설정
          startAutoRefresh();
        }
      } catch (error) {
        console.error('지도 초기화 실패:', error);
        setError('지도를 불러올 수 없습니다. API 키를 확인해주세요.');
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
      // 주요 시도별 대기질 데이터 조회
      const sidoList = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
      
      const markerManager = getMarkerManager();
      if (!markerManager) return;
      
      // 기존 마커 제거
      markerManager.clearMarkers();
      
      for (const sido of sidoList) {
        try {
          const airQualityData = await getSidoAirQuality(sido);
          
          if (airQualityData && airQualityData.length > 0) {
            // 각 시도의 첫 번째 측정소 데이터를 사용
            const stationData = airQualityData[0];
            
            if (stationData.dmX && stationData.dmY) {
              const markerData = createMarkerData(stationData);
              
              markerManager.addMarker(
                stationData.stationName,
                parseFloat(stationData.dmY), // 위도
                parseFloat(stationData.dmX), // 경도
                markerData,
                (data) => {
                  if (onStationClick) {
                    onStationClick(data);
                  }
                }
              );
            }
          }
        } catch (error) {
          console.warn(`${sido} 지역 데이터 로드 실패:`, error);
        }
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('측정소 데이터 로드 실패:', error);
      setError('대기질 데이터를 불러올 수 없습니다.');
    }
  };

  // 마커 데이터 생성
  const createMarkerData = (stationData) => {
    const pm25Value = parseFloat(stationData.pm25Value) || null;
    const pm10Value = parseFloat(stationData.pm10Value) || null;
    const o3Value = parseFloat(stationData.o3Value) || null;
    
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
    
    return {
      stationName: stationData.stationName,
      addr: stationData.sidoName,
      grade: overallGrade.label,
      color: overallGrade.color,
      pm25Value: pm25Value,
      pm25Color: pm25Grade?.color,
      pm10Value: pm10Value,
      pm10Color: pm10Grade?.color,
      o3Value: o3Value,
      o3Color: o3Grade?.color,
      dataTime: stationData.dataTime,
      rawData: stationData
    };
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