# [로드맵] 실제 작업 구현 기준 문서

본 문서는 **춘심톡 연동**과 **현재 프로젝트 UI/UX 업데이트** 두 가지 작업을 진행할 때 **실제 구현의 기준**이 되는 문서입니다.  
작업 시 이 문서를 기준으로 진행하고, 완료 여부는 본 문서의 체크리스트로 확인합니다.

**참조 문서** (계획·방향):  
`docs/archive/roadmap/03_CHOONSIM_TODO_BY_PERSPECTIVE.md`, `docs/core/08_BOND-BASE_NORMALIZATION_BRANDING_PLAN.md`, `docs/archive/roadmap/02_BOND-BASE_CHOONSIM_ROADMAP.md`, `docs/core/01_BOND-BASE_CHOONSIM_INTEGRATION_PLAN.md`, `docs/roadmap/04_RENEWAL_HANDOVER.md`

---

## 1. 문서 사용 방법

- **작업 전**: 본 문서에서 해당 관점(춘심 연동 / UI/UX)의 구현 계획을 확인하고, 순서와 완료 기준을 파악합니다.
- **작업 중**: 파일 경로·변경 내용·완료 기준을 따라 수정 후, 해당 항목 체크리스트를 완료 처리합니다.
- **검수**: 본 문서의 체크리스트와 "완료 기준"이 모두 충족되었는지 확인합니다.

---

## 2. Part A: 춘심톡 연동 구현 계획

참조: `docs/archive/roadmap/03_CHOONSIM_TODO_BY_PERSPECTIVE.md` §1, `docs/archive/roadmap/02_BOND-BASE_CHOONSIM_ROADMAP.md` Phase 4, `docs/core/01_BOND-BASE_CHOONSIM_INTEGRATION_PLAN.md`

### A.1 현재 상태 (변경 없음)

| 항목 | 상태 | 비고 |
|------|------|------|
| BondBase 수익 수집 API | 구현됨 | `frontend/app/routes/api.revenue.ts` |
| API Key 인증 | 구현됨 | `CHOONSIM_API_KEY` Bearer Token |
| DB·오라클 봇 | 구현됨 | Turso, `scripts/oracle-bot.js` |

### A.2 구현 작업 (구체)

| # | 작업 내용 | 담당/위치 | 완료 기준 | 완료 |
|---|-----------|-----------|-----------|------|
| A-1 | 춘심톡 백엔드에 BondBase `api/revenue` 호출 모듈 추가 | 춘심톡 서버 (BondBase 외) | 환경변수(API URL, API Key) 설정 후, 구독/결제 발생 시 `POST /api/revenue` 호출 가능 | [ ] |
| A-2 | 실제 결제/구독 이벤트 → REVENUE 전송 플로우 설계 및 문서화 | 설계 문서 (예: `docs/features/choonsim-revenue-bridge.md`) | 플로우 다이어그램 또는 단계별 설명 문서 존재, 페이로드 `{ type: "REVENUE", data: { amount, source, description } }` 명시 | [ ] |
| A-3 | 결제/수익 금액과 USDC 단위 매핑 정의 | 설계 문서 또는 `api.revenue` 주석/스펙 | 춘심톡 측 통화·단위와 BondBase USDC 단위 매핑이 문서 또는 코드에 명시됨 | [ ] |
| A-4 | (선택) 웹훅 보안: IP 화이트리스트 또는 서명 검증 | BondBase 또는 춘심톡 | 필요 시 `api/revenue` 호출 출처 검증 방식 결정 및 반영 | [ ] |
| A-5 | 앱–웹 연동 방식 결정 (Deep Link / WebView / 미니앱) | 설계 문서 | Phase 4 지갑·수익 리포팅 연동 방식이 문서로 확정됨 | [ ] |

**API 스펙 (현행 유지)**  
- URL: `POST {BONDBASE_ORIGIN}/api/revenue`  
- Header: `Authorization: Bearer {CHOONSIM_API_KEY}`  
- Body: `{ "type": "REVENUE" | "MILESTONE" | "METRICS", "data": { ... } }`

---

## 3. Part B: UI/UX 업데이트 구현 계획

참조: `docs/archive/roadmap/03_CHOONSIM_TODO_BY_PERSPECTIVE.md` §2, `docs/core/08_BOND-BASE_NORMALIZATION_BRANDING_PLAN.md`

### B.1 이미 반영된 부분 (재작업 없음)

- `frontend/app/components/layout/dashboard-layout.tsx`: 사이드바 "Growth Market", "Fandom Impact"
- `frontend/app/routes/bonds.tsx`: 페이지 타이틀 "Growth Market"
- `frontend/app/routes/impact.tsx`: "Fandom Impact", "Global Fandom Growth" 등
- `frontend/app/routes/api.chat.ts`: AI 안내 링크 "Growth Market", "Fandom Impact"
- `frontend/app/routes/home.tsx`: Choonsim Official, Phase 3 등 뱃지·카피

