# BondBase User App Guide

본 문서는 **BondBase 플랫폼**의 각 페이지별 기능, 용어 정의, 그리고 사용자가 수행할 수 있는 모든 상호작용(버튼 클릭 등)에 대해 상세하게 설명합니다.

---

## 1. Dashboard (대시보드)
**경로**: `/` (Home)

BondBase에 접속했을 때 가장 먼저 보이는 화면으로, 사용자의 투자 요약과 플랫폼의 주요 지표를 한눈에 보여줍니다.

### 1.1 주요 지표 (Key Metrics)
상단에 위치한 4개의 카드 섹션입니다.
- **Total Portfolio Value**: 현재 사용자가 투자한 모든 채권의 원금 가치 합계입니다.
- **Average Yield (APR)**: 보유 중인 자산들의 가중 평균 연간 수익률(APR)입니다.
- **Unclaimed Yield**: 발생했지만 아직 지갑으로 인출하지 않은 '수령 가능한' 이자 수익 총액입니다.
- **TVL in Protocol**: BondBase 전체 프로토콜에 예치된 총 자산 규모(Total Value Locked)입니다.

### 1.2 Investment Opportunities (투자 기회)
- **New Investment Opportunities**: 최근 등록된 채권 상품들을 카드 형태로 미리 보여줍니다.
- **View All Markets (버튼)**: 클릭 시 **Bond Market** 페이지로 이동하여 전체 상품 목록을 확인합니다.

---

## 2. Bond Market (채권 시장)
**경로**: `/market`

실제 RWA(Real World Asset) 기반 채권 상품을 검색하고 필터링하여 투자할 수 있는 마켓플레이스입니다.

### 2.1 검색 및 필터 (Search & Filter)
- **Search Input**: 채권의 이름(Title)이나 지역(Location, 예: Bangkok)을 입력하여 검색합니다.
- **Category Tabs**: `All`, `Real Estate`, `Agriculture`, `Energy`, `Logistics` 등의 탭을 클릭하여 해당 카테고리 상품만 필터링합니다.

### 2.2 채권 카드 (Bond Card)
각 상품 카드는 다음과 같은 정보를 포함합니다.
- **APR**: 연간 수익률 (예: 12.5%).
- **Term**: 투자 기간 (예: 12 Months).
- **Location**: 자산의 소재지.
- **Funding Progress**: 모집된 금액 / 목표 금액. (`Target $5.0M` 등)
- **Invest Now (버튼)**:
    - 클릭 시 **투자 모달(Investment Modal)**이 열립니다.
    - **Step 1: Approve**: 처음 투자 시, 내 지갑의 USDC 사용 권한을 승인하는 트랜잭션을 발생시킵니다.
    - **Step 2: Deposit**: 승인 후 원하는 투자 금액을 입력하고 `Confirm Investment`를 누르면 실제 투자가 진행됩니다.

---

## 3. My Portfolio (내 포트폴리오)
**경로**: `/portfolio`

나의 투자 내역을 상세 관리하고, 발생한 수익(Yield)을 청구(Claim)하거나 재투자(Reinvest)하는 페이지입니다.

### 3.1 자산 요약 (Summary Stats)
- **Total Value Locked**: 내 총 투자 자산.
- **Cumulative Yield**: 현재까지 누적된(쌓인) 실시간 이자 수익입니다.
    - **CLAIM (버튼)**: `Cumulative Yield`가 $0 이상일 때 나타납니다. 클릭 시 **YieldDistributor** 컨트랙트와 상호작용하여 이자를 내 지갑으로 즉시 인출합니다. (가스비 발생)
- **Avg. Portfolio APR**: 내 포트폴리오의 평균 수익률.

### 3.2 차트 (Charts)
- **Performance Chart**: 시간 경과에 따른 자산 가치 변화 그래프.
- **Allocation Chart**: 자산 카테고리별 분산 투자 비율을 보여주는 원형 차트.

