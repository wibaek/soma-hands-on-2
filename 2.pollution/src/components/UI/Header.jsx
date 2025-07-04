import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Subtitle = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`;

const UpdateTime = styled.div`
  font-size: 0.85rem;
  opacity: 0.8;
`;

const DataSource = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
`;

const Header = ({ lastUpdate }) => {
  const formatTime = (date) => {
    if (!date) return '-';
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <div>
          <Title>
            🌍 실시간 대기질 정보
          </Title>
          <Subtitle>
            환경부 에어코리아 데이터 기반 한국 대기오염 현황
          </Subtitle>
        </div>
        <InfoSection>
          <UpdateTime>
            마지막 업데이트: {formatTime(lastUpdate)}
          </UpdateTime>
          <DataSource>
            데이터 제공: 환경부/한국환경공단
          </DataSource>
        </InfoSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header; 