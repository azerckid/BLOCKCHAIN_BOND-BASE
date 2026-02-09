# 프로젝트 작업 백로그 (Backlog)
> Created: 2026-02-01 15:14
> Last Updated: 2026-02-09

## 1. 현재 진행 상황 (Kanban)

### 🔴 Todo (할 일)

#### 높음 (High)
- [ ] **[V3 E2E 플로우 검증]** Faucet → Growth Market Invest → Oracle Update → Claim/Reinvest 전체 흐름을 테스트넷에서 검증. 코드 변경 없이 기능 확인. → [V3 배포 상태](../03_Specs/05_V3_DEPLOYMENT_STATUS.md)
- [ ] **[Relayer 안정성 강화]** 재시도 로직(exponential backoff), `setInterval` → `setTimeout` 재귀 패턴 전환, Provider health check + fallback RPC. → [감사 P1 4.3](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [ ] **[BFG + 키 로테이션]** .env git history 제거(BFG Repo-Cleaner) 및 노출된 API 키 로테이션. collaborator 사전 공지 필요. → [구현 계획 3.3절](./02_QUALITY_IMPROVEMENT_PLAN.md)

#### 중간 (Medium)
- [ ] **[`as any` 타입 개선]** V3 ABI 갱신 완료에 따라, `choonsim.tsx`, `admin/` 모듈의 `as any` 캐스팅 제거 및 타입 추론 적용. → [감사 P2 5.2](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [ ] **[프론트엔드 테스트 인프라]** Vitest + Testing Library 설정, API 라우트(faucet, revenue, chat) 단위 테스트 추가
- [ ] **[Admin 모듈 리팩토링]** oracle-trigger, yield-deposit, advanced-oracle 3개 모듈의 공통 로직을 `useContractTransaction` hook으로 추출 (~400줄 중복 제거). → [감사 P2 5.3](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [ ] **[Relayer 데이터 검증]** MockFintechAPI 반환값 Zod 스키마 적용, 범위 검사, timestamp 로직 안정화. → [감사 P2 5.7](../05_Test/04_CODE_QUALITY_AUDIT.md)

#### 낮음 (Low) / 장기
- [ ] **[모노레포 워크스페이스]** npm/pnpm workspaces로 frontend/contracts/relayer 통합 관리. → [감사 P3 6.1](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [ ] **[공유 타입 패키지]** `packages/types`에 ABI 타입, 주소 상수, 공통 인터페이스 공유. 워크스페이스와 함께 진행. → [감사 P3 6.2](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [ ] **[컨트랙트 UUPS 업그레이드]** 메인넷 전환 시 검토. → [감사 P3 6.3](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [ ] **[Relayer 모니터링 체계]** 구조화 로깅(Pino), 연속 실패 알림(Slack webhook), 메트릭 수집. 운영 인프라 결정 후 진행. → [감사 P3 6.6](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [ ] **[릴레이어 운영 문서]** `03_Specs/`에 릴레이어 배포, 모니터링, 장애 대응 가이드 작성. → [감사 9.2](../05_Test/04_CODE_QUALITY_AUDIT.md)

#### 기능 개발 (Feature)
- [ ] 춘심톡 백엔드 실제 `api/revenue` 호출 모듈 개발 지원
- [ ] 오라클 노드 외부 PG사 API 연동 테스트
- [ ] 관리자 포털 다중 채권 관리 기능 추가
- [ ] AI 에이전트 온체인 툴링(Tooling) 고도화

### 🟡 Doing (진행 중)
- [ ] **문서 체계 현대화**: `manage-docs` 스킬 기반 5단계 레이어 리팩토링 및 이관 (70% 완료)
- [ ] AI 지식 베이스(`knowledge.json`) 정규화 및 레거시 데이터 제거

### 🟢 Done (완료)
- [x] **[품질 개선 Phase 1]** API Zod 검증 3건, Faucet Rate Limiting, DEV_FALLBACK_KEY 제거, Chat dead code 제거, ErrorBoundary + 404, 미사용 의존성 정리, DB 쿼리 병렬화 (2026-02-09) → [구현 계획 2절](./02_QUALITY_IMPROVEMENT_PLAN.md)
- [x] **[품질 개선 Phase 2]** 환경변수 Startup 검증(`env.ts`), 보안 헤더(`vercel.json`), Chat API origin 검증, `.env.example`/`.gitignore` 정비 (2026-02-09) → [구현 계획 3절](./02_QUALITY_IMPROVEMENT_PLAN.md)
- [x] **[품질 개선 Phase 3]** LiquidityPool/YieldDistributor/OracleAdapter Pausable+SafeERC20+CEI+Zero-address 강화, V3 테스트넷 재배포, OracleAdapter Choice B 신규 배포, Bond 101 등록, 전체 주소 갱신 (2026-02-09) → [구현 계획 4절](./02_QUALITY_IMPROVEMENT_PLAN.md), [V3 배포 상태](../03_Specs/05_V3_DEPLOYMENT_STATUS.md)
- [x] 코드 품질 종합 감사 수행 및 보고서 작성 → [감사 보고서](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [x] 품질 개선 구현 계획 수립 → [구현 계획](./02_QUALITY_IMPROVEMENT_PLAN.md)
- [x] AGENTS.md 내 문서 관리 표준 업데이트 (skill: manage-docs 반영)
- [x] Foundation 레이어 이관 및 관련 문서 정규화
- [x] Specs 레이어 이관 및 기술 명세 최신화
- [x] UI/UX 춘심 전용 브랜딩 정규화 (Growth Market 등)
- [x] 기본 수익 수집 API 및 오라클 봇 구현
- [x] 문서-코드 정합성 검토 및 수정 (PROJECT_OVERVIEW, ADMIN_PORTAL_SPEC, INFRASTRUCTURE, AI_STRATEGY, HANDOVER)

---

## 2. 감사 이슈 처리 현황

[코드 품질 감사 보고서](../05_Test/04_CODE_QUALITY_AUDIT.md) 기준 25개 이슈 처리 현황:

| 심각도 | 전체 | 해결 | 잔여 | 비고 |
|--------|------|------|------|------|
| P0 (Critical) | 5 | 5 | 0 | 3.1 BFG 수동 보류, 코드 조치 완료 |
| P1 (High) | 7 | 6 | 1 | 4.3 Relayer 재시도 미처리 |
| P2 (Medium) | 7 | 4 | 3 | 5.2 as any, 5.3 Admin, 5.7 Relayer 검증 |
| P3 (Low) | 6 | 2 | 4 | 6.4 deploy_all (v3 대체), 6.5 이벤트 (추가됨) |

---

## 3. 문서 구조 가이드 (5-Layer)
- **01_Foundation**: [Vision](../01_Foundation/01_INTEGRATION_PLAN.md), [Roadmap](../01_Foundation/03_ROADMAP.md)
- **02_Prototype**: UI 프로토타입 리뷰 결과
- **03_Specs**: [Infra](../03_Specs/01_INFRASTRUCTURE.md), [Revenue API](../03_Specs/02_REVENUE_BRIDGE_SPEC.md), [V3 배포 상태](../03_Specs/05_V3_DEPLOYMENT_STATUS.md)
- **04_Logic**: [Audit Logic](./01_AUDIT_LOGIC.md), [Backlog](./00_BACKLOG.md), [Quality Plan](./02_QUALITY_IMPROVEMENT_PLAN.md)
- **05_Test**: [QA Checklist](../05_Test/02_QA_CHECKLIST.md), [Code Audit](../05_Test/04_CODE_QUALITY_AUDIT.md)

---

## X. Related Documents
- **Foundation**: [Roadmap](../01_Foundation/03_ROADMAP.md) - 마일스톤 및 일정
- **Foundation**: [Project Overview](../01_Foundation/00_PROJECT_OVERVIEW.md) - 비전 및 스택
- **Logic**: [Quality Improvement Plan](./02_QUALITY_IMPROVEMENT_PLAN.md) - 품질 개선 구현 계획 (Phase 1~3 완료)
- **Specs**: [V3 Deployment Status](../03_Specs/05_V3_DEPLOYMENT_STATUS.md) - V3 배포 완료 항목 및 잔여 작업
- **Test**: [Code Quality Audit](../05_Test/04_CODE_QUALITY_AUDIT.md) - 코드 품질 감사 보고서
