# 09_Liquidity Pool Contract Implementation

## 1. 작업 개요 (Task Overview)
본 작업은 투자자들이 USDC를 예치하고, 이를 통해 토큰화된 채권(`BondToken`)을 구매할 수 있는 핵심 DeFi 로직인 `LiquidityPool` 컨트랙트를 구현하는 단계입니다. 이 컨트랙트는 자금의 흐름(투자자 -> 풀 -> 대출자)을 제어하는 관문 역할을 합니다.

- **작업 번호**: 09
- **작업명**: Liquidity Pool Contract Implementation
- **일자**: 2026-01-15
- **상태**: 완료 (Completed)

## 2. 주요 목표 (Key Objectives)
- [x] **Mock USDC**: 로컬 테스트를 위한 가상 USDC(ERC-20) 컨트랙트 구현.
- [x] **LiquidityPool Contract**:
    - **Deposit & Purchase**: 투자자가 USDC를 예치하고 즉시 BondToken을 수령하는 `purchaseBond` 함수 구현.
    - **Withdraw**: 관리자가 모인 자금을 인출하는 `withdrawFunds` 구현 (AccessControl 적용).
- [x] **Interaction**: `BondToken`의 `MINTER_ROLE`을 `LiquidityPool`에 부여하여 자동 발행 시스템 구축.
- [x] **Unit Testing**: 예치, 채권 구매, 인출 시나리오에 대한 테스트 작성 및 통과 (12/12 Passing).

## 3. 상세 단계 (Implementation Steps)

### Step 1: `MockUSDC.sol` 작성
- OpenZeppelin의 `ERC20`를 상속받아 테스트용 `mint` 기능을 가진 단순한 ERC-20 토큰을 만듭니다.

### Step 2: `LiquidityPool.sol` 구현
- 상태 변수: `usdcToken` 주소, `bondToken` 주소.
- 함수 `deposit(uint256 amount)`: `transferFrom`을 통해 유저의 USDC를 컨트랙트로 이동.
- 함수 `purchaseBond(uint256 bondId, uint256 amount)`: 특정 채권에 투자. (BondToken의 `mint` 권한 필요)
- 이벤트 정의: `Deposited`, `BondPurchased`.

### Step 3: `BondToken` 권한 설정
- `BondToken`의 `MINTER_ROLE` 같은 개념을 적용하거나, `LiquidityPool` 컨트랙트 주소를 `BondToken`의 `owner` 또는 승인된 발행자로 설정해야 합니다. (Task 07의 `BondToken.sol` 수정이 필요할 수 있음)

### Step 4: 테스트 코드 작성 (`test/LiquidityPool.ts`)
- MockUSDC 배포 및 유저에게 분배.
- LiquidityPool 배포 및 BondToken 연결.
- 유저가 USDC 승인(Approve) 후 예치(Deposit).
- 풀이 채권 구매(Purchase Bond) 시도 및 성공 확인.

## 4. 체크리스트 (Checklist)
- [ ] USDC 전송 시 `approve` 선행 조건이 테스트에서 고려되었는가?
- [ ] 유동성 풀이 `BondToken`을 발행할 권한을 올바르게 획득했는가?
- [ ] 재진입(Reentrancy) 공격에 대한 방어 로직이 필요한가? (현재 단계에선 기본 로직 위주)

## 5. 결과 및 비고 (Results & Notes)
- (작업 완료 후 기록 예정)
