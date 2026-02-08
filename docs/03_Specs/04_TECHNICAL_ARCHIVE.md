# 아이디어톤 기술 대응 아카이브 (Technical Q&A)
> Created: 2026-01-25 10:00
> Last Updated: 2026-02-09 04:18

## 1. 스마트 컨트랙트 아키텍처
- **Token Standard**: ERC-1155를 사용하여 단일 컨트랙트에서 다수의 IP 채권을 효율적으로 관리.
- **RBAC**: `YieldDistributor` 컨트랙트가 `BondToken`의 `MINTER_ROLE`을 보유하여 정교한 재투자(Reinvest) 로직 수행.
- **Stability Engine**: USDC 페깅 정산을 통해 자산 가치 변동성 최소화.

## 2. 데이터 무결성 및 오라클
- **Problem**: 오프체인의 실물 매출 데이터를 블록체인이 어떻게 신뢰하는가?
- **Solution**: 
    1. **Dual Verification Loop**: 매출 API 데이터와 온체인 이벤트의 상호 검증.
    2. **Audit Logic**: `auditRevenue` 함수를 통해 검증된 매출만 정산금으로 확정. 
    3. **Transparency**: 모든 정산 이력은 Creditcoin Scan을 통해 투명하게 공개.

## 3. 예상 기술 Q&A
- **Q: IP 가치가 하락하면 어떻게 되는가?**
  - A: 본 모델은 단순 소유권이 아닌 '발생 매출 기반 수익권'에 집중함. 팬덤 활동(구독, MD 등)이 있는 한 매출은 발생하며, USDC 기반 정산으로 안정적 유동성 확보.
- **Q: Creditcoin 3.0을 선택한 이유는?**
  - A: RWA 전문 L1으로서의 보안성, 낮은 가스비, Universal Oracle 인프라가 데이터 신뢰도 확보에 최적화됨.

---

## X. Related Documents
- **Foundation**: [Submission Spec](../01_Foundation/07_SUBMISSION_SPEC.md) - 프로젝트 전체 비전 및 키워드
- **Specs**: [Infrastructure Specs](./01_INFRASTRUCTURE.md) - 네트워크 및 기술 스택
- **Logic**: [Audit Logic](../04_Logic/01_AUDIT_LOGIC.md) - 상세 데이터 검증 알고리즘
