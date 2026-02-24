# 프로젝트 작업 백로그 (Backlog)
> Created: 2026-02-01 15:14
> Last Updated: 2026-02-13

## 1. 현재 진행 상황 (Kanban)

### 🔴 Todo (할 일)

#### 높음 (High)
- (현재 High 우선순위 항목 없음)

#### 중간 (Medium)




#### 낮음 (Low) / 장기
- [ ] **[컨트랙트 UUPS 업그레이드]** 메인넷 전환 시 검토. → [감사 P3 6.3](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [ ] **[Relayer 모니터링 체계]** 구조화 로깅(Pino), 연속 실패 알림(Slack webhook), 메트릭 수집. 운영 인프라 결정 후 진행. → [감사 P3 6.6](../05_Test/04_CODE_QUALITY_AUDIT.md)
#### 기능 개발 (Feature)
- [ ] 춘심톡 백엔드 실제 `api/revenue` 호출 모듈 개발 지원
- [ ] 오라클 노드 외부 PG사 API 연동 테스트
- [ ] 관리자 포털 다중 채권 관리 기능 추가
- [ ] AI 에이전트 온체인 툴링(Tooling) 고도화

### 🟡 Doing (진행 중)
- (현재 진행 중인 작업 없음)

### 🟢 Done (완료)
- [x] **[프론트엔드 테스트 인프라]** Vitest + Testing Library 설정 완료. `api.faucet`, `api.revenue`, `api.chat` 라우트에 대한 단위 테스트 26개 작성 및 통과. `reactRouter` 플러그인 충돌 해결을 위해 테스트용 `vitest.config.ts` 분리 구성 (2026-02-13) → [감사 P2](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [x] **[Relayer 데이터 검증]** `MockFintechAPI` 클래스 분리 및 Zod 스키마 검증 도입, 단위 테스트 2건 작성 및 통과. `index.ts` 리팩토링 완료 (2026-02-13) → [감사 P2 5.7](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [x] **[`as any` 타입 전면 제거]** contracts.ts에 `AssetPerformance`, `ImpactData`, `BondInfo` 인터페이스 정의. 프론트엔드 전체 25건 `as any` → 0건 달성. choonsim.tsx, impact.tsx, impact-summary.tsx, advanced-oracle-module.tsx, yield-deposit-module.tsx, investment-list.tsx, ai-guide.tsx, help-guide.tsx, choonsim-dashboard.tsx 수정. tsc --noEmit 통과 확인 (2026-02-13)
- [x] **[V3 E2E 플로우 검증 + Relayer 수정]** 전체 코드-설정 정합성 검증 완료. Relayer Bond ID 불일치([1,2] → [101]) 수정, MockFintechAPI Choonsim 맥락 교체, setTimeout 재귀 패턴+exponential backoff+RPC fallback 적용. 테스트넷 실행 성공 확인 (2026-02-13)
- [x] **[AI 지식 베이스 정규화]** `knowledge.json` 아카이브/레거시 데이터 제거 완료: `generate-knowledge.cjs` ignoreDirs 대소문자 무시+부분 일치 로직 개선, 43건 -> 25건(활성 문서만), 324KB -> 97KB(-70%) (2026-02-13)
- [x] **[문서 체계 현대화]** `manage-docs` 스킬 기반 5단계 레이어 리팩토링 완료: 전체 문서 메타데이터 헤더 검증, Related Documents 섹션 표준화, 깨진 링크 정리, 날짜 정합성 확보 (2026-02-13)
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
- [x] **[모노레포 워크스페이스]** npm workspaces 도입. root packages 생성을 통해 `contracts`, `frontend`, `relayer` 통합 관리. (2026-02-13) → [감사 P3 6.1](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [x] **[공유 타입 패키지]** `packages/types` 생성. `contracts`의 ABI/타입/상수를 frontend와 공유. `@bond-base/types` 워크스페이스 패키지 구성. (2026-02-13) → [감사 P3 6.2](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [x] **[문서-코드 정합성 검토 및 수정]** (PROJECT_OVERVIEW, ADMIN_PORTAL_SPEC, INFRASTRUCTURE, AI_STRATEGY, HANDOVER)
- [x] **[Relayer 모니터링 체계]** 구조화 로깅(Pino) 적용 및 에러 핸들링 강화. (2026-02-13) → [감사 P3 6.6](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [x] **[릴레이어 운영 문서]** `03_Specs/06_RELAYER_OPS.md` 작성 완료. 경로 03_Specs 통일, 메타데이터·Related Documents 반영. (2026-02-13) → [감사 9.2](../05_Test/04_CODE_QUALITY_AUDIT.md)
- [ ] **[컨트랙트 UUPS 업그레이드]** 메인넷 전환 시 검토 (현재 Skip). → [감사 P3 6.3](../05_Test/04_CODE_QUALITY_AUDIT.md)

---

## 2. 감사 이슈 처리 현황

[코드 품질 감사 보고서](../05_Test/04_CODE_QUALITY_AUDIT.md) 기준 25개 이슈 처리 현황:

| 심각도 | 전체 | 해결 | 잔여 | 비고 |
|--------|------|------|------|------|
| P0 (Critical) | 5 | 5 | 0 | 3.1 BFG 수동 보류, 코드 조치 완료 |
| P1 (High) | 7 | 7 | 0 | 4.3 Relayer 재시도 로직 적용 완료 |
| P2 (Medium) | 7 | 7 | 0 | **완료** (전체 P2 해결) |
| P3 (Low) | 6 | 6 | 0 | **완료** (UUPS Skip) |

---

## 3. 문서 구조 가이드 (5-Layer)
- **01_Foundation**: [Vision](../01_Foundation/01_INTEGRATION_PLAN.md), [Roadmap](../01_Foundation/03_ROADMAP.md)
- **02_Prototype**: UI 프로토타입 리뷰 결과
- **03_Specs**: [Infra](../03_Specs/01_INFRASTRUCTURE.md), [Revenue API](../03_Specs/02_REVENUE_BRIDGE_SPEC.md), [V3 배포 상태](../03_Specs/05_V3_DEPLOYMENT_STATUS.md), [Relayer 운영](../03_Specs/06_RELAYER_OPS.md), [다중 캐릭터 채권](../03_Specs/07_MULTI_CHARACTER_BOND_SPEC.md)
- **04_Logic**: [Audit Logic](./01_AUDIT_LOGIC.md), [Backlog](./00_BACKLOG.md), [Quality Plan](./02_QUALITY_IMPROVEMENT_PLAN.md)
- **05_Test**: [QA Checklist](../05_Test/02_QA_CHECKLIST.md), [Code Audit](../05_Test/04_CODE_QUALITY_AUDIT.md)

---

## X. Related Documents
- **Foundation**: [Roadmap](../01_Foundation/03_ROADMAP.md) - 마일스톤 및 일정
- **Foundation**: [Project Overview](../01_Foundation/00_PROJECT_OVERVIEW.md) - 비전 및 스택
- **Logic**: [Quality Improvement Plan](./02_QUALITY_IMPROVEMENT_PLAN.md) - 품질 개선 구현 계획 (Phase 1~3 완료)
- **Specs**: [V3 Deployment Status](../03_Specs/05_V3_DEPLOYMENT_STATUS.md) - V3 배포 완료 항목 및 잔여 작업
- **Test**: [Code Quality Audit](../05_Test/04_CODE_QUALITY_AUDIT.md) - 코드 품질 감사 보고서
