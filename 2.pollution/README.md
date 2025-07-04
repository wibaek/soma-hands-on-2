# 대기오염 시각화 웹 애플리케이션 🌍

## 프로젝트 개요
환경부 에어코리아 API를 활용하여 한국의 실시간 대기질 정보를 지도 위에 시각화하는 웹 애플리케이션입니다.

## 주요 기능
- 📍 **실시간 대기질 데이터 시각화**: 미세먼지(PM10), 초미세먼지(PM2.5), 오존(O3) 등 주요 오염물질 농도 표시
- 🗺️ **한국 지도 기반 인터페이스**: 지역별 대기질 상태를 색상/마커로 직관적 표시
- 🔍 **측정소별 상세 정보**: 특정 지역 클릭 시 해당 측정소의 상세 대기질 정보 제공
- 📊 **대기질 등급 시스템**: 좋음/보통/나쁨/매우나쁨 4단계 등급으로 시각적 구분
- 🔎 **지역 검색**: 지역명으로 원하는 지역의 대기질 정보 빠른 조회

## 기술 스택

### Frontend
- **React 18** + **Vite** - 모던 리액트 개발 환경
- **카카오맵 API** - 한국 지역에 최적화된 지도 서비스
- **Axios** - HTTP 클라이언트
- **Styled-Components** - CSS-in-JS 스타일링

### 데이터 소스
- **환경부 에어코리아 Open API** - 실시간 대기질 데이터

## API 정보

### 에어코리아 Open API
- **기관**: 환경부/한국환경공단
- **주요 엔드포인트**:
  - 측정소 정보 조회: `/MsrstnInfoInqireSvc/getMsrstnList`
  - 실시간 측정 데이터: `/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty`
- **제공 데이터**: PM10, PM2.5, O3, NO2, CO, SO2 농도 및 등급

## 프로젝트 구조
```
src/
├── components/
│   ├── Map/
│   │   ├── KoreaMap.jsx          # 메인 지도 컴포넌트
│   │   ├── AirQualityMarker.jsx  # 대기질 마커 컴포넌트
│   │   └── InfoPopup.jsx         # 상세 정보 팝업
│   ├── Search/
│   │   ├── SearchBar.jsx         # 지역 검색바
│   │   └── FilterOptions.jsx     # 필터 옵션
│   └── UI/
│       ├── Header.jsx            # 헤더 컴포넌트
│       ├── Legend.jsx            # 범례 컴포넌트
│       └── StatusPanel.jsx       # 상태 패널
├── services/
│   ├── airKoreaAPI.js           # 에어코리아 API 연동 서비스
│   └── kakaoMapService.js       # 카카오맵 관련 서비스
├── utils/
│   ├── airQualityGrades.js      # 대기질 등급 유틸리티
│   └── constants.js             # 상수 정의
└── styles/
    └── components/              # 스타일 관련 파일
```

## 개발 단계

### 1단계: 프로젝트 설정 및 기본 구조
- [ ] 필요한 패키지 설치 (`axios`, `styled-components`)
- [ ] 프로젝트 폴더 구조 설정
- [ ] 환경 변수 설정 (에어코리아 API 키, 카카오맵 API 키 등)

### 2단계: 기본 지도 및 API 연동
- [ ] 카카오맵 API를 사용한 한국 지도 표시
- [ ] 에어코리아 API 키 발급 및 연동 테스트
- [ ] 카카오맵 API 키 발급 및 연동 테스트
- [ ] 측정소 목록 조회 기능 구현
- [ ] 기본 마커로 측정소 위치 표시

### 3단계: 실시간 데이터 시각화
- [ ] 실시간 대기질 데이터 가져오기
- [ ] 대기질 등급에 따른 마커 색상 변경 시스템
- [ ] 자동 새로고침 기능 구현 (5분 간격)
- [ ] 로딩 상태 및 에러 처리

### 4단계: 상세 정보 및 UI 개선
- [ ] 마커 클릭 시 상세 정보 팝업 구현
- [ ] 헤더 및 네비게이션 컴포넌트
- [ ] 범례 컴포넌트 (색상별 대기질 등급 설명)
- [ ] 반응형 디자인 적용

### 5단계: 검색 및 필터 기능
- [ ] 지역명 검색 기능
- [ ] 대기질 등급별 필터링
- [ ] 즐겨찾기 지역 설정
- [ ] 지역별 정렬 기능

### 6단계: 추가 기능 및 최적화
- [ ] 대기질 예보 정보 표시
- [ ] 대기질 히스토리 차트
- [ ] PWA 기능 추가
- [ ] 성능 최적화 및 코드 스플리팅

## 화면 설계

### 메인 화면
```
+--------------------------------------------------------+
| 🌍 실시간 대기질 정보                [새로고침] [설정]    |
+--------------------------------------------------------+
| [검색창: 지역명 입력]  [필터: 전체/좋음/나쁨]           |
+--------------------------------------------------------+
|                                                        |
|    📍 한국 지도 영역                                    |
|    - 각 측정소를 색상별 마커로 표시                      |
|    - 클릭 시 상세 정보 팝업                             |
|                                                        |
|    🟢 좋음  🟡 보통  🟠 나쁨  🔴 매우나쁨            |
+--------------------------------------------------------+
| 선택된 지역: 서울 중구                                  |
| PM2.5: 25㎍/㎥ (보통)  PM10: 45㎍/㎥ (보통)          |
| O3: 0.045ppm (보통)   업데이트: 14:00                  |
+--------------------------------------------------------+
```

## 대기질 등급 기준

| 등급 | PM2.5 | PM10 | O3 | 색상 |
|------|-------|------|----|----|
| 좋음 | 0-15 | 0-30 | 0-0.030 | 🟢 |
| 보통 | 16-35 | 31-80 | 0.031-0.090 | 🟡 |
| 나쁨 | 36-75 | 81-150 | 0.091-0.150 | 🟠 |
| 매우나쁨 | 76+ | 151+ | 0.151+ | 🔴 |

## 설치 및 실행

### 필수 조건
- Node.js 16.0.0 이상
- npm 또는 yarn

### 설치
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 에어코리아 API 키 설정
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

## 환경 변수

### `.env` 파일 예시
```
VITE_AIR_KOREA_API_KEY=your_air_korea_api_key_here
VITE_API_BASE_URL=http://openapi.airkorea.or.kr/openapi/services/rest
VITE_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
```

## API 키 발급 방법

### 에어코리아 API 키
1. [공공데이터포털](https://www.data.go.kr) 회원가입
2. "에어코리아_대기오염정보" 검색
3. 활용신청 및 승인 대기
4. 발급받은 API 키를 `.env` 파일에 설정

### 카카오맵 API 키
1. [카카오 개발자센터](https://developers.kakao.com) 회원가입
2. 애플리케이션 추가하기
3. 플랫폼 설정에서 웹 플랫폼 추가
4. JavaScript 키를 `.env` 파일에 설정

## 기여 방법

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 참고 자료

- [에어코리아 공식 사이트](https://airkorea.or.kr/)
- [카카오맵 API 공식 문서](https://apis.map.kakao.com/)
- [카카오 개발자센터](https://developers.kakao.com/)
- [공공데이터포털](https://www.data.go.kr/) 