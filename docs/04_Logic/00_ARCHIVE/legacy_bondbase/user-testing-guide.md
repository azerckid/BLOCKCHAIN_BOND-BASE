# BondBase 알파 테스트 사용자 가이드

본 문서는 **BondBase (V2)**의 알파 테스트에 참여하는 사용자를 위한 단계별 가이드입니다. 
테스터는 RWA(실물자산) 채권에 투자하고, 이자를 수령하거나 재투자하여 복리 효과를 체험할 수 있습니다.

---

## 1. 사전 준비 (Prerequisites)

테스트를 진행하기 위해 **MetaMask** 지갑과 **테스트넷 코인(CTC)**이 필요합니다.

### A. 네트워크 설정 (Creditcoin Testnet)
MetaMask에 아래 네트워크를 추가해 주세요. (자동으로 추가되지 않는 경우 수동 입력)

| 항목 | 값 |
| :--- | :--- |
| **Network Name** | Creditcoin Testnet |
| **RPC URL** | `https://rpc.cc3-testnet.creditcoin.network` |
| **Chain ID** | `102031` |
| **Currency Symbol** | `CTC` |
| **Block Explorer** | `https://creditcoin-testnet.blockscout.com` |

### B. 가스비(CTC) 받기
트랜잭션 수수료(Gas Fee)를 지불하기 위해 CTC 코인이 필요합니다.
1. [Creditcoin Discord](https://discord.gg/creditcoin) 접속
2. `#testnet-faucet` 채널 이동
3. 명령어 입력: `/faucet <본인의_지갑_주소>`
   - 예: `/faucet 0x1234...abcd`

---

## 2. 테스트 시작하기 (Getting Started)

### 1단계: 지갑 연결 및 투자금 확보
1. **BondBase 웹사이트**에 접속합니다.
2. 우측 상단 **[Connect Wallet]** 버튼을 눌러 지갑을 연결합니다.
3. 좌측 메뉴 **Settings > Wallet** 탭으로 이동합니다.
4. **"Testnet Faucet"** 섹션의 **[Get 1,000 USDC]** 버튼을 클릭합니다.
   - *이것은 투자를 위한 가상의 달러(MockUSDC)입니다.*
   - *지갑 승인(Approve) 및 트랜잭션 서명이 필요합니다.*

### 2단계: 채권 투자 (Invest)
1. 좌측 메뉴 **Bond Market**으로 이동합니다.
2. 원하는 채권 카드의 **[Invest]** 버튼을 클릭합니다. (예: Bond #1)
3. 투자할 금액(예: `100`)을 입력하고 **[Purchase Bond]**를 클릭합니다.
4. 트랜잭션이 완료되면 "Purchase Successful" 메시지가 뜹니다.

---

## 3. 수익 관리 체험 (Yield Experience)

BondBase V2는 **"보유가 곧 이자(Hold to Earn)"** 시스템을 채택하고 있습니다. 별도의 예치 과정 없이 채권을 보유하기만 하면 이자가 발생합니다.

### 3단계: 수익 확인 (Portfolio)
1. 좌측 메뉴 **My Portfolio**로 이동합니다.
2. **"Accrued Profit"** (미지급 수익) 항목을 확인합니다.
   - *초기에는 `$0.00`입니다. 관리자가 수익을 배분하는 순간 실시간으로 숫자가 올라갑니다.*
   - *(테스트 중인 관리자에게 "배분해주세요"라고 요청하세요!)*

### 4단계: 재투자 체험 (Reinvest & Compound) 🌟
발생한 이자를 현금화하지 않고, 원금에 합쳐서 **복리 효과**를 누려보세요.

1. 이자가 쌓인 상태에서 **[REINVEST]** 버튼을 클릭합니다.
2. 트랜잭션을 승인하면:
   - **Accrued Profit**은 `$0.00`으로 초기화됩니다.
   - 대신 **Holdings (보유 원금)**이 이자 금액만큼 **증가**합니다.
   - *예: 100 USDC 원금 + 10 USDC 이자 -> 재투자 후 110 USDC 원금*

---

## 4. 문제 해결 (Troubleshooting)

*   **Q: 버튼이 눌리지 않아요.**
    *   A: 지갑에 가스비(CTC)가 충분한지 확인하세요. 최소 1 CTC 이상 보유를 권장합니다.
*   **Q: 이자가 안 들어와요.**
    *   A: 관리자가 아직 `Distribute Yield`를 실행하지 않았을 수 있습니다. 또는 채권 구매가 트랜잭션 실패로 처리되었는지 확인하세요.
