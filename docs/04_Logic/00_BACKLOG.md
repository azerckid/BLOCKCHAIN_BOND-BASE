# 프로젝트 작업 백로그 (Backlog)
> Created: 2026-02-01 15:14
> Last Updated: 2026-02-09 10:55

## 1. 현재 진행 상황 (Kanban)

### 🔴 Todo (할 일)
- [ ] **[품질 개선 Phase 2]** 환경변수 Startup 검증, 보안 헤더, .env git history 정리 → [구현 계획](./02_QUALITY_IMPROVEMENT_PLAN.md) 3절
- [ ] **[품질 개선 Phase 3]** 스마트 컨트랙트 Pausable/SafeERC20 강화 + 재배포 → [구현 계획](./02_QUALITY_IMPROVEMENT_PLAN.md) 4절
- [ ] 춘심톡 백엔드 실제 `api/revenue` 호출 모듈 개발 지원
- [ ] 오라클 노드 외부 PG사 API 연동 테스트
- [ ] 관리자 포털 다중 채권 관리 기능 추가
- [ ] AI 에이전트 온체인 툴링(Tooling) 고도화

### 🟡 Doing (진행 중)
- [ ] **[품질 개선 Phase 1]** 프론트엔드 즉시 수정 (API Zod 검증, Faucet Rate Limiting, ErrorBoundary 등) → [구현 계획](./02_QUALITY_IMPROVEMENT_PLAN.md) 2절
- [ ] **문서 체계 현대화**: `manage-docs` 스킬 기반 5단계 레이어 리팩토링 및 이관 (70% 완료)
- [ ] AI 지식 베이스(`knowledge.json`) 정규화 및 레거시 데이터 제거

### 🟢 Done (완료)
- [x] 코드 품질 종합 감사 수행 및 보고서 작성 → [감사 보고서](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [x] 품질 개선 구현 계획 수립 → [구현 계획](./02_QUALITY_IMPROVEMENT_PLAN.md)
- [x] AGENTS.md 내 문서 관리 표준 업데이트 (skill: manage-docs 반영)
- [x] Foundation 레이어 이관 및 관련 문서 정규화
- [x] Specs 레이어 이관 및 기술 명세 최신화
- [x] UI/UX 춘심 전용 브랜딩 정규화 (Growth Market 등)
- [x] 기본 수익 수집 API 및 오라클 봇 구현
- [x] 문서-코드 정합성 검토 및 수정 (PROJECT_OVERVIEW, ADMIN_PORTAL_SPEC, INFRASTRUCTURE, AI_STRATEGY, HANDOVER)

## 2. 문서 구조 가이드 (5-Layer)
- **01_Foundation**: [Vision](./01_Foundation/01_INTEGRATION_PLAN.md), [Roadmap](./01_Foundation/03_ROADMAP.md)
- **02_Prototype**: UI 프로토타입 리뷰 결과
- **03_Specs**: [Infra](./03_Specs/01_INFRASTRUCTURE.md), [Revenue API](./03_Specs/02_REVENUE_BRIDGE_SPEC.md)
- **04_Logic**: [Audit Logic](./04_Logic/01_AUDIT_LOGIC.md), [Backlog](./04_Logic/00_BACKLOG.md)
- **05_Test**: QA 결과 및 보고서

---

## X. Related Documents
- **Foundation**: [Roadmap](../01_Foundation/03_ROADMAP.md) - 마일스톤 및 일정
- **Foundation**: [Project Overview](../01_Foundation/00_PROJECT_OVERVIEW.md) - 비전 및 스택
- **Logic**: [Quality Improvement Plan](./02_QUALITY_IMPROVEMENT_PLAN.md) - 품질 개선 구현 계획
- **Test**: [Code Quality Audit](../05_Test/04_CODE_QUALITY_AUDIT.md) - 코드 품질 감사 보고서
