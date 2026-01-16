# 13. Impact Visualization & ESG Data Specification

## 1. 개요 (Overview)
BuildCTC는 실물 자산(RWA) 기반의 투자 플랫폼입니다. 사용자가 자신의 투자가 실제로 어디에서(Where) 사용되고, 어떤 긍정적인 영향(What Impact)을 미치는지 체감할 수 있도록 하는 것은 플랫폼의 신뢰도와 사용자 경험(UX)에 결정적입니다.
본 문서는 Google Maps API를 활용한 **지리적 시각화**와 **ESG(환경·사회·지배구조) 임팩트 데이터**를 표현하기 위한 기술 명세를 정의합니다.

## 2. 주요 기능 및 목표 (Key Features & Goals)

### 2.1 인터랙티브 임팩트 맵 (Interactive Impact Map)
*   **목표**: 투자 상품(채권)의 물리적 위치를 지도상에 핀(Marker)으로 표시하여 실체성(Tangibility)을 강조.
*   **기능**:
    *   Google Maps 연동.
    *   클러스터링(Clustering): 여러 투자가 밀집된 지역 그룹화.
    *   정보 창(Info Window): 핀 클릭 시 해당 투자의 요약 정보(이미지, 수익률, 제목) 표시.

### 2.2 ESG 임팩트 대시보드 (ESG Dashboard)
*   **목표**: 단순한 금전적 수익(ROI)을 넘어 사회적 기여도를 수치화하여 표시.
*   **지표 예시**:
    *   🌱 탄소 배출 감소량 (Carbon Offset)
    *   👥 일자리 창출 수 (Jobs Created)
    *   🏢 소상공인 지원 수 (SMEs Supported)

### 2.3 프로젝트 스토리텔링 (Storytelling)
*   **목표**: 차갑고 딱딱한 금융 데이터에 인간적인 서사를 부여.
*   **콘텐츠**: 현장 사진, 수혜자 인터뷰 영상, 프로젝트 진행 현황 타임라인.

## 3. 기술 아키텍처 (Technical Architecture)

### 3.1 기술 스택
*   **Map Provider**: `@vis.gl/react-google-maps` (React 최적화 라이브러리)
*   **Data Visualization**: `recharts` (기존 라이브러리 활용)
*   **Frontend**: React Router v7 components

### 3.2 데이터 모델 (Data Schema)

#### BondLocation (위치 정보)
```typescript
interface BondLocation {
    bondId: string;
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
}
```

#### ImpactMetrics (임팩트 지표)
```typescript
interface ImpactMetric {
    bondId: string;
    category: 'Environment' | 'Social' | 'Governance';
    label: string;      // e.g., "CO2 Reduced"
    value: number;
    unit: string;       // e.g., "tons", "jobs"
    description?: string;
}
```

## 4. 구현 상세 (Implementation Details)

### 4.1 Google Maps 설정
1.  **API Key 발급**: Google Cloud Platform(GCP)에서 Maps JavaScript API 활성화 및 키 발급. (환경변수 `VITE_GOOGLE_MAPS_API_KEY`로 관리)
2.  **컴포넌트 구조**:
    ```tsx
    // components/impact/impact-map.tsx
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map center={...} zoom={...}>
            {bonds.map(bond => (
                <AdvancedMarker position={...} onClick={...} />
            ))}
        </Map>
    </APIProvider>
    ```

### 4.2 화면 구성 계획
*   **진입점**: `/portfolio` (상단 탭 또는 별도 섹션) 또는 `/bonds` (탐색형 지도).
*   **UI 레이아웃**:
    *   좌측/배경: 지도 (Map View)
    *   Overlay: 선택된 지역의 ESG 스코어카드 및 프로젝트 리스트 카드.

## 5. 단계별 구현 계획 (Phased Plan)

### Phase 1: 기본 지도 연동 (Basic Map)
*   [ ] `@vis.gl/react-google-maps` 설치.
*   [ ] Google Maps API 키 발급 및 `.env` 설정.
*   [ ] `ImpactMap` 컴포넌트 생성 및 더미 좌표 데이터(Mock Data) 렌더링.

### Phase 2: 정보 연결 (Interaction)
*   [ ] 마커 클릭 시 해당 채권의 상세 모달(Invest Modal) 연동.
*   [ ] `bonds.tsx`의 리스트와 지도 마커 상호 연동 (리스트 호버 시 지도 강조 등).

### Phase 3: ESG 데이터 시각화 (Advanced)
*   [ ] `ImpactMetrics` 데이터 구조 정의 및 차트 컴포넌트 구현.
*   [ ] 포트폴리오 페이지에 '나의 임팩트(My Impact)' 섹션 추가 (내가 투자한 프로젝트들의 ESG 합계).

## 6. 필요 리소스
*   Google Maps API Key (Google Cloud Platform Billing 등록 필요).
*   Mock Data: 태국(방콕, 라용), 나이지리아 등 주요 RWA 타겟 지역의 실제 위경도 좌표.
