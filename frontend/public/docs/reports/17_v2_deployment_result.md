# 17. Integrated V2 System Deployment Result

## 1. 개요
2026년 1월 16일 수행된 **통합 스테이킹 및 수익 배분 시스템 (V2)**의 Creditcoin Testnet 배포 결과를 기록합니다. 
본 배포는 '보유가 곧 이자(Hold to Earn)' 및 '복리 재투자(Auto-Compounding)' 모델을 구현한 `YieldDistributor(v2)`와 `BondToken(v2)`의 통합을 포함합니다.

## 2. 배포 정보
*   **Date**: 2026-01-16
*   **Network**: Creditcoin Testnet (Chain ID: `102031`)
*   **Script**: `contracts/scripts/redeploy_v2.ts`

## 3. 배포된 컨트랙트 (Deployed Contracts)

| 컨트랙트명 (New V2) | 주소 (Address) | 변경 사항 |
|:---:|:---:|---|
| **MockUSDC** | `0x97A41Ff77f70e9328A20b62b393F8Fb0E7e49364` | Clean Slate 배포 (초기화됨) |
| **BondToken (v2)** | `0x6aaEe229EB0f59dC0F4B579B4E5d35E05A6846Bb` | `onBalanceChange` 훅 추가 (YieldDistributor 연동) |
| **LiquidityPool** | `0x290adf245E805D24DF630A01843b3C3Fb20bd082` | V2 BondToken 및 USDC 주소 바인딩 |
| **YieldDistributor (v2)** | `0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308` | 멀티 채권 지원, 보유량 기반 정산, 자동 재투자(`reinvest`) 구현 |

## 4. 시스템 설정 및 권한 (Configuration & Roles)

### 4.1 상호 연결 (Linking)
*   **BondToken** → **YieldDistributor**: `setYieldDistributor()` 호출 완료. (토큰 이동 시 정산소에 자동 통지)
*   **YieldDistributor** → **BondToken**: `setBondToken()` 호출 완료.
*   **YieldDistributor** → **LiquidityPool**: `setLiquidityPool()` 호출 완료. (재투자 시 자금 이동 경로 확보)

### 4.2 권한 부여 (Role Grants)
1.  **LiquidityPool**:
    *   `MINTER_ROLE` on `BondToken` (User Purchase 시 토큰 발행 권한)
2.  **YieldDistributor**:
    *   `MINTER_ROLE` on `BondToken` (**Reinvest** 실행 시 보상을 원금으로 전환하여 추가 발행할 권한)

## 5. 주요 기능 검증 (Verification)
*   `YieldDistributorV2.test.ts` 통합 테스트 통과.
*   **Hold to Earn**: 채권 구매 즉시 별도 스테이킹 없이 이자 발생 확인.
*   **Reinvest**: 이자(USDC)가 시스템(LiquidityPool)으로 반환되고, 사용자에게는 등가(1:1 Peg)의 채권이 추가 발행됨을 확인.

## 6. 프론트엔드 업데이트
*   `frontend/app/config/contracts.ts`에 위 주소 반영 완료.
