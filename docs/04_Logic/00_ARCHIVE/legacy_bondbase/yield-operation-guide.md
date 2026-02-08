# 수익 배분 및 입금 운영 가이드

본 문서는 관리자가 실물 자산(RWA) 수익을 블록체인에 반영할 때, **이 문서 하나만으로 모든 과정을 끝낼 수 있도록** 설계되었습니다. 다른 기술 문서를 찾아볼 필요 없이 아래 단계만 따라오세요.

---

## 1. 운영 전 필수 정보 (Network Info)

트랜잭션을 실행하기 위해 지갑(MetaMask 등)이 아래 네트워크로 설정되어 있어야 합니다.

*   **네트워크 이름**: Creditcoin Testnet
*   **RPC URL**: `https://rpc.testnet.creditcoin.network`
*   **체인 ID**: `102031`
*   **통화 기호**: `CTC`
*   **블록 익스플로러**: [https://creditcoin-testnet.blockscout.com/](https://creditcoin-testnet.blockscout.com/)

---

## 2. 주요 대상 주소 (Target Addresses)

이 주소들을 복사하여 사용하세요.

| 항목 | 주소 (복사해서 사용) | 역할 |
| :--- | :--- | :--- |
| **수익금 토큰 (MockUSDC)** | `0x97A41Ff77f70e9328A20b62b393F8Fb0E7e49364` | 관리자가 보유한 수익금 화폐 |
| **입금처 (YieldDistributor)** | `0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308` | **수익금을 보낼 금고 주소** |

---

## 3. 실전 입금 가이드 (Step-by-Step)

### [준비 단계] 지갑 연결하기
1. 위 **블록 익스플로러** 링크를 클릭하여 접속합니다.
2. 각 단계의 컨트랙트 주소를 검색창에 입력합니다.
3. **'Contract'** 탭 -> **'Write Contract'** 탭을 클릭합니다.
4. **'Connect to Web3'** 버튼을 눌러 관리자 지갑(MetaMask)을 연결합니다.

---

### [1단계] 수익금 금고 사용 승인 (Approve)
금고가 관리자 지갑에서 돈을 가져갈 수 있게 허락하는 단계입니다.

1. **대상**: [MockUSDC 컨트랙트 바로가기](https://creditcoin-testnet.blockscout.com/address/0x97A41Ff77f70e9328A20b62b393F8Fb0E7e49364?tab=write_contract)
2. **함수**: `approve` 선택
3. **입력란**:
    *   `spender (address)`: `0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308` (금고 주소)
    *   `value (uint256)`: 배분할 총액 (주의: 뒤에 **0을 18개** 붙여야 합니다.)
        *   *예시: 1,000 USDC 배분 시 -> `1000000000000000000000` 입력*
4. **실행**: 'Write' 버튼 클릭 후 지갑에서 승인

---

### [2단계] 수익금 실제 배분 (Deposit)
금고에 돈을 넣고 투자자들에게 배분 명령을 내리는 단계입니다.

1. **대상**: [YieldDistributor 컨트랙트 바로가기](https://creditcoin-testnet.blockscout.com/address/0xEbBa8Cec7Dee65bE9263e6378b33EC6D6Dba1308?tab=write_contract)
2. **함수**: `depositYield` 선택
3. **입력란**:
    *   `bondId (uint256)`: 배분할 채권의 ID (예: `1`)
    *   `amount (uint256)`: 1단계에서 입력했던 **숫자와 정확히 동일하게** 입력
        *   *예시: `1000000000000000000000`*
4. **실행**: 'Write' 버튼 클릭 후 지갑에서 승인

---

## 4. 운영 꿀팁 (Operations Tip)

*   **배분 주기**: 채권의 실제 이자 발생 주기에 맞춰 주 1회 또는 월 1회 정기적으로 실행하세요.
*   **금액 확인**: 입금 후 [포트폴리오 대시보드](https://blockchain-bond-base.vercel.app/portfolio)에서 "Unclaimed Yield" 숫자가 올라갔는지 바로 확인하세요.
*   **에러 발생 시**: 지갑에 `CTC` 잔액이 부족하여 가스비를 못 내는 것은 아닌지 가장 먼저 확인하세요.

---

## 5. 문의 및 기술 지원
시스템 장애나 주소 변경이 필요한 경우 개발팀에 연동된 스마트 컨트랙트 재배포를 요청하세요.

---

## 4. 수익금 계산 및 노출 원리

관리자가 단 한 번의 `depositYield`를 실행하면, 스마트 컨트랙트는 내부적으로 다음 과정을 **즉시** 처리합니다.

1.  **지분 파악**: 현재 `YieldDistributor`에 예치(Stake)된 채권의 전체 수량을 확인합니다.
2.  **보상액 업데이트**: `rewardPerTokenStored` 변수를 업데이트하여, 채권 1개당 돌아갈 새로운 수익금을 산출합니다.
    *   공식: `새로운 보상액 = 기존 보상액 + (입금액 / 전체 채권 수)`
3.  **개별 조회**: 투자자가 프론트엔드 포트폴리오 화면에 접속하면, 컨트랙트의 `earned(address user)` 함수가 실시간으로 호출되어 해당 사용자가 받을 수 있는 보상 숫자가 `$0.0000`에서 실제 숫자로 바뀌게 됩니다.

---

## 5. 주의 사항 및 팁

*   **Holding Only (Holding = Yield)**: V2 업데이트로 인해 투자자는 별도로 채권을 맡길(Stake) 필요가 없습니다. 지갑에 채권(BondToken)을 **보유하고만 있어도** 즉시 이자 대상에 포함됩니다.
*   **가스비 효율**: 투자자가 매 블록마다 수익을 수령하는 것이 아니라, 관리자가 한 번에 많은 수익을 입금하고 투자자가 원할 때 한 번에 수령(Claim)하는 `Pull Pattern`을 사용하여 네트워크 비용을 절약합니다.
*   **운영 주기**: 매일, 매주 또는 매월 등 정기적인 운영 주기에 맞춰 수익을 입금하는 것을 권장합니다.
