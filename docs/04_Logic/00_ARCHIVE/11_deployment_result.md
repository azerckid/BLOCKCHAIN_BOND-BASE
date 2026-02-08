# 11. Smart Contract Deployment Result

## 1. 개요
2026년 1월 15일 수행된 Creditcoin Testnet 스마트 컨트랙트 배포 결과를 기록합니다. 모든 컨트랙트는 `contracts/scripts/deploy_all.ts` 스크립트를 통해 순차적으로 배포되었으며, 초기 권한 설정이 완료되었습니다.

## 2. 네트워크 정보 (Network Details)
*   **Network Name**: Creditcoin Testnet
*   **Chain ID**: `102031`
*   **RPC URL**: `https://rpc.cc3-testnet.creditcoin.network`
*   **Explorer**: `https://creditcoin-testnet.blockscout.com`
*   **Native Currency**:
    *   **Symbol**: CTC
    *   **Decimals**: 18

## 3. 배포된 컨트랙트 (Deployed Contracts)

| 컨트랙트명 | 주소 (Address) | 비고 |
|:---:|:---:|---|
| **MockUSDC** | `0x2f60d3a6ef498321592AcE03705DA6aC456E8174` | 테스트용 가짜 USDC (ERC-20). `mint()` 함수 Public Open 여부 확인 필요. |
| **BondToken** | `0x4dFeb91918aEE9C0257d42fEDf52EA0DF3C42A1F` | 채권 토큰 (ERC-1155). `mint()`는 LiquidityPool만 호출 가능. |
| **LiquidityPool** | `0x3d4dfEdbc87f403538AA69B73C94cEf5793B2932` | 유동성 풀. `purchaseBond` 시 USDC 지불 -> BondToken 수령. |
| **YieldDistributor** | `0x039beE3DEa519345305Cb0E697B964F7005431d6` | 수익 배분기. BondToken 보유 증명 시 USDC 보상 수령. |

## 4. 초기 권한 설정 (Role Configuration)
배포 스크립트 실행 중 자동으로 다음 권한이 부여되었습니다.

1.  **Grant IGNITION (Minter) Role**:
    *   **Target**: `BondToken` (0x4dF...)
    *   **Grantee**: `LiquidityPool` (0x3d4...)
    *   **Role**: `MINTER_ROLE` (`keccak256("MINTER_ROLE")`)
    *   **Purpose**: 사용자가 Liquidity Pool에 USDC를 예치(purchaseBond)하면, Pool 컨트랙트가 그 즉시 투자자에게 Bond Token을 발행해주기 위함.

## 5. 프론트엔드 연동 정보
위 주소 및 ABI 정보는 다음 파일에 갱신되었습니다.
*   **File**: `frontend/app/config/contracts.ts`
*   **Usage**:
    ```typescript
    import { CONTRACTS } from "@/config/contracts";
    // ex: CONTRACTS.BondToken.address
    ```

## 6. 테스트 가이드 (How to Test)

### 6.1 가스비 확보 (Get tCTC)
트랜잭션을 실행하려면 가스비로 쓰일 **Testnet CTC**가 필요합니다.
1.  **Discord Faucet**: Creditcoin 공식 디스코드의 `#testnet-faucet` 채널 방문.
2.  **Command**: `/faucet <my_wallet_address>` 입력.

### 6.2 테스트용 USDC 확보 (Get MockUSDC)
투자를 하려면 자금(MockUSDC)이 필요합니다.
1.  **방법 A (Direct Mint)**: 만약 `MockUSDC` 컨트랙트의 `mint` 함수가 Public이라면, Etherscan(Blockscout)의 "Write Contract" 탭에서 내 주소로 직접 `mint` 실행.
2.  **방법 B (Frontend Faucet)**: 프론트엔드 개발 시 'Get Test USDC' 버튼을 임시로 만들어 `mint` 트랜잭션을 호출하도록 구현 권장.
