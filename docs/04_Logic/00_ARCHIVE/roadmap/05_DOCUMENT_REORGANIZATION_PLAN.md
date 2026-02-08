# [로드맵] 문서 재정리 계획 (이동·이름 변경)

본 문서는 **리뉴얼 시점**에 `docs/` 내 문서를 어떻게 재정리할지(이동·이름 변경)에 대한 계획을 정의합니다.  
실행 순서는 **`06_DOCUMENT_CLEANUP_CHECKLIST.md`** 의 체크리스트를 따릅니다.

---

## 1. docs/ 디렉터리 구조 (정리 후 목표)

AGENTS.md 및 문서 계층 규칙에 따른 7개 핵심 하위 디렉터리:

| 디렉터리 | 용도 |
|----------|------|
| `docs/core/` | 시스템 전반 설계, DB 스키마, 표준 규칙 |
| `docs/features/` | 개별 기능(결제, AI, 채팅 등) 상세 명세 |
| `docs/roadmap/` | 향후 구현 계획·전략 제안 |
| `docs/reports/` | 과거 검증·테스트·이행 보고서 |
| `docs/guides/` | 개발자·운영자용 실무 가이드·트러블슈팅 |
| `docs/stitch/` | UI/UX 설계·플로우차트 |
| `docs/archive/` | 과거 버전·레거시 문서 보존용 |

---

## 2. 현행 유지 (이동 없음)

리뉴얼 이후에도 **현행 기준**으로 두고 참조하는 문서입니다. 이동하지 않습니다.

### 2.1 docs/roadmap/

| 파일 | 비고 |
|------|------|
| `02_BOND-BASE_CHOONSIM_ROADMAP.md` | 참고용 보존 (Phase 1~4 참고) |
| `03_CHOONSIM_TODO_BY_PERSPECTIVE.md` | 미완·보류 항목 상세 |
| `04_RENEWAL_HANDOVER.md` | 일단락·리뉴얼 전환 기준 |
| `05_DOCUMENT_REORGANIZATION_PLAN.md` | 본 문서 (재정리 계획) |
| `06_DOCUMENT_CLEANUP_CHECKLIST.md` | 정리 실행 체크리스트 |

### 2.2 docs/core/

| 파일 | 비고 |
|------|------|
| `00_PROJECT_OVERVIEW.md` | 프로젝트 개요 |
| `01_BOND-BASE_CHOONSIM_INTEGRATION_PLAN.md` | 춘심 연동 기획 |
| `03_INFRASTRUCTURE_ENVIRONMENT.md` | 인프라·환경 |
| `05_CHOONSIM_AUDIT_DATA_INTEGRITY_DESIGN.md` | 감사·데이터 무결성 설계 |
| `08_BOND-BASE_NORMALIZATION_BRANDING_PLAN.md` | 정규화·브랜딩 계획 |
| `09_PHASE-4_AI_INTEGRATION_PLAN.md` | Phase 4 AI·연동 계획 |

### 2.3 docs/reports/

| 파일 | 비고 |
|------|------|
| `04_PHASE_1_COMPLETION_REPORT.md` | Phase 1 이행 보고 |
| `06_PHASE-2_COMPLETION_REPORT.md` | Phase 2 이행 보고 |
| `07_PHASE-3_COMPLETION_REPORT.md` | Phase 3 이행 보고 |
| `10_PHASE-4_COMPLETION_REPORT.md` | Phase 4 이행 보고 |
| `08_IDEATHON_*`, `09_*`, `10_IDEATHON_*` | 아이디어톤 관련 (보존) |

### 2.4 docs/features/

| 파일 | 비고 |
|------|------|
| `admin-portal-specification.md` | 관리자 포털 명세 |
| `99_IDEATHON_TECHNICAL_ARXIV.md` | 아이디어톤 기술 아카이브 |

### 2.5 docs/stitch/

| 파일 | 비고 |
|------|------|
| `design-brief.md` | 디자인 브리프 |
| `design-resources.md` | 디자인 리소스 |

