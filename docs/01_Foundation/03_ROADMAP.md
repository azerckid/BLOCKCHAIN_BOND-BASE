# 실제 작업 구현 로드맵 (Roadmap)
> Created: 2026-02-01 16:20
> Last Updated: 2026-02-09 03:53

본 문서는 **춘심톡 연동**과 **현재 프로젝트 UI/UX 업데이트** 두 가지 작업을 진행할 때 **실제 구현의 기준**이 되는 로드맵 문서입니다.

## 1. 문서 사용 방법
- **작업 전**: 본 문서에서 해당 관점(춘심 연동 / UI/UX)의 구현 계획을 확인하고, 순서와 완료 기준을 파악합니다.
- **작업 중**: 파일 경로·변경 내용·완료 기준을 따라 수정 후, 해당 항목 체크리스트를 완료 처리합니다.
- **검수**: 본 문서의 체크리스트와 "완료 기준"이 모두 충족되었는지 확인합니다.

---

## 2. Part A: 춘심톡 연동 구현 계획

### A.1 현재 상태
| 항목 | 상태 | 비고 |
|------|------|------|
| BondBase 수익 수집 API | 구현됨 | `frontend/app/routes/api.revenue.ts` |
| API Key 인증 | 구현됨 | `CHOONSIM_API_KEY` Bearer Token |
| DB·오라클 봇 | 구현됨 | Turso, `scripts/oracle-bot.js` |

### A.2 구현 작업
| # | 작업 내용 | 담당/위치 | 완료 기준 | 완료 |
|---|-----------|-----------|-----------|------|
| A-1 | 춘심톡 백엔드에 BondBase `api/revenue` 호출 모듈 추가 | 춘심톡 서버 | 환경변수 설정 후 `POST /api/revenue` 호출 가능 | [ ] |
| A-2 | 실제 결제 이벤트 → REVENUE 전송 플로우 설계 | [Specs](../03_Specs/02_REVENUE_BRIDGE_SPEC.md) | 플로우 다이어그램 및 페이로드 명시 | [ ] |
| A-3 | 결제 금액과 USDC 단위 매핑 정의 | [Specs](../03_Specs/02_REVENUE_BRIDGE_SPEC.md) | 통화 매핑 로직 코드/문서화 | [ ] |
| A-4 | 웹훅 보안: 서명 검증 | BondBase | 호출 출처 검증 방식 반영 | [ ] |
| A-5 | 앱–웹 연동 방식 결정 | [Logic](../04_Logic/00_BACKLOG.md) | WebView / 미니앱 방식 확정 | [ ] |

---

## 3. Part B: UI/UX 업데이트 구현 계획

### B.1 이미 반영된 부분
- 사이드바 "Growth Market", "Fandom Impact"
- "Growth Market" 페이지 타이틀
- "Fandom Impact" 맵 타이틀 및 글로벌 뱃지
- AI 안내 링크 및 홈 페이지 테마 문구

### B.2 구현 작업 (전수 점검 완료)
- [x] Help Guide 명칭 "Growth Market"으로 통일
- [x] Help Guide 내 춘심 RWA 중심 문구 수정
- [x] Portfolio 빈 상태 문구 수정
- [x] "Bond Market" 문자열 전수 교체 (knowledge.json 제외)
- [x] Loan/Borrower/Repayment → Subscription/IP Owner/Revenue Share 교체
- [x] 레거시 태국 이미지 제거 확인
- [x] AI Guide 춘심 맥락 업데이트
- [x] Faucet 및 설정 페이지 문구 점검

---

## 4. 마스터 체크리스트
- [ ] Part A: 춘심 연동 완료 (A-1 ~ A-5)
- [x] Part B: UI/UX 브랜딩 정규화 완료 (2026-02-01 검증 완료)

---

## X. Related Documents
- **Foundation**: [Project Overview](./00_PROJECT_OVERVIEW.md) - 프로젝트 비전 명세
- **Foundation**: [Branding Plan](./02_BRANDING_PLAN.md) - UI 용어 및 정규화 전략
- **Foundation**: [Integration Plan](./01_INTEGRATION_PLAN.md) - 춘심 연동 기획 원칙
- **Specs**: [Revenue Bridge Spec](../03_Specs/02_REVENUE_BRIDGE_SPEC.md) - 수익 연동 상세 기술 명세
- **Logic**: [Backlog](../04_Logic/00_BACKLOG.md) - 전체 작업 현황 관리
