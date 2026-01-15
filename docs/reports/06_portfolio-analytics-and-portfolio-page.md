# 06_Portfolio Analytics & Portfolio Page

## 1. 작업 개요 (Task Overview)
본 작업은 투자자가 자신의 자산 현황과 투자 성과를 정밀하게 분석할 수 있는 'Portfolio' 페이지를 구현하는 단계입니다. 단순히 목록을 보여주는 것을 넘어, 시각화된 차트를 통해 자산 배분 비중과 누적 수익 추이를 제공하여 투자 경험의 전문성을 높입니다.

- **작업 번호**: 06
- **작업명**: Portfolio Analytics & Portfolio Page
- **일자**: 2026-01-15
- **상태**: 완료 (Completed)

## 2. 주요 목표 (Key Objectives)
- [x] **Portfolio Overview**: 현재 총 자산 가치, 누적 수익금, 평균 연수익률(APR)을 요약하여 상단에 배치.
- [x] **Asset Allocation Chart**: 섹터별(부동산, 농업 등) 투자 비중을 보여주는 Donut/Pie 차트 구현.
- [x] **Yield Performance Graph**: 월별 수익 발생 추이를 보여주는 Line/Bar 차트 구현.
- [x] **Investment List**: 내가 투자한 개별 채권들의 상태(Active, Repaid)와 성과를 보여주는 상세 테이블/리스트 구현.
- [x] **Interactive Analytics**: 특정 기간 또는 섹터를 선택했을 때 데이터가 필터링되는 인터랙티브 기능 추가.

## 3. 상세 단계 (Implementation Steps)

### Step 1: 시각화 라이브러리 선정 및 설치 (`recharts`)
- 데이터 시각화를 위해 React 생태계에서 가장 안정적이고 유연한 `recharts` 라이브러리를 설치합니다.
- 프로젝트의 다크/라이트 테마와 조화로운 컬러 팔레트를 정의합니다.

### Step 2: 포트폴리오 페이지 레이아웃 설계 (`app/routes/portfolio.tsx`)
- 기존의 "Coming Soon" 페이지를 분석 대시보드 형태로 리팩토링합니다.
- 반응형 그리드 레이아웃(Charts + Stats + Lists)을 사용하여 정보를 계층화합니다.

### Step 3: 분석 컴포넌트 개발
- `app/components/portfolio/allocation-chart.tsx`: 섹터별 배분 시각화.
- `app/components/portfolio/performance-chart.tsx`: 수익률 추이 시각화.
- `app/components/portfolio/investment-table.tsx`: 상세 투자 내역 관리.

### Step 4: 데이터 연동 및 Revalidation
- 투자가 발생했을 때(Task 05 결과) 포트폴리오 데이터에 즉시 반영되도록 Mock 데이터 또는 서버 State와 연동합니다.

## 4. 체크리스트 (Checklist)
- [ ] 차트가 모바일 환경에서도 가독성 있게 표시되는가?
- [ ] 로딩 상태(Skeleton UI)가 자연스럽게 구현되었는가?
- [ ] 투자한 채권이 없을 때의 Empty State가 친절하게 안내되는가?
- [ ] 모든 수치 데이터(USDC, APR)가 정확한 포맷으로 렌더링되는가?

## 5. 결과 및 비고 (Results & Notes)
- (작업 완료 후 기록 예정)