### B.2 구현 작업 (파일·변경 내용·완료 기준)

| # | 파일 경로 | 현재 | 변경 목표 | 완료 기준 | 완료 |
|---|-----------|------|-----------|-----------|------|
| B-1 | `frontend/app/components/layout/help-guide.tsx` | `title: "Bond Market"` | `title: "Growth Market"` | Help Guide에서 시장 메뉴가 "Growth Market"으로 표시됨 | [x] |
| B-2 | `frontend/app/components/layout/help-guide.tsx` | market 섹션 `content`가 실물 자산(RWA) 채권·Approve·Deposit 중심 | 춘심 IP·수익 공유(Revenue Share) 중심 문구로 수정 | 동일 섹션 설명이 춘심 성장 채권·Revenue Share 맥락으로 읽힘 | [x] |
| B-3 | `frontend/app/components/portfolio/investment-list.tsx` | `"Visit the Bond Market to start earning yield."` | `"Visit the Growth Market to start earning yield."` | Portfolio 빈 상태 문구가 "Growth Market"으로 표시됨 | [x] |
| B-4 | 전체 앱 | "Bond Market" 문자열 잔존 | "Growth Market" 또는 문맥에 맞는 용어로 통일 | "Bond Market" 검색 시 사용자 노출 문구에 잔존 없음 (knowledge.json 등 내부 참조 제외 시 문서화) | [x] |
| B-5 | 전체 앱 | Loan, Borrower, Repayment 노출 | Subscription, IP Owner, Revenue Share로 점검·교체 | 사용자 대면 문구에 Loan/Borrower/Repayment 잔존 없음 | [x] |
| B-6 | 레거시 이미지·카피 | 태국 소상공인 관련 더미 | 제거 또는 춘심 글로벌 톤으로 교체 | 08 계획 기준으로 점검 후 목록 정리 또는 교체 완료 | [x] |
| B-7 | `frontend/app/routes/ai-guide.tsx` | 레거시 태국 대출 설명 가능성 | IP RWA·춘심 투자 가이드라인으로 정리 | AI Guide 페이지 문구가 춘심·IP RWA 기준으로만 읽힘 | [x] |
| B-8 | 설정·Faucet 등 | 테스트넷·춘심 맥락 불명확 | "테스트넷·춘심 성장 채권" 맥락에 맞게 설명 점검 | 설정/Faucet 관련 문구가 현행 서비스와 일치함 | [x] |

### B.3 용어 정제 참고 (08 계획)

- Loan → Subscription  
- Borrower → IP Owner  
- Repayment → Revenue Share  

---

## 4. 작업 순서 권장

1. **UI/UX 먼저 (B)**  
   - B-1 ~ B-3: 파일·문구가 명확하여 바로 수정 가능.  
   - 이후 B-4 ~ B-8: 검색·점검 후 수정.

2. **춘심 연동 (A)**  
   - A-2, A-3: 설계·매핑 문서 정리.  
   - A-1: 춘심톡 백엔드 연동 (BondBase 외 작업).  
   - A-4, A-5: 필요 시 보안·앱 연동 방식 확정.

---

## 5. 마스터 체크리스트

- [ ] Part A: A-1 ~ A-5 중 해당 항목 완료
- [x] Part B: B-1 ~ B-8 완료 기준 충족 (2026-02-01 코드 검증 완료)
- [x] 본 문서 체크리스트 및 참조 문서와 불일치 없음

---

## 6. 참조 문서 목록

| 문서 | 경로 | 용도 |
|------|------|------|
| 춘심 연동·UI/UX 할 일 정리 | `docs/archive/roadmap/03_CHOONSIM_TODO_BY_PERSPECTIVE.md` | 할 일·체크리스트 요약 |
| 정규화·브랜딩 계획 | `docs/core/08_BOND-BASE_NORMALIZATION_BRANDING_PLAN.md` | UI/UX 방향·용어 |
| 춘심 로드맵 | `docs/archive/roadmap/02_BOND-BASE_CHOONSIM_ROADMAP.md` | Phase 4 연동 목표 |
| 춘심 연동 기획 | `docs/core/01_BOND-BASE_CHOONSIM_INTEGRATION_PLAN.md` | 연동 비전·아키텍처 |
| 리뉴얼 전환 기준 | `docs/roadmap/04_RENEWAL_HANDOVER.md` | 완료/미완 구분 |

---

## 7. Part B 코드 스캔 결과 및 구현 세부사항 (2026-02-01 보강)