### 2.6 docs/assets/

| 항목 | 비고 |
|------|------|
| `bondbase_system_architecture_*.png` | 아키텍처 이미지 (유지) |

---

## 3. archive로 이동 (또는 이미 archive인 것 정리)

**과거 단계·레거시**로 분류하여 `docs/archive/` 아래에만 두는 문서입니다.  
이동이 필요한 경우 **대상 경로**를 명시합니다.

### 3.1 이미 docs/archive/ 에 있는 것 (이동 없음)

- `docs/archive/01_*` ~ `docs/archive/18_*` (초기 스캐폴딩, DB, 인증, 대시보드, 스마트컨트랙트 등)
- `docs/archive/legacy_bondbase/` 전부 (오라클, 리스크, 배포, DB 스펙, UI 스펙 등)

→ **추가 이동 없음.** 필요 시 `archive/` 내부만 정리(이름 통일 등).

### 3.2 archive로 이동 권장 (선택)

리뉴얼 후 "참고용으로만 둘" 문서. **현행 작업 기준에서 제외**하고 싶을 때만 이동합니다.

| 현재 위치 | 이동 후 | 비고 |
|-----------|----------|------|
| `docs/roadmap/02_BOND-BASE_CHOONSIM_ROADMAP.md` | (유지 권장) 또는 `docs/archive/roadmap_02_choonsim_roadmap.md` | Phase 1~4 참고용; 현행 기준은 `04_RENEWAL_HANDOVER.md` |
| `docs/plans/gasless_transaction_plan.md` | `docs/archive/plans_gasless_transaction_plan.md` | 미실행 계획이면 archive로 |

→ **기본 권장**: `02_BOND-BASE_CHOONSIM_ROADMAP.md`는 `roadmap/`에 두고 "참고용"만 명시.  
→ `docs/plans/` 는 비어 있거나 레거시 계획만 있으면, 파일만 `docs/archive/plans/` 등으로 옮길 수 있음.

---

## 4. 이름 변경 계획 (선택)

일관성·가독성을 위해 **이름만** 바꾸는 경우입니다. 이동 없음.

| 현재 | 변경 후 | 비고 |
|------|---------|------|
| (없음) | - | 필요 시 체크리스트(`06_*`)에 항목 추가 |

현재 `docs/roadmap/`, `docs/core/` 파일명은 접두어·번호 체계가 있어 추가 변경은 불필요할 수 있음.

---

## 5. 신규 생성 권장 (리뉴얼 이후)

정리 후 새 작업의 **단일 진입점**으로 둘 문서입니다.

| 위치 | 파일명 | 용도 |
|------|--------|------|
| `docs/roadmap/` | `README.md` (선택) | roadmap 폴더 소개, 현행 기준 문서 링크 (예: 04, 05, 06) |
| `docs/` 루트 | `00_CURRENT_STATUS.md` (선택) | 전체 문서 구조 요약, "지금 보는 문서는 여기" 안내 |

→ **선택**이므로 체크리스트에서 "필요 시만" 수행하도록 표시.

---

## 6. 요약

| 구분 | 조치 |
|------|------|
| **현행 유지** | `roadmap/`, `core/`, `reports/`, `features/`, `stitch/`, `assets/` 내 현재 파일 대부분 유지 |
| **archive 이동** | `docs/plans/*` 등 미실행·레거시 계획만 필요 시 `archive/`로 이동 |
| **이름 변경** | 현재는 추가 계획 없음 (필요 시 06 체크리스트에 추가) |
| **신규 생성** | `roadmap/README.md`, `00_CURRENT_STATUS.md` 등은 선택 사항 |

실제 이동·이름 변경 작업은 **`06_DOCUMENT_CLEANUP_CHECKLIST.md`** 에 따라 수행합니다.

---

**작성일**: 2026-01-29  
**문서 종류**: 문서 재정리 계획 (이동·이름 변경)

**보관**: 2026-01-29 roadmap → docs/archive/roadmap/ 이동. 현행 roadmap은 04, 07, README만 유지.
