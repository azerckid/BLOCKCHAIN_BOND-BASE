# Admin Portal Specification: Yield Distribution Management

## 1. 개요 (Overview)
본 문서는 BondBase 프로젝트의 안전하고 효율적인 운영을 위한 **관리자 전용 포털(Admin Portal)**의 설계 사양을 정의합니다. 기존의 블록 익스플로러를 통한 수동 운영 방식에서 탈피하여, 웹 인터페이스 내에서 직관적이고 오류 없는 자산 운영 환경을 구축하는 것을 목적으로 합니다.

---

## 2. 필요성 및 목표 (Goal)
- **보안성**: 브라우저 보안 경고(SSL 등) 없이 신뢰할 수 있는 환경에서 트랜잭션 실행.
- **편의성**: 복잡한 소수점 단위 변환 및 중복 트랜잭션(`Approve` → `Deposit`)을 시스템이 자동 관리.
- **정확성**: 실시간 잔액 및 한도(Allowance) 조회를 통해 입금 실패 및 가스비 낭비 방지.

---

## 3. 핵심 기능 요구사항 (Core Requirements)

### 3.1 지갑 연결 및 권한 검증
- **Wallet Connection**: WalletConnect, MetaMask 연동 지원.
- **Access Control**: 연결된 지갑 주소가 컨트랙트 내 `DISTRIBUTOR_ROLE` 권한을 보유했는지 즉시 검증. 권한이 없을 경우 모든 입력창 비활성화 및 경고 표시.

### 3.2 스마트 수익 배분 모듈 (Smart Yield Distribution)
- **Step-by-Step Flow**:
    1. **수량 입력**: 관리자가 달러 단위(USDC)로만 입력 (예: 1000).
    2. **자동 분석**: 시스템이 `Allowance`를 조회하여 `Approve`가 필요한지 자동으로 판단.
    3. **단일 UI 액션**: 관리자는 하나의 버튼을 누르되, 시스템 내부적으로 `Approve` → `Deposit` 순서로 트랜잭션 가이드 제공.
- **Unit Conversion**: 프론트엔드에서 `parseUnits(amount, 18)`를 자동 수행하여 휴먼 에러 차단.

### 3.3 대시보드 모니터링
- **관리자 잔액**: 현재 관리자 지갑에 보유 중인 `MockUSDC` 수량 상시 노출.
- **글로벌 보상 상태**: `rewardPerTokenStored`를 조회하여 현재까지 배분된 총 이자 현황 시각화.
- **채권 현황**: 현재 수익 배분 대상이 되는 채권(Target Bond ID)과 해당 채권의 총 발행량(`totalSupply`) 표시.

---

## 4. UI/UX 설계 가이드라인

### 4.1 트랜잭션 진행 표시 (Transaction Stepper)
- 여러 개의 트랜잭션이 발생하므로 시각적 프로그레스 바(Progress Bar) 필수.
- 각 트랜잭션의 컨펌(Confirm) 여부를 사용자에게 즉각 피드백.

### 4.2 안전 장치 (Safety Guards)
- **잔액 초과 방지**: 지갑 잔액보다 큰 금액 입력 시 "Balance Insufficient" 메시지와 함께 버튼 비활성화.
- **이중 클릭 방지**: 트랜잭션 처리 중 버튼 중복 클릭 원천 차단.
- **경고 배너**: 실행 전 "본 작업은 실물 자산 수익을 확정 짓는 트랜잭션이며 취소가 불가능함"을 명시.

---

## 5. 기술 스택 및 연동 사양
- **Frontend**: Next.js (App Router), Tailwind CSS, shadcn/ui.
- **Library**: `wagmi`, `viem` (V2)를 통한 온체인 데이터 통신.
- **Smart Contracts**:
    - `MockUSDC`: `approve`, `balanceOf` 호출.
    - `YieldDistributor`: `depositYield`, `earned`, `rewardPerTokenStored` 호출.

---

## 6. 향후 확장 계획
- **다중 채권 관리**: 서로 다른 Bond ID에 대해 각각의 수익률을 개별 배분하는 기능.
- **운용 로그**: 배분 히스토리를 DB(Turso)에 기록하여 관리 대장 자동화.
- **자동화 알림**: 수익 배분 완료 시 투자자들에게 서비스 내 알림 전송 연동.
