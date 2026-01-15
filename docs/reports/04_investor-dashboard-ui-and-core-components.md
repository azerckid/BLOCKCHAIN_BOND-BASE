# 04_Investor Dashboard UI and Core Components

## 1. 작업 개요 (Task Overview)
본 작업은 투자자가 자신의 포트폴리오를 관리하고 채권 정보를 탐색할 수 있는 대시보드의 시각적 기반을 구축하는 단계입니다. `shadcn/ui` 라이브러리를 활용하여 일관된 디자인 시스템을 적용하고, 핵심적인 비즈니스 로직을 담을 UI 컴포넌트들을 구현합니다.

- **작업 번호**: 04
- **작업명**: Investor Dashboard UI and Core Components
- **일자**: 2026-01-15
- **상태**: 진행 중 (In Progress)

## 2. 주요 목표 (Key Objectives)
- [ ] **Core Layout**: 사이드바, 헤더, 메인 컨텐츠 영역이 포함된 대시보드 레이아웃 구축.
- [ ] **Bond Components**: 채권 정보를 표시하는 `BondCard` 및 리스트 컴포넌트 구현.
- [ ] **Portfolio UI**: 투자 현황(총 투자금액, 예상 수익 등)을 요약 표시하는 통계 대시보드 UI.
- [ ] **Design System**: 프리미엄 테마(Nova 스타일)에 맞춘 다크/라이트 모드 지원 및 색상 토큰 최적화.

## 3. 상세 단계 (Implementation Steps)

### Step 1: 대시보드 레이아웃 정의
- `app/components/layout/dashboard-layout.tsx` 생성.
- 반응형 네비게이션 및 사용자 프로필 메뉴 통합.

### Step 2: 핵심 컴포넌트 제작
- `app/components/bonds/bond-card.tsx`: 채권 상태, 수익률, 지역 정보를 담은 카드.
- `app/components/portfolio/stat-summary.tsx`: 주요 지표(KPI) 표시용 카드.

### Step 3: 대시보드 홈 페이지 구현 (`app/routes/home.tsx`)
- 가상 데이터를 활용하여 전체적인 레이아웃 및 컴포넌트 배치 확인.
- React Router v7의 `loader`를 통한 데이터 전달 구조 준비.

### Step 4: 스타일 및 애니메이션 폴리싱
- `tw-animate-css` 및 Framer Motion(필요 시) 등을 활용한 부드러운 전환 효과 추가.
- 프리미엄 감각을 위한 유리모피즘(Glassmorphism) 스타일 요소 적용.

## 4. 체크리스트 (Checklist)
- [ ] 디자인 시스템이 `ui-specification.md`에 정의된 토큰을 준수하는가?
- [ ] 모바일 및 데스크탑에서 레이아웃이 깨지지 않는가?
- [ ] 다크 모드에서의 가독성이 확보되었는가?
- [ ] 상호작용 요소(버튼, 호버 효과)가 매끄럽게 동작하는가?

## 5. 결과 및 비고 (Results & Notes)
- (작업 완료 후 기록 예정)
