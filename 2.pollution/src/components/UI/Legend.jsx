import React from 'react';
import styled from 'styled-components';
import { AIR_QUALITY_GRADES } from '../../utils/constants.js';

const LegendContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin: 1rem 0;
`;

const LegendTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ColorBox = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
`;

const LabelText = styled.span`
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
`;

const RangeText = styled.span`
  font-size: 0.75rem;
  color: #666;
  margin-left: 0.25rem;
`;

const PollutantSection = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PollutantTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #555;
  font-weight: 600;
`;

const Legend = ({ showDetailed = false }) => {
  // 기본 범례 (전체 등급만 표시)
  const basicLegend = [
    { label: '좋음', color: '#4CAF50' },
    { label: '보통', color: '#FFC107' },
    { label: '나쁨', color: '#FF9800' },
    { label: '매우나쁨', color: '#F44336' }
  ];

  if (!showDetailed) {
    return (
      <LegendContainer>
        <LegendTitle>대기질 등급</LegendTitle>
        <LegendGrid>
          {basicLegend.map((item, index) => (
            <LegendItem key={index}>
              <ColorBox color={item.color} />
              <LabelText>{item.label}</LabelText>
            </LegendItem>
          ))}
        </LegendGrid>
      </LegendContainer>
    );
  }

  // 상세 범례 (각 오염물질별 기준 표시)
  return (
    <LegendContainer>
      <LegendTitle>대기질 등급 기준</LegendTitle>
      
      <PollutantSection>
        <PollutantTitle>PM2.5 (㎍/㎥)</PollutantTitle>
        <LegendGrid>
          {Object.entries(AIR_QUALITY_GRADES.PM25).map(([key, grade]) => (
            <LegendItem key={key}>
              <ColorBox color={grade.color} />
              <div>
                <LabelText>{grade.label}</LabelText>
                <RangeText>
                  {grade.max === Infinity ? `${grade.min}+` : `${grade.min}-${grade.max}`}
                </RangeText>
              </div>
            </LegendItem>
          ))}
        </LegendGrid>
      </PollutantSection>

      <PollutantSection>
        <PollutantTitle>PM10 (㎍/㎥)</PollutantTitle>
        <LegendGrid>
          {Object.entries(AIR_QUALITY_GRADES.PM10).map(([key, grade]) => (
            <LegendItem key={key}>
              <ColorBox color={grade.color} />
              <div>
                <LabelText>{grade.label}</LabelText>
                <RangeText>
                  {grade.max === Infinity ? `${grade.min}+` : `${grade.min}-${grade.max}`}
                </RangeText>
              </div>
            </LegendItem>
          ))}
        </LegendGrid>
      </PollutantSection>

      <PollutantSection>
        <PollutantTitle>O₃ (ppm)</PollutantTitle>
        <LegendGrid>
          {Object.entries(AIR_QUALITY_GRADES.O3).map(([key, grade]) => (
            <LegendItem key={key}>
              <ColorBox color={grade.color} />
              <div>
                <LabelText>{grade.label}</LabelText>
                <RangeText>
                  {grade.max === Infinity ? `${grade.min}+` : `${grade.min}-${grade.max}`}
                </RangeText>
              </div>
            </LegendItem>
          ))}
        </LegendGrid>
      </PollutantSection>
    </LegendContainer>
  );
};

export default Legend; 