import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './components/UI/Header.jsx';
import Legend from './components/UI/Legend.jsx';
import SearchBar from './components/Search/SearchBar.jsx';
import KoreaMap from './components/Map/KoreaMap.jsx';
import { getHealthInfo } from './utils/airQualityGrades.js';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem 1rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
  margin-top: 1rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MapSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 1024px) {
    order: -1;
  }
`;

const StationInfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const StationName = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #333;
`;

const StationLocation = styled.p`
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const AirQualityGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const PollutantCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const PollutantName = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const PollutantValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.color || '#333'};
  margin-bottom: 0.25rem;
`;

const PollutantUnit = styled.div`
  font-size: 0.75rem;
  color: #888;
`;

const OverallGrade = styled.div`
  background: ${props => props.color || '#f5f5f5'};
  color: white;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const GradeTitle = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const HealthInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid ${props => props.color || '#ddd'};
`;

const HealthTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
`;

const HealthMessage = styled.p`
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
`;

const HealthRecommendation = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
`;

const NoSelectionMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
`;

function App() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleStationClick = (stationData) => {
    setSelectedStation(stationData);
  };

  const handleSearch = async (searchTerm) => {
    setIsSearching(true);
    console.log('검색어:', searchTerm);
    // TODO: 검색 기능 구현
    setTimeout(() => setIsSearching(false), 1000);
  };

  const formatValue = (value) => {
    return value ? Math.round(value * 100) / 100 : '-';
  };

  const getGradeFromColor = (color) => {
    const colorMap = {
      '#4CAF50': 'GOOD',
      '#FFC107': 'MODERATE', 
      '#FF9800': 'BAD',
      '#F44336': 'VERY_BAD'
    };
    return colorMap[color] || 'GOOD';
  };

  return (
    <AppContainer>
      <Header lastUpdate={lastUpdate} />
      
      <MainContent>
        <SearchBar onSearch={handleSearch} isLoading={isSearching} />
        
        <ContentGrid>
          <MapSection>
            <KoreaMap 
              onStationClick={handleStationClick}
              onDataUpdate={setLastUpdate}
            />
          </MapSection>
          
          <SidePanel>
            <Legend showDetailed={false} />
            
            <StationInfoCard>
              {selectedStation ? (
                <>
                  <StationName>{selectedStation.stationName}</StationName>
                  <StationLocation>{selectedStation.addr}</StationLocation>
                  
                  <OverallGrade color={selectedStation.color}>
                    <GradeTitle>전체 대기질</GradeTitle>
                    <div>{selectedStation.grade}</div>
                  </OverallGrade>
                  
                  <AirQualityGrid>
                    <PollutantCard>
                      <PollutantName>PM2.5</PollutantName>
                      <PollutantValue color={selectedStation.pm25Color}>
                        {formatValue(selectedStation.pm25Value)}
                      </PollutantValue>
                      <PollutantUnit>㎍/㎥</PollutantUnit>
                    </PollutantCard>
                    
                    <PollutantCard>
                      <PollutantName>PM10</PollutantName>
                      <PollutantValue color={selectedStation.pm10Color}>
                        {formatValue(selectedStation.pm10Value)}
                      </PollutantValue>
                      <PollutantUnit>㎍/㎥</PollutantUnit>
                    </PollutantCard>
                    
                    <PollutantCard>
                      <PollutantName>O₃</PollutantName>
                      <PollutantValue color={selectedStation.o3Color}>
                        {formatValue(selectedStation.o3Value)}
                      </PollutantValue>
                      <PollutantUnit>ppm</PollutantUnit>
                    </PollutantCard>
                    
                    <PollutantCard>
                      <PollutantName>측정시간</PollutantName>
                      <PollutantValue style={{ fontSize: '0.9rem' }}>
                        {selectedStation.dataTime || '-'}
                      </PollutantValue>
                    </PollutantCard>
                  </AirQualityGrid>
                  
                  {(() => {
                    const grade = getGradeFromColor(selectedStation.color);
                    const healthInfo = getHealthInfo(grade);
                    return (
                      <HealthInfo color={selectedStation.color}>
                        <HealthTitle>건강 정보</HealthTitle>
                        <HealthMessage>{healthInfo.message}</HealthMessage>
                        <HealthRecommendation>{healthInfo.recommendation}</HealthRecommendation>
                      </HealthInfo>
                    );
                  })()}
                </>
              ) : (
                <NoSelectionMessage>
                  <div>📍</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    지도에서 측정소를 클릭하면<br />
                    상세한 대기질 정보를 확인할 수 있습니다
                  </div>
                </NoSelectionMessage>
              )}
            </StationInfoCard>
          </SidePanel>
        </ContentGrid>
      </MainContent>
    </AppContainer>
  );
}

export default App;
