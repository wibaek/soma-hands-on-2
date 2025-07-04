import React, { useState } from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #6c757d;
  }
`;

const SearchButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: #f8f9fa;
    color: #495057;
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin: 0;
  padding: 0;
  list-style: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.li`
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SearchBar = ({ onSearch, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 한국 주요 지역 목록
  const regions = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
    '서울 종로구', '서울 중구', '서울 용산구', '서울 성동구', '서울 광진구',
    '부산 중구', '부산 서구', '부산 동구', '부산 영도구', '부산 부산진구',
    '대구 중구', '대구 동구', '대구 서구', '대구 남구', '대구 북구',
    '인천 중구', '인천 동구', '인천 미추홀구', '인천 연수구', '인천 남동구',
    '광주 동구', '광주 서구', '광주 남구', '광주 북구', '광주 광산구'
  ];

  // 검색어에 따른 추천 목록 필터링
  const filteredSuggestions = searchTerm.length > 0 
    ? regions.filter(region => 
        region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.includes(searchTerm)
      ).slice(0, 8) // 최대 8개까지만 표시
    : [];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSearch = () => {
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm.trim());
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // 약간의 딜레이를 두어 추천 목록 클릭이 가능하도록 함
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <SearchContainer>
      <SearchInputWrapper>
        <SearchInput
          type="text"
          placeholder="지역명을 입력하세요 (예: 서울, 부산, 서울 종로구)"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={isLoading}
        />
        
        {searchTerm && (
          <ClearButton onClick={handleClear} type="button">
            ✕
          </ClearButton>
        )}
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <SuggestionsList>
            {filteredSuggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </SuggestionItem>
            ))}
          </SuggestionsList>
        )}
      </SearchInputWrapper>
      
      <SearchButton 
        onClick={handleSearch} 
        disabled={!searchTerm.trim() || isLoading}
      >
        {isLoading ? '검색 중...' : '🔍 검색'}
      </SearchButton>
    </SearchContainer>
  );
};

export default SearchBar; 