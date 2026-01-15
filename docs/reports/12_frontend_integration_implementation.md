# 12. Frontend Integration & Client Setup

## 1. 개요 (Overview)
본 문서는 구축된 BuildCTC 프론트엔드와 Creditcoin Testnet에 배포된 스마트 컨트랙트를 연동하기 위한 구현 계획을 정의합니다. `wagmi`와 `viem` 라이브러리를 도입하여 지갑 연결, 상태 관리, 그리고 컨트랙트 상호작용을 구현합니다.

## 2. 목표 (Goals)
1.  **Web3 기반 환경 구성**: React Router v7 애플리케이션에 `WagmiProvider` 및 `QueryClientProvider` 설정.
2.  **지갑 연결 라이프사이클 관리**: MetaMask 등의 지갑 연결, 계정 변경, 연결 해제 기능 구현.
3.  **스마트 컨트랙트 데이터 바인딩**: 배포된 컨트랙트(`MockUSDC`, `BondToken`, `LiquidityPool`, `YieldDistributor`)의 상태를 프론트엔드 UI에 실시간 반영.
4.  **트랜잭션 실행 UX**: 투자(Bond 구매), 보상 수령(Claim) 등의 트랜잭션 실행 시 서명 요청 및 상태 피드백(Loading, Success, Error) 제공.

## 3. 기술 스택 및 도구 (Tech Stack)
*   **Core Logic**: `wagmi` (React Hooks for Ethereum), `viem` (Low-level Interface)
*   **State Management**: `@tanstack/react-query` (비동기 데이터 관리)
*   **UI Components**: `shadcn/ui` (기존 컴포넌트 활용)
*   **Network**: Creditcoin Testnet (Chain ID: `102031`)

## 4. 상세 구현 계획 (Detailed Implementation Plan)

### 4.1 패키지 설치 및 환경 설정
*   **설치**: `npm install wagmi viem @tanstack/react-query`
*   **설정 파일**: `frontend/app/config/wagmi.ts` 생성
    *   Creditcoin Testnet 체인 정보 정의
    *   Client 설정을 위한 Transport(RPC) 구성

### 4.2 프로바이더(Provider) 래핑
*   **`root.tsx` 수정**:
    *   애플리케이션 최상단을 `WagmiProvider`와 `QueryClientProvider`로 감싸서, 하위 컴포넌트에서 Web3 훅을 사용할 수 있도록 구성.

### 4.3 지갑 연결 컴포넌트 (Wallet Connection)
*   **`wallet-section.tsx` 업데이트**:
    *   Task 08에서 구현된 UI에 실제 기능을 연동.
    *   `useConnect`, `useAccount`, `useDisconnect` 훅 사용.
    *   연결 상태(Connected/Disconnected)에 따른 UI 조건부 렌더링.
    *   지갑 주소 축약 표시 (e.g., `0x1234...abcd`) 및 잔액 표시.

### 4.4 주요 기능 연동 시나리오

#### A. 사용자 자산 표시 (User Assets)
*   `useReadContract`를 사용하여 `MockUSDC` 및 `BondToken` 잔액 조회.
*   `Portfolio` 페이지에 사용자의 보유 채권 목록 및 예상 수익 표시.

#### B. 채권 투자 (Invest)
*   `bonds/index.tsx` 및 `InvestmentModal` 연동.
*   **Flow**:
    1.  `MockUSDC.approve(LiquidityPool)` 실행 (Approve)
    2.  `LiquidityPool.purchaseBond(bondId, amount)` 실행 (Invest)
*   `useWriteContract` 및 `useWaitForTransactionReceipt`를 사용하여 트랜잭션 상태 추적 및 토스트 알림 제공.

#### C. 수익 수령 (Claim Yield)
*   `YieldDistributor.claimYield()` 함수 호출 구현.
*   수령 가능한 수익금(`earned`) 실시간 조회.

## 5. 예상 결과물 (Deliverables)
*   **`wagmi.ts`**: Web3 클라이언트 설정 파일.
*   **`root.tsx`**: Provider가 적용된 애플리케이션 진입점.
*   **기능하는 지갑 연결 버튼**: 실제 메타마스크와 연동되어 주소를 표시하는 UI.
*   **컨트랙트 읽기/쓰기 예제**: 간단한 잔액 조회 또는 상태 변경 테스트 코드.

## 6. 다음 단계 (Next Steps)
*   패키지 설치 및 Config 파일 작성.
*   Root Provider 설정.
*   Wallet Connection 기능 구현 및 테스트.

## 7. UI/UX 검증 체크리스트 (Verification Checklist)

### 7.1 지갑 연결 (Wallet Connection)
- [ ] **Connect Flow**: 'Connect Wallet' 버튼 클릭 시 메타마스크 팝업이 정상적으로 뜨는가?
- [ ] **Address Display**: 연결 후 버튼 텍스트가 지갑 주소(`0x12..34abcd`)로 축약되어 표시되는가?
- [ ] **Persistence**: 브라우저 새로고침 후에도 연결 상태가 유지되는가? (Auto-connect)
- [ ] **Disconnect**: 연결 해제 시 상태가 초기화되고 버튼이 복구되는가?
- [ ] **Network Switch**: Creditcoin Testnet이 아닌 경우 네트워크 전환 팝업이 트리거되는가?

### 7.2 데이터 바인딩 (Data Binding)
- [ ] **Balance Sync**: 대시보드/지갑 메뉴의 MockUSDC 잔액이 메타마스크 잔액과 일치하는가?
- [ ] **Token List**: 포트폴리오 페이지에서 보유한 BondToken 리스트가 정상적으로 표시되는가?
- [ ] **Reward Display**: 수령(Claim) 가능한 예상 수익금이 0이 아닌 값으로 표시되는가? (조건 충족 시)

### 7.3 트랜잭션 경험 (Transaction UX)
- [ ] **Investment**: 'Invest' 실행 시 Approve -> Purchase의 2단계 서명이 정상적으로 요청되는가?
- [ ] **Feedback**: 트랜잭션 대기 중 'Pending', 'Loading' 등의 시각적 피드백(스피너, 토스트)이 제공되는가?
- [ ] **Notification**: 트랜잭션 성공/실패 시 적절한 Toast 알림 메시지가 출력되는가?
- [ ] **Optimistic UI**: 성공 직후 UI 데이터(잔액 등)가 즉시 갱신되는가?
