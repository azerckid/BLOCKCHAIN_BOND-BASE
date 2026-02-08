# 통합 품질 보증 시나리오 및 QA 체크리스트
> Created: 2026-01-28 15:57
> Last Updated: 2026-02-09 04:06

## 1. 개요
본 문서는 프로젝트의 핵심 사용자 시나리오(End-to-End User Journey)를 기반으로 한 검증 시나리오를 정의합니다. 아이디어톤 라이브 데모 및 최종 안정성 점검의 기준이 됩니다.

## 2. 핵심 사용자 시나리오 (데모 스토리보드)

### 2.1 수익 인식 및 대화 (Awareness)
- [ ] **시나리오**: 사용자가 AI에게 당일 정산 수익을 질문함.
- [ ] **기대 결과**: AI가 온체인 오라클 데이터를 참조하여 정확한 USDC 금액을 답변하고, 춘심 페르소나를 유지함.

### 2.2 수익 재투자 플로우 (Growth)
- [ ] **시나리오**: 사용자가 수익금 재투자를 지시함.
- [ ] **기대 결과**: 시스템이 `Reinvest` 기능을 호출하고, 결과에 따라 지분(Token Count)이 실시간으로 업데이트되는 애니메이션을 노출함.

### 2.3 임팩트 시각화(Impact)
- [ ] **시나리오**: 투자금 사용처 및 팬덤 성장 지표 확인 요청.
- [ ] **기대 결과**: Fandom Impact Map이 활성화되어 남미/일본 등의 성장 지표를 시각적으로 보여줌.

## 3. 완료 기준 (DoD) 체크리스트
- [x] **화면 진입**: 모든 페이지(Home, Market, Portfolio, Impact) 정상 렌더링 확인 (No 404).
- [x] **Empty State**: 데이터가 없는 초기 상태에서 UI 깨짐 없음 확인.
- [x] **에러 피드백**: 잘못된 지갑 연결 또는 트랜잭션 거부 시 Toast 메시지 노출 확인.
- [x] **콘솔 클린**: 브라우저 콘솔에 Critical Error(Red) 부재 확인.

---

## X. Related Documents
- **Foundation**: [Roadmap](../01_Foundation/03_ROADMAP.md) - 단계별 완료 기준 참조
- **Specs**: [Revenue Bridge Spec](../03_Specs/02_REVENUE_BRIDGE_SPEC.md) - 수익 데이터 정합성 검증
- **Logic**: [Audit Logic](../04_Logic/01_AUDIT_LOGIC.md) - 오라클 검증 로직 테스트
- **Test**: [Completion Summary](./01_PHASE_COMPLETION_SUMMARY.md) - 개발 단계별 이행 완료 보고서
