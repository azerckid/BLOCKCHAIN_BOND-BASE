# 05_Bond Market & Investment Interaction

## 1. 작업 개요 (Task Overview)
본 작업은 대시보드 UI를 기반으로 실제 채권 시장의 탐색 기능과 투자 프로세스를 구현하는 단계입니다. 투자자가 채권을 필터링하여 찾고, 상세 정보를 확인하며, 실제로 투자(Transaction 시뮬레이션)를 실행하는 전체 플로우를 구축합니다.

- **작업 번호**: 05
- **작업명**: Bond Market & Investment Interaction
- **일자**: 2026-01-15
- **상태**: 완료 (Completed)

## 2. 주요 목표 (Key Objectives)
- [x] **Market Explorer**: 채권 목록을 검색, 필터링(카테고리, 수익률, 지역 등)할 수 있는 고도화된 마켓 페이지 구현.
- [x] **Investment Workflow**: 'Invest Now' 클릭 시 투자 금액을 입력하고 확정하는 **Investment Drawer/Modal** 구현.
- [x] **Interaction Feedback**: 투자 실행 시 로딩 애니메이션 및 성공/실패 토스트 알림 연동 (Sonner).
- [x] **Real-time Revalidation**: 투자 완료 후 대시보드의 자본 현황 및 채권 잔액이 즉시 업데이트되는 데이터 흐름 구축.
- [x] **Mock Transaction Engine**: 백엔드 Action을 통해 가상의 투자 데이터를 DB에 기록하고 처리하는 로직 준비.

## 3. 상세 단계 (Implementation Steps)

### Step 1: 채권 마켓 페이지 고도화 (`app/routes/bonds.tsx`)
- 기존 "Coming Soon" 페이지를 실제 채권 리스트와 필터 바로 교체.
- 카테고리별 탭(All, Real Estate, Agriculture, Energy 등) 및 정렬 기능 추가.

### Step 2: 투자 프로세스 UI 구현
- `app/components/bonds/investment-drawer.tsx` 생성.
- 투자 금액 입력 필드, 예상 연간 수익 계산기, 지갑 잔액 확인 섹션 포함.
- 투자 실행을 위한 검증 로직 (최소 투자 금액, 잔액 부족 등) 추가.

### Step 3: 데이터 mutation 및 피드백 처리
- `react-router`의 `Action` 기능을 사용하여 투자 요청 처리.
- `sonner` 라이브러리를 사용한 사용자 피드백(성공/에러) 메시지 표시.
- 투자 성공 시 홈 대시보드로 이동하거나 데이터를 새로고침하는 UX 구현.

### Step 4: 가상 상환 데이터 시뮬레이션 (Optional)
- 테스트를 위해 유동성 풀 및 포트폴리오의 실시간 변화를 확인할 수 있는 가상 상환 트리거 준비.

## 4. 체크리스트 (Checklist)
- [ ] 채권 필터링이 디자인 시스템 가이드를 준수하며 매끄럽게 동작하는가?
- [ ] 투자 금액 입력 시 예상 수익이 실시간으로 계산되어 표시되는가?
- [ ] 투자 실행 중인 상태(Submitting)가 시각적으로 명확히 표시되는가?
- [ ] 모바일 환경에서도 투자 드로어가 사용하기 편리한가?
- [ ] `MANDATORY BACKUP PROCEDURE`를 준수하였는가? (DB 기록 시)

## 5. 결과 및 비고 (Results & Notes)
- (작업 완료 후 기록 예정)
