# BuildCTC Project Architecture & Concepts

## 1. 개요 (Overview)
본 문서는 BuildCTC 프로토콜을 구성하는 핵심 **스마트 컨트랙트의 역할**과, 프론트엔드 연동의 중추인 **Wagmi/Viem**의 개념을 명확히 정의하기 위해 작성되었습니다.

## 2. 스마트 컨트랙트 아키텍처 (Core Smart Contracts)
BuildCTC 생태계는 다음 4개의 컨트랙트가 유기적으로 상호작용하며 작동합니다.

### 🏛️ A. MockUSDC.sol (자금, Currency)
*   **Role**: 이 생태계의 **기축 통화(Base Currency)**입니다.
*   **Description**: 현실 세계의 USD 또는 USDC를 테스트넷 환경에서 시뮬레이션한 ERC-20 토큰입니다.
*   **Key Functions**:
    *   **Payment**: 투자자가 채권(Bond)을 구매할 때 지불하는 수단.
    *   **Reward**: 투자 수익(이자)을 지급받는 수단.
    *   **Faucet**: 테스트 환경에서 누구나 무료로 자금을 확보할 수 있는 기능 제공.

### 📜 B. BondToken.sol (상품, Asset)
*   **Role**: 투자자가 소유하는 **채권 인증서(Certificate)**입니다.
*   **Description**: 특정 실물 자산(RWA)에 대한 투자 지분을 증명하는 **ERC-1155** 표준 토큰입니다.
*   **Key Functions**:
    *   **Proof of Investment**: "나는 A 농장에 투자했다"는 불변의 온체인 증명.
    *   **Multi-Asset**: 하나의 컨트랙트로 다양한 종류의 채권(ID 1, ID 2...)을 발행 및 관리.
    *   **Claim Right**: 이 토큰을 보유한 지갑만이 수익 배분(Yield)을 청구할 자격을 가짐.

### 🏦 C. LiquidityPool.sol (거래소, Marketplace)
*   **Role**: 자금과 채권을 교환하는 **중개소(Exchange)**입니다.
*   **Description**: 은행 창구와 같으며, 투자자의 자금을 모아 채권을 발행해주고 모인 자금을 대출자(Borrower)에게 전달합니다.
*   **Key Functions**:
    *   **Invest (Purchase)**: 투자자로부터 `MockUSDC`를 받고, 즉시 `BondToken`을 발행(Mint)하여 지급.
    *   **Withdraw**: 모인 자금을 RWA 운영 자금으로 인출.
    *   **Access Control**: 유일하게 `BondToken`을 발행할 수 있는 권한(`MINTER_ROLE`)을 보유.

### 💸 D. YieldDistributor.sol (정산소, Settlement)
*   **Role**: 투자 수익을 계산하고 지급하는 **정산 시스템**입니다.
*   **Description**: 배당금 지급 창구이며, 복잡한 수익률 계산과 지급 프로세스를 자동화합니다.
*   **Key Functions**:
    *   **Deposit Yield**: 운영 수익이 발생하면 관리자가 `MockUSDC`를 예치.
    *   **Claim**: 투자자가 자신의 `BondToken` 보유량을 증명하면, 지분에 비례한 수익금을 계산하여 지급.
    *   **Auto-Calculation**: Synthetix의 `RewardPerToken` 알고리즘을 사용하여 초 단위 수익 분배 가능.

### 🔮 E. OracleAdapter.sol (데이터 허브, Data Hub)
*   **Role**: 실물 자산의 **성과 및 ESG 데이터를 체인에 연결**하는 교량입니다.
*   **Description**: 외부 핀테크 파트너의 운영 데이터(수익금, 탄소 절감량 등)를 블록체인 노드로 전달받아 기록하는 스마트 오라클 어댑터입니다.
*   **Key Functions**:
    *   **Sync Performance**: 실제 채무 이행 상태(원금/이자 상환액)를 정기적으로 업데이트.
    *   **ESG Tracking**: 탄소 절감량, 일자리 창출 등 비재무적 성과 지표 관리.
    *   **Proof Reference**: IPFS 등 외부 저장소의 증빙 자료(Report) 링크를 온체인에 영구 기록.

