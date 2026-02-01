# [로드맵] 리뉴얼 전환 및 일단락 기준 문서

본 문서는 **작업이 새로 시작/리뉴얼**됨에 따라, 기존 작업을 일단락하고 새 시작의 기준이 되도록 작성된 전환(Handover) 문서입니다.  
리뉴얼 시점 이후에는 **이 문서와 여기서 참조하는 문서만을 현행 기준**으로 합니다.

---

## 1. 문서 목적 및 사용 방법

- **목적**: 리뉴얼 시점의 "완료 / 미완·보류 / 새로 시작할 것"을 고정하여, 이후 작업과 문서 정리의 기준을 둠.
- **사용**: 새 단계 착수 시 이 문서를 먼저 읽고, "완료된 것"은 건드리지 않고, "미완·보류"는 필요 시만 참고하며, "새로 시작할 것"을 기준으로 기획·설계·구현을 진행.

---

## 2. 완료된 것 (일단락 기준으로 넘김)

다음은 리뉴얼 전까지 완료된 항목입니다. **새 작업에서 재검토하지 않고 넘어가는 범위**입니다.

### 2.1 인프라·백엔드

| 항목 | 내용 | 참고 문서/코드 |
|------|------|----------------|
| 수익 수집 API (Bridge) | `api/revenue` – REVENUE, MILESTONE, METRICS 수신 | `frontend/app/routes/api.revenue.ts` |
| API Key 인증 | `CHOONSIM_API_KEY` Bearer Token | 동일 |
| DB 스키마 (춘심) | `choonsim_projects`, `choonsim_revenue`, `choonsim_milestones`, `choonsim_metrics_history` | `frontend/app/db/schema.ts` |
| 오라클 봇 (로컬) | DB → 온체인 수익 반영, 로컬 실행 | `frontend/scripts/oracle-bot.js` |
| 스마트 컨트랙트 (춘심) | ChoonsimBond, 수익 공유·마일스톤 로직 | `contracts/`, Phase 1 보고서 |

### 2.2 프론트엔드·UI

| 항목 | 내용 | 참고 |
|------|------|------|
| 춘심 전용 대시보드 | `/choonsim` – 지표·수익·마일스톤 시각화 | `frontend/app/routes/choonsim.tsx`, `choonsim-dashboard.tsx` |
| Growth Market / Fandom Impact | 사이드바·페이지 명칭 정규화 (일부 반영) | `dashboard-layout.tsx`, `bonds.tsx`, `impact.tsx` |
| 홈·Bond 카드 | Choonsim Official, Phase 3 등 뱃지·카피 | `home.tsx`, `bonds.tsx` |
| AI Guide (Phase 4) | 춘심 IP 투자 컨시어지, 지식 베이스·페르소나 | `api.chat.ts`, `knowledge.json`, Phase 4 보고서 |

### 2.3 문서

| 항목 | 내용 |
|------|------|
| Phase 1~4 이행 보고서 | `docs/reports/` – 04, 06, 07, 10 |
| 춘심 로드맵·연동 기획 | `docs/archive/roadmap/02_*`, `docs/core/01_*`, `09_*` |
| 인프라·정규화·감사 설계 | `docs/core/03_*`, `08_*`, `05_*` |

---

## 3. 미완·보류 (참고용, 새 시작 시 필요 시만 반영)

리뉴얼 전에 계획되었으나 **미완료이거나 보류**된 항목입니다. 새 작업에서 우선순위를 두지 않고, 필요할 때만 참고합니다.

### 3.1 춘심톡 실제 연동

- 춘심 AI-Talk 백엔드 → BondBase `api/revenue` **실제** 호출 (현재는 시뮬레이션만).
- 결제/구독 이벤트와 USDC 단위 매핑.
- AI-Talk 앱 내 지갑·수익 리포팅·RAG 연동 (로드맵 Phase 4).

### 3.2 UI/UX 미완 정리

- `help-guide.tsx`: "Bond Market" → "Growth Market", 설명 문구 춘심/Revenue Share 기준으로 수정.
- `investment-list.tsx`: 빈 상태 문구 "Bond Market" → "Growth Market".
- 레거시 이미지·태국 대출 관련 카피 제거 및 춘심 톤 통일.
- AI Guide 텍스트 IP RWA·춘심 전용으로 최종 점검.

### 3.3 기술 부채

- Phase 4 보고서 기준: Tool Calling(온체인 조회) API 호환성 이슈로 비활성화, V2 시 재도입 예정.
- ESLint/타입 경고 등 Minor Technical Debt는 차기 버전 개선으로 이관.

상세 할 일 목록은 **`docs/archive/roadmap/03_CHOONSIM_TODO_BY_PERSPECTIVE.md`** 를 참고합니다.

---

## 4. 새로 시작할 것 (리뉴얼 이후 기준)

리뉴얼 이후 작업은 **다음 원칙**을 기준으로 합니다.

1. **문서 우선**: 새 기능·변경은 `docs/core/`, `docs/roadmap/`, `docs/features/` 등에 정의 후 구현.
2. **현행 문서만 참조**: 리뉴얼 전환 기준은 이 문서(`04_RENEWAL_HANDOVER.md`)와 여기서 참조하는 문서. 기존 Phase 로드맵(`docs/archive/roadmap/02_*`)은 참고용 보존.
3. **문서 정리 완료 후 개발**: `docs/archive/roadmap/05_DOCUMENT_REORGANIZATION_PLAN.md`, `docs/archive/roadmap/06_DOCUMENT_CLEANUP_CHECKLIST.md`에 따라 문서 이동·정리 후 새 작업 착수 권장.

구체적인 새 로드맵·KPI·일정은 리뉴얼 기획에 따라 별도 문서로 추가합니다.

---

## 5. 참조 문서 목록 (현행 기준)

| 구분 | 문서 | 용도 |
|------|------|------|
| 전환 기준 | `04_RENEWAL_HANDOVER.md` (본 문서) | 일단락·새 시작 기준 |
| 할 일 정리 | `docs/archive/roadmap/03_CHOONSIM_TODO_BY_PERSPECTIVE.md` | 미완·보류 항목 상세 |
| 문서 재정리 계획 | `docs/archive/roadmap/05_DOCUMENT_REORGANIZATION_PLAN.md` | 문서 이동·이름 변경 |
| 문서 정리 실행 | `docs/archive/roadmap/06_DOCUMENT_CLEANUP_CHECKLIST.md` | 정리 작업 체크리스트 |
| 참고(보존) | `docs/archive/roadmap/02_BOND-BASE_CHOONSIM_ROADMAP.md` | Phase 1~4 참고용 |

---

**작성일**: 2026-01-29  
**문서 종류**: 리뉴얼 전환(Handover) 및 일단락 기준