### 3.3 투자 목록 (Investment List)
보유 중인 각 채권별 상세 상태를 보여줍니다.
- **Engine Status Badge**:
    - `HOLDING ACTIVE`: 정상 운용 중.
    - `COMPLETELY REPAID`: 상환 완료.
    - `ASSET DEFAULTED`: 채무 불이행(부실) 발생.
- **Principal Repaid**: 오라클이 검증한 원금 상환 비율(%).
- **Oracle Verified / PROOF (링크)**: 클릭 시 오라클이 제출한 투명성 증명 데이터(IPFS/URL)를 새 탭에서 엽니다.
- **REINVEST (버튼)**: (활성화 시) 발생한 이자를 인출하지 않고 원금에 합산하여 복리 효과를 누립니다.

---

## 4. Impact Map (임팩트 투명성)
**경로**: `/impact`

투자가 만들어내는 실제 사회적/환경적 가치(ESG Impact)를 지도와 데이터로 확인합니다.

### 4.1 Stats Grid (ESG 지표)
- **Total Carbon Reduced**: 탄소 배출 저감량 (kg 단위).
- **Active Jobs Created**: 해당 투자로 인해 창출된 일자리 수.
- **Community ESG Score**: 지역 사회 기여도 등급 (예: A+).

### 4.2 Interactive Map (지도)
- **Marker (핀)**: 지도 위의 핀을 클릭하면 해당 RWA 자산의 상세 정보 창(Info Window)이 뜹니다.
- **Quick Controls (하단 버튼)**: `Bangkok`, `Chiang Mai` 등 버튼 클릭 시 지도가 해당 지역으로 자동 이동합니다.

### 4.3 Detailed Metrics (우측 패널)
- 선택된 자산의 구체적인 Impat 데이터를 막대 차트(Bar Chart)로 시각화합니다.
- **ESG Verification**: 오라클에 의해 데이터가 언제 마지막으로 검증되었는지(Verified On 날짜) 표시합니다.

---

## 5. AI Concierge (AI 가이드)
**경로**: `/ai-guide`

AI 챗봇을 통해 BondBase 사용법, 투자 가이드, 블록체인 용어 등을 질문할 수 있습니다.

### 5.1 Controls
- **Engine Selector**: 사용할 AI 모델을 선택합니다. (`GEMINI 2.0` 또는 `GPT-4O`)
- **RESET (버튼)**: 대화 내용을 모두 지우고 초기화합니다.

### 5.2 Quick Actions
채팅창이 비어있을 때 제공되는 추천 질문 버튼들입니다. 클릭하면 즉시 해당 질문을 전송합니다.
- `💳 Get Testnet Tokens`: 테스트넷 토큰 받는 법.
- `💰 How to Invest`: 투자 절차 안내.
- `📈 Yield System`: 수익 구조 설명.
- `⚙️ Wallet Setup`: 지갑 설정 가이드.

---

## 6. Settings (설정)
**경로**: `/settings`

계정 및 지갑 연결 설정을 관리합니다.

### 6.1 Wallet Tab
- **Connected Wallet**: 현재 연결된 지갑 주소와 네트워크 상태를 보여줍니다.
- **Faucet (테스트넷 전용)**:
    - **Mint MockUSDC**: 테스트용 가상 화폐(MockUSDC) 1,000개를 내 지갑으로 발행합니다.
    - **Mint Native Token**: (지원 시) 테스트용 가스비 토큰을 요청합니다.
- **Disconnect (버튼)**: 지갑 연결을 해제합니다.

### 6.2 Profile / Appearance Tab
- **Profile**: 사용자 닉네임, 이메일 등 개인 정보 수정 (현재 데모 버전에서는 Mock 동작).
- **Appearance**: 다크 모드/라이트 모드 테마 설정.

---
**Note**: 본 가이드는 v1.0 기준으로 작성되었으며, 추후 기능 업데이트에 따라 변경될 수 있습니다.