---

## 3. 프론트엔드 연동 기술 (Frontend Web3 Stack)

### 🔌 Wagmi (Control Center)
*   **Definition**: React 애플리케이션과 이더리움(EVM) 블록체인을 연결하는 **통신 제어 센터**입니다.
*   **Why we use it**:
    *   **Chain Management**: "우리는 Creditcoin Testnet만 사용한다"는 규칙을 전역적으로 강제합니다.
    *   **Wallet Connection**: MetaMask, Coinbase Wallet 등 수많은 지갑과의 연결 복잡성을 표준화된 훅(Hook)으로 처리합니다.
    *   **Auto-Refresh**: 계정 변경, 네트워크 변경, 연결 해제 등의 이벤트를 자동으로 감지하고 UI를 갱신합니다.

### 🛠️ Viem (Engine Room)
*   **Definition**: Wagmi가 내부적으로 사용하는 **저수준(Low-level) 인터페이스 라이브러리**입니다. (과거 ethers.js의 대체재)
*   **Why we use it**:
    *   **Type Safety**: TypeScript 친화적으로 설계되어, ABI의 입출력 타입을 자동으로 추론해줍니다. (오류 방지)
    *   **Lightweight**: 매우 가볍고 빠르며, 불필요한 기능을 덜어낸 순수 연산/통신 엔진입니다.

### 🔄 전체 데이터 흐름 (Data Flow)
1.  **Backend(Contract)**: `MockUSDC`, `BondToken` 등이 블록체인에 배포됨.
2.  **Engine(Viem)**: 블록체인 노드(RPC)와 직접 통신하여 데이터를 가져옴.
3.  **Controller(Wagmi)**: 가져온 데이터를 React 컴포넌트가 쓰기 편한 상태(State)로 변환하고 캐싱함.
4.  **Frontend(UI)**: 사용자가 버튼을 누르면 Wagmi를 통해 지갑 서명을 요청하고 트랜잭션을 발생시킴.

---

## 4. 임팩트 투명성 (Impact Transparency Concepts)

BuildCTC는 단순한 수익 창출을 넘어, 투자가 실제로 어떤 긍정적인 영향을 미치는지 증명하는 **'Impact-First'** 금융을 지향합니다.

### 🌱 ESG 성과 지표 (ESG Metrics)
운영 파트너로부터 수집된 데이터를 오라클을 통해 블록체인에 기록하며, 다음의 핵심 지표를 추적합니다:
*   **Environment**: 탄소 배출 저감량 (kg) 등 기후 변화 대응 성과.
*   **Social**: 고용 창출 수, 지원된 중소기업(SME) 수 등 지역 사회 기여도.
*   **Governance**: 운용 보고서(Report URL) 투명 공개 및 스마트 컨트랙트 기반의 정산 증명.

### 🗺️ 지리적 시각화 (Geospatial Visualization)
투자 상품의 실제 위치 정보를 Google Maps와 연동하여 실체성을 부여합니다. 이를 통해 투자자는 자신의 자산이 전 세계 어디에서 실물 경제를 움직이고 있는지 직관적으로 탐색할 수 있습니다.

### 🔗 데이터 신뢰 체인 (Data Trust Chain)
1. **Fintech Source**: 현지 운영사의 실제 대출 및 운영 데이터 발생.
2. **Relayer Bot**: 주기적으로 소스 데이터를 검증하고 블록체인에 전송.
3. **OracleAdapter**: 데이터의 불변성을 보장하며 누구나 조회 가능하도록 온체인 기록.
4. **Impact Dashboard**: 투자자에게 그래프와 지도를 통해 검증된 임팩트 성과 시각화.