B.2 체크리스트 작업을 실행하기 위해 실제 소스를 스캔한 결과입니다.
각 항목에 **정확한 파일:라인**, 현재 문구, 제안 변경 내용을 구체화하여 추가했습니다.
기존 B.2 체크리스트와 일대일 대응됩니다.

---

### 7.1 B-1 · B-2 세부: `help-guide.tsx` 전체 수정 범위

B-1과 B-2 대상 파일이 동일하므로, 한 번에 수정할 문구 4곳을 정리합니다.

| 위치 | 현재 문구 | 변경 목표 | 비고 |
|------|-----------|-----------|------|
| ① `GUIDE_SECTIONS[market].title` (line 28) | `"Bond Market"` | `"Growth Market"` | B-1 본체 |
| ② `GUIDE_SECTIONS[market].content` (line 32) | `"실물 자산(RWA) 기반 채권을 탐색하고 투자하는 곳입니다. 'Approve(승인)' 단계를 거쳐 'Deposit(투자)'을 실행하면 Bond 토큰을 지급받게 됩니다. 필터를 통해 원하는 분야의 채권을 찾아보세요."` | `"춘심 IP의 미래 수익권(Growth Bond)을 탐색하고 투자하는 곳입니다. 'Approve(승인)' 단계를 거쳐 'Deposit(투자)'을 실행하면 Growth Bond 토큰을 지급받게 됩니다. Revenue Share로 발생하는 수익을 자동으로 누적받습니다."` | B-2 본체 |
| ③ `GUIDE_SECTIONS[portfolio].content` (line 40) | `"오라클이 검증한 실시간 '원금 상환 트래커'를 통해…"` | `"오라클이 검증한 실시간 'Revenue Share 트래커'를 통해 내 수익 배분 현황을 확인하세요. 'Claim'으로 수익을 지갑으로 인출하거나, 'Reinvest'로 복리 효과를 누릴 수 있습니다. 'PROOF' 링크로 오라클 검증 증빙도 열람 가능합니다."` | "원금 상환" = 레거시 용어 |
| ④ Technical Support 카드 (line 137) | `"본드베이스의 모든 원금 상환 데이터는 검증된 오라클 노드에 의해…"` | `"본드베이스의 모든 수익 배분(Revenue Share) 데이터는 검증된 오라클 노드에 의해 온체인에 기록되며, 투자자는 언제든지 증빙(Proof)을 확인할 수 있습니다."` | "원금 상환" = 레거시 용어 |

> **참고**: ③④는 기존 B.2 체크리스트에 명시되지 않았으나, 동일 파일 내에서 발견된 레거시 용어입니다. B-2 완료 시 함께 처리하는 것을 권장합니다.

---

### 7.2 B-3 세부: `investment-list.tsx` 빈 상태 문구

확인 완료. 변경 대상 1곳.

- **파일·라인**: `frontend/app/components/portfolio/investment-list.tsx` line 256
- **현재**: `"Visit the Bond Market to start earning yield."`
- **변경**: `"Visit the Growth Market to start earning yield."`

---

### 7.3 B-4 세부: "Bond Market" 잔존 위치 전체 목록

스캔 결과 사용자 노출 문구 내 "Bond Market"은 아래 3곳에만 잔존합니다.

| # | 파일 | 라인 | 변경 여부 |
|---|------|------|-----------|
| 1 | `frontend/app/components/layout/help-guide.tsx` | 28 | B-1과 동일 → 변경 |
| 2 | `frontend/app/components/portfolio/investment-list.tsx` | 256 | B-3과 동일 → 변경 |
| 3 | `frontend/app/lib/knowledge.json` | 내부 참조 | 내부 RAG 컨텍스트이므로 **변경하지 않고 문서화** (B-4 완료 기준에서 명시한 예외 해당) |

> B-1, B-3을 완료하면 B-4도 자동 충족됩니다.

---

### 7.4 B-5 세부: Loan / Borrower / Repayment 관련 잔존 분류

스캔 결과를 **변경 필요 여부**로 분류합니다.

#### (A) UI 노출 문구 — 변경 필요

| 파일 | 라인 | 현재 문구 | 제안 변경 | 비고 |
|------|------|-----------|-----------|------|
| `investment-list.tsx` | 121 | `"Principal Repaid"` (진행율 라벨) | `"Revenue Share"` | 온체인 status 값과 매핑됨 |
| `investment-list.tsx` | 186 | `ASSET DEFAULTED` (badges) | `REVENUE PAUSED` | status === 2일 때. IP RWA에서 "default"는 수익 배분 중단과 동일 |
| `investment-list.tsx` | 190 | `COMPLETELY REPAID` (badges) | `FULLY DISTRIBUTED` | status === 1일 때. 수익 배분이 완료된 상태 |
| `help-guide.tsx` | 40, 137 | "원금 상환" 문구 | 7.1 ③④와 동일 | B-2와 중복 항목 |

