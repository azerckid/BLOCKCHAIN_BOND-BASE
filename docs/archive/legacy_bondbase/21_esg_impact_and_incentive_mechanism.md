# 21. ESG 임팩트 시각화 및 보상 체계 명세서 (ESG Impact & Incentive Mechanism)

## 1. 배경 및 목적 (Background)
BondBase는 단순한 자산 운용 플랫폼을 넘어, 실물 자산(RWA) 투자가 사회와 환경에 미치는 긍정적인 영향을 시각화하고, 이를 투자자의 보상으로 전환하는 **'Value-Driven Finance'**를 지향합니다. 본 문서는 ESG 데이터의 시각적 표현 방식과 임팩트 성과에 연동된 스마트 컨트랙트 기반 보상 로직의 기술 명세를 정의합니다.

---

## 2. ESG 데이터 시각화 (Impact Visualization)

### 2.1 인터랙티브 임팩트 맵 (Interactive Geography)
*   **기능**: 사용자가 투자한 자산의 물리적 위치를 지도에 표시하여 자산의 실체성(Tangibility) 확보.
*   **상세**: 
    *   Google Maps API를 활용한 전 세계 투자 포인트 렌더링.
    *   **임팩트 팝업**: 핀 클릭 시 해당 프로젝트의 주요 ESG 지표(예: 탄소 절감량, SME 지원 수) 표시.
    *   **지역별 클러스터링**: 투자 비중이 높은 지역의 임팩트 합계 요약.

### 2.2 ESG 스코어카드 (ESG Scorecard)
*   **환경(E)**: 탄소 배출 절감량 (Carbon Offset, CO2 톤 단위).
*   **사회(S)**: 창출된 일자리 수, 지원된 소상공인(SME) 수.
*   **지배구조(G)**: 오라클 검증 빈도 및 데이터 투명성 지수.
*   **개인화 대시보드**: "나의 투자가 창출한 총 임팩트"를 시각적 차트(Radar Chart, Progress Bar)로 제공.

---

## 3. 추가 보상 및 인센티브 로직 (Enhanced Reward Logic)

사용자의 장기 투자를 유도하고 사회적 가치를 창출하기 위한 다층적 보상 체계를 도입합니다.

### 3.1 임팩트 연동 수익률 (Impact-Linked Yield)
*   **로직**: 사전에 설정된 ESG 목표(KPI) 달성 시, 기본 APR 외에 추가 보너스 수익률을 지급.
*   **구현**: `OracleAdapter`를 통해 상환 데이터와 함께 KPI 달성 여부를 수신 -> `YieldDistributor`에서 보너스 인덱스 업데이트.

### 3.2 로열티 및 우선 투자권 (Loyalty Points & Whitelist)
*   **로열티 점수**: 투자 금액과 보유 기간(Time-Weighted)을 조합하여 산정.
*   **혜택**: 
    *   차기 고수익 채권 발행 시 'Pre-sale' 참여 권한 부여.
    *   플랫폼 이용 수수료 할인.
    *   임팩트 뱃지(NFT) 발급을 통한 프로필 개인화.

### 3.3 계층별 투자 등급 (Tiered Investment Tiers)
*   **Bronze / Silver / Gold / Diamond** 등급제 운용.
*   상위 등급일수록 거버넌스 투표권 및 추가 리워드 가중치(Multiplier) 부여.

---

## 4. 기술 사양 (Technical Specification)

### 4.1 데이터 모델 확장 (Solidity Struct Update)
`IOracleAdapter`와 관련 컨트랙트에 ESG 데이터를 포함하도록 확장합니다.

```typescript
// Proposed Interface Extension
struct ImpactData {
    uint256 carbonReduced; // kg
    uint256 jobsCreated;
    uint256 smeSupported;
    string reportUrl;      // 상세 보고서 링크
}

// OracleAdapter Update
function updateAssetStatus(
    uint256 bondId, 
    AssetPerformance calldata perf, 
    ImpactData calldata impact
) external;
```

### 4.2 보상 인덱스 로직
수익 배분 엔진(`YieldDistributor`)에 보너스 가중치를 적용할 수 있는 변수를 추가합니다.
*   `userReward = (balance * rewardPerToken) * (1 + impactBonusMultiplier)`

---

## 5. 단계별 구현 로드맵 (Roadmap)

### Phase 1: 시각화 기초 (Visualization MVP)
- [ ] Google Maps API 연동 및 `ImpactMap` 컴포넌트 개발.
- [ ] 정적 ESG 데이터(Mock)를 활용한 채권 상세 페이지 스코어카드 추가.

### Phase 2: 데이터 연동 및 증명 (Data Integration)
- [ ] `OracleAdapter` 컨트랙트 확장 (ESG 필드 추가).
- [ ] 리레이어 봇(Phase 3)에서 외부 ESG API 데이터 수집 및 업데이트 기능 추가.

### Phase 3: 보상 시스템 가동 (Incentive Engine)
- [ ] `YieldDistributor` 보너스 수익률 로직 반영 및 배포.
- [ ] 사용자 등급제(Tier) 및 로열티 포인트 시스템 UI 연동.

---
**작성일**: 2026-01-17
**버전**: v1.0
**담당**: BuildCTC Architecture Team
