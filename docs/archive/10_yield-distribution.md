# 10_Yield Distribution Implementation

## 1. 작업 개요 (Task Overview)
본 작업은 RWA(실물 자산) 운용을 통해 발생한 수익을 스마트 컨트랙트를 통해 투자자들에게 투명하고 자동으로 분배하는 **수익 배분(Yield Distribution)** 시스템을 구현하는 단계입니다. 오프체인의 수익 데이터를 온체인에 반영하고, 투자자가 이를 청구(Claim)할 수 있는 구조를 만듭니다.

- **작업 번호**: 10
- **작업명**: Yield Distribution Implementation
- **일자**: 2026-01-15
- **상태**: 완료 (Completed)

## 2. 주요 목표 (Key Objectives)
- [x] **YieldDistributor Contract**:
    - **Yield Deposit**: 관리자가 수익금(USDC)을 입금하는 `depositYield` 함수 구현 (RewardPerToken 활용).
    - **Share Calculation**: `rewardPerToken` 및 `earned` 로직을 통해 지분 기반 수익 배분 공식 적용.
    - **Claim**: `claimYield` 함수로 누적 보상을 청구하는 기능 구현.
- [x] **Data Structure**: `rewardPerTokenStored`, `userRewardPerTokenPaid`, `rewards` 매핑을 이용한 누적 보상 시스템 구축.
- [x] **Integration**: MockUSDC, BondToken과 연동하여 통합 테스트 완료.
- [x] **Unit Testing**: 단일/다중 스테이커, 중간 진입(Dynamic Staking) 시나리오 테스트 통과 (6/6 Passing).

## 3. 상세 단계 (Implementation Steps)

### Step 1: `YieldDistributor.sol` 기본 구조
- `AccessControl`을 사용하여 `DISTRIBUTOR_ROLE` 정의.
- `usdcToken`, `bondToken` 참조.
- **RewardPerToken** 알고리즘 적용:
  - `rewardPerTokenStored`: 토큰 1개당 누적된 보상 총액.
  - `userRewardPerTokenPaid`: 유저가 마지막으로 정산받은 시점의 `rewardPerTokenStored`.
  - `rewards`: 유저가 수령 가능한 보상 잔액.

### Step 2: 수익 입금 함수 (`depositYield`)
- 관리자가 USDC를 입금하면 `rewardPerTokenStored`를 업데이트합니다.
- `rewardPerTokenStored += (depositAmount * 1e18) / totalSupply`.
- 단, ERC1155는 `totalSupply`가 ID별로 다르므로, 단일 풀(Pool) 모델로 가정하거나 특정 Bond ID에 대한 배분으로 한정해야 합니다.
  - **결정**: 이번 단계에서는 **특정 Bond ID(예: ID 1)에 대한 수익 배분**으로 단순화하여 구현합니다. 복수 채권 지원은 추후 확장.

### Step 3: 청구 함수 (`claimYield`)
- 유저가 호출하면 `updateReward(msg.sender)` 수식어를 통해 정산 후, USDC를 `transfer` 합니다.

### Step 4: 테스트 작성 (`test/YieldDistributor.ts`)
- 시나리오 1: 채권 보유자 A(100개), B(100개)가 있을 때, 200 USDC 수익 입금 시 각각 100 USDC씩 배분되는가?
- 시나리오 2: 중간에 진입한 투자자에 대한 계산이 올바른가? (이 부분은 RewardPerToken 로직의 핵심 검증 대상)

## 4. 체크리스트 (Checklist)
- [ ] BondToken의 `totalSupply`가 0일 때 입금 시 예외 처리(Division by Zero)가 되어 있는가?
- [ ] 정밀도 손실(Precision Loss)을 최소화하기 위해 스케일링 팩터(`1e18`)를 사용했는가?
- [ ] Pull Pattern(유저가 직접 Claim)을 사용하여 가스비 문제를 해결했는가?

## 5. 결과 및 비고 (Results & Notes)
- (작업 완료 후 기록 예정)