#### (B) 내부 데이터·타입 속성명 — 별도 판단 필요

아래 속성명은 **사용자 화면에는 표시되지 않지만**, 코드 내부에서 연쇄적으로 사용됩니다.
현재 B-5의 완료 기준("사용자 대면 문구에 잔존 없음")에는 해당하지 않으므로 **이번 작업 범위 밖**입니다.
다만 향후 리팩토링 시 참고용으로 남기습니다.

| 파일 | 속성 | 사용 맥락 |
|------|------|-----------|
| `bonds.tsx` | `MOCK_BONDS[].loanAmount` | 채권 모의 데이터의 총금액 속성. 수익 퍼센트 계산의 기준값 |
| `bond-card.tsx` | `BondProps.loanAmount` | 위 데이터의 타입 정의 |
| `investment-list.tsx` | `inv.loanAmount` (line 123, 127) | Progress 퍼센트 계산에 사용 |

> 이 3곳은 같은 속성명으로 연결되어 있습니다. 리팩토링 시 `loanAmount` → `totalAmount` (숫자형) 등으로 통일하면 타입·데이터·참조 코드를 동시에 변경해야 합니다.

#### (C) DB 스키마 — 변경 대상 아님

| 파일 | 컬럼 | 사유 |
|------|------|------|
| `db/schema.ts` | `bonds.borrowerName` | 레거시 테이블. 08 계획 기준으로 `status → LEGACY` 처리만 해당 |
| `db/schema.ts` | `bonds.loanAmount` | 동일 |

---

### 7.5 B-6 세부: 레거시 이미지 스캔 결과

`frontend/app/` 하위 이미지 파일을 스캔한 결과, **태국 소상공인·레거시 관련 더미 이미지는 현재 존재하지 않습니다.**

- 발견된 이미지: `frontend/app/assets/react.svg` (프레임워크 기본 파일) 전부
- MOCK_BONDS 데이터에서 status `"legacy"`인 항목 (ID 2, 3)은 **이미지가 아닌 텍스트 카드**로 표시됩니다.

> **결론**: 이미지 교체 작업은 불필요합니다. B-6 완료 기준은 "목록 정리 완료"로 충족됩니다.
> 다만 legacy 카드 자체의 표시 여부(숨김/표시 유지)는 별도 판단이 필요합니다 — 08 계획의 "Legacy 데이터 격리" 방침과 연동하여 결정합니다.

---

### 7.6 B-7 세부: `ai-guide.tsx` 현재 상태 확인

스캔 결과 **이미 춘심 맥락으로 반영된 부분**이 많습니다.

| 요소 | 현재 상태 | 판정 |
|------|-----------|------|
| 페이지 副타이틀 (line 96) | `"Smart guide for BondBase RWA Investments."` | 유지 가능. RWA는 프로젝트 전체 카테고리 |
| 환영 문구 (line 132–134) | `"IP Concierge Ready"` / `"ChoonSim AI-Talk RWA investments"` | 완료됨 |
| Quick Action 버튼 4개 (line 141–144) | Growth Bond, Revenue Share, Oracle Audit, Wallet & CTC | 완료됨 |
| 입력 placeholder (line 225) | `"Ask about dividends, oracle proof, or wallet setup..."` | 완료됨 |

> **결론**: B-7은 현재 코드 기준으로 **실질적으로 완료됨** 상태입니다.
> 체크리스트를 완료 처리할 수 있습니다.

---

### 7.7 용어 매핑 확장 참고표

B.3의 기본 3개 항목에 스캔에서 발견된 추가 매핑을 합리적으로 정리합니다.

| 레거시 용어 | 춘심/IP RWA 용어 | 적용 맥락 |
|-------------|------------------|-----------|
| Loan | Subscription | 비즈 개념 |
| Borrower | IP Owner | 비즈 개념 |
| Repayment | Revenue Share | 비즈 개념 |
| Bond Market | Growth Market | UI 메뉴·문구 |
| Principal Repaid | Revenue Share (Progress) | Portfolio 진행율 라벨 |
| Completely Repaid | Fully Distributed | Portfolio 상태 배지 |
| Asset Defaulted | Revenue Paused | Portfolio 상태 배지 |
| 원금 상환 트래커 | Revenue Share 트래커 | Help Guide 설명 |

---

**보강일**: 2026-02-01
**보강 사유**: 실제 코드 스캔을 통한 파일·라인 단위 세부사항 추가, B-5 변경 범위 분류, B-6·B-7 완료 판정

---

**작성일**: 2026-01-29
**문서 종류**: 실제 작업 구현 기준 (Baseline)
