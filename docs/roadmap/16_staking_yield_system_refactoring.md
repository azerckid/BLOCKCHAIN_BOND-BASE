# 상세 실행 계획: 통합 멀티 본드 스테이킹 및 수익 배분 시스템 개편

## 1. 개요 (Overview)
본 문서는 현재 단일 채권(ID 1)만 지원하는 이자 배분 시스템을 개편하여, **최대 100개 이상의 다양한 채권을 하나의 시스템에서 통합 관리**할 수 있도록 스마트 컨트랙트와 프론트엔드 아키텍처를 정석적으로 재설계하는 계획을 담고 있습니다.

## 2. 스마트 컨트랙트 재설계 (Integrated Multi-Bond Distributor)
기존의 `YieldDistributor.sol`은 생성 시점에 하나의 `targetBondId`만 고정되었으나, 이를 확장하여 본드 ID별로 독립적인 장부를 관리하는 구조로 개편합니다.

### 2.1 데이터 구조 변경 (State Variables)
- **전역 관리**: `BondToken`과 `USDC` 주소는 고정.
- **ID별 장부 (Mapping of Mappings)**:
  - `mapping(uint256 => uint256) public totalStakedById`: 본드 ID별 총 예치량.
  - `mapping(uint256 => mapping(address => uint256)) public stakingBalancesById`: 본드 ID별/사용자별 예치 잔액.
  - `mapping(uint256 => uint256) public rewardPerTokenStoredById`: 본드 ID별 누적 보상 인덱스.
  - `mapping(uint256 => mapping(address => uint256)) public userRewardPerTokenPaidById`: 본드 ID별/사용자별 기지급 인덱스.
  - `mapping(uint256 => mapping(address => uint256)) public rewardsById`: 본드 ID별/사용자별 미지급 수익금.

### 2.2 핵심 함수 리팩토링 (Core Functions)
- **`earned(address user, uint256 bondId)` (핵심 변경)**: 
  - **원칙**: 채권 보유(Holding) 즉시 이자 발생.
  - **구현**: `BondToken.balanceOf(user, bondId)`를 직접 참조하여 실시간 미지급 수익금 계산.
  - **효과**: 사용자가 별도의 버튼을 누르지 않아도, 채권을 지갑에 들고만 있다면 관리자의 수익 배분 시점에 즉시 이자 숫자가 올라가 가시성 확보.
- **`reinvest(uint256 bondId, uint256 amount)` (기존 Stake 대체)**:
  - **개념**: 지급받은 이자를 현금화하지 않고, 다시 해당 채권을 추가 매수하거나 복리 운용에 투입. (이자 재투자)
  - **효과**: "정산 확정은 클레임, 이익 극대화는 스테이킹(재투자)"이라는 금융 정석 구현.
- `depositYield(uint256 bondId, uint256 amount)`: 관리자가 특정 채권의 **전체 발행량(Total Supply)**을 기준으로 수익금 배분. 지갑에 채권을 든 모든 홀더에게 비례하여 이자 인덱스 적용.
- `claimYield(uint256 bondId)`: 채권 보유량에 따라 누적된 미지급 수익금을 USDC로 수령 (수익의 최종 확정).

## 3. 이자 가시성 및 정산 로직 개선 (Yield Visibility)
사용자가 판단을 내릴 수 있도록 **"보유 중인 모든 자산에 대한 확정된 이자"**를 실시간으로 보여줍니다.

- **실시간 이자 디스플레이 (Real-time Yield Counter)**:
  - 사용자가 포트폴리오에 진입하면 `earned` 함수가 즉시 호출되어, 재투자 여부와 관계없이 **"내 지갑의 채권으로 인해 발생한 이자($)"**가 숫자로 표시됨.
  - 이를 통해 사용자는 "내 채권에서 이만큼의 돈이 나왔구나"를 확인하고, 이를 [현금화(Claim)]할지 [재투자(Reinvest)]할지 명확히 결정함.
- **상태 정의 및 안내**:
  - `HODLING (ACTIVE)`: 채권 보유 중, 자동으로 이자 적립 중. (숫자 표시)
  - `REINVESTING`: 이자가 원금에 합산되어 복리로 운용 중인 상태.

## 4. 사용자 흐름 자동화 및 정형화 (UX Transaction Sequencing)
- **Sequence**: `Approve` 수동 확인 -> 블록체인 컨펌 감지 -> 즉시 `Stake` 트랜잭션 자동 요청.
- **UI 피드백**: 두 단계가 모두 완료되어 '이자 발생 중' 상태로 바뀌기 전까지 페이지 이탈 방지 경고 및 통합 진행률 표시.

## 5. 어드민 페이지 완전 초기화 (Formal Admin Reset)
- **State Clean-up**: `amount`, `txHash`, `step` 상태를 한꺼번에 리셋하는 `handleReset` 함수 구현.
- **New Distribution**: 배분 성공 후 '초기화' 버튼을 눌러야만 다음 배분이 가능하게 하여 중복 실수 방지.

## 6. 핵심 기술적 고려사항 (Critical Technical Considerations)
1. **기존 데이터 마이그레이션**: 현재 ID 1번에 스테이킹된 자산이 있을 경우, 새 통합 컨트랙트로 이동시키기 위한 '마이그레이션 전용 함수' 혹은 사용자의 수동 Unstake 가이드 필요.
2. **소수점 정밀도 유지**: 수익 배분액이 아주 작을 경우(예: 수백 원 단위) 인덱스 계산 시 손실 발생 위험. `1e18` 이상의 `PRECISION_FACTOR`를 사용하여 계산 무결성 보장.
3. **가스비 최적화**: 100개 이상의 매핑 구조에서 대규모 배분 발생 시 가스 소모량 예측 및 최적화(SSTORE2 등 고려).
4. **보안(Reentrancy Guard)**: 모든 입출금 및 보상 수령 함수에 `nonReentrant` 수식어 적용 및 Checks-Effects-Interactions 패턴 준수.
5. **예외 처리(Circuit Breaker)**: 특정 채권의 `totalStakedById`가 0일 때 수익금이 입금되면 해당 자금이 묶이지 않도록 입금 거부 또는 관리자 환급 로직 포함.
6. **트랜잭션 거절 대응**: 사용자가 1차 승인 후 2차 스테이킹 실행을 거절했을 때, UI가 '승인 완료' 상태를 유지하되 다시 시도할 수 있는 복구 경로 제공.
7. **멀티 본드 어드민 제어**: `AccessControl`을 통해 각 채권별로 수익 배분 권한을 다르게 설정할 수 있는 유연한 권한 구조 설계.

## 7. 진행 순서
1. **[컨트랙트 v2]**: 통합 관리 기능 개발 및 테스트넷 재배포.
2. **[설정]**: `contracts.ts` 업데이트 및 기존 ID와의 매핑 확인.
3. **[어드민]**: 초기화 버그 수정 및 배분 채권 ID 선택 기능 추가.
4. **[포트폴리오]**: 전 본드 대상 이자 조회 루틴 및 자동 흐름 적용.
