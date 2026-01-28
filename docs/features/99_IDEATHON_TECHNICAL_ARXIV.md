# [기능 명세 09] 아이디어톤 기술 대응 아카이브 (Technical Q&A Arxiv)

## 1. 스마트 컨트랙트 구조 (Smart Contract Architecture)
- **Token Standard**: ERC-1155 (Multi-Token standard)를 사용하여 단일 컨트랙트에서 다수의 IP 채권을 효율적으로 관리.
- **Role-Based Access Control (RBAC)**: `YieldDistributor` 컨트랙트가 `BondToken`의 `MINTER_ROLE`을 보유하여, 사용자 승인 없이도 정교한 재투자(Reinvest) 로직 수행 가능.
- **Stability Engine**: 수익금 정산은 USDC 페깅으로 진행하여 기초 자산의 가치 변동성을 최소화.

## 2. 데이터 무결성 및 오라클 (Data Integrity & Oracle)
- **Problem**: 오프체인의 실물 매출 데이터를 블록체인이 어떻게 믿을 것인가?
- **Solution**: 
    1. **Dual Verification Loop**: 매출 발생 시 API를 통해 데이터가 전송되며, 시스템 봇이 이를 온체인 이벤트와 대조 검증.
    2. **Audit Logic**: `ChoonsimBond.sol` 내의 `auditRevenue` 함수를 통해 검증된 매출만 정산금으로 확정. 
    3. **Transparency**: 모든 정산 이력은 Creditcoin Scan을 통해 누구나 투명하게 확인 가능.

## 3. AI 기반 인텔리전트 대시보드 (AI-Powered Dashboard)
- **Dynamic Context RAG**: 투자자의 실시간 잔액, APR, 재투자 효율 데이터를 Gemini 2.0 모델이 학습하여 맞춤형 자산 관리 조언 제공.
- **Edge Deployment**: Vercel Edge Runtime을 통해 전 세계 어디서든 0.1초 미만의 반응 속도로 투자 지표 조회.

## 4. 예상 Q&A 및 대응 논리
- **Q: IP 가치가 하락하면 어떻게 되는가?**
  - A: 본 모델은 IP의 단순 소유권이 아닌 '발생 매출 기반 수익권'에 집중합니다. 팬덤의 활동이 있는 한 매출은 발생하며, USDC 기반 정산으로 유동성을 확보합니다.
- **Q: Creditcoin 3.0을 선택한 이유는?**
  - A: 실물 자산(RWA) 전문 L1으로서의 보안성과 낮은 가스비, 그리고 Universal Oracle 인프라가 본 프로젝트의 데이터 신뢰도 확보에 최적화되어 있습니다.

---
**문서 관리**: 이 문서는 아이디어톤 기술 심사 시 'Appendices'로 활용됩니다.
