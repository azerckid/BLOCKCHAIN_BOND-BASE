# [로드맵] 춘심 연동 및 UI/UX 관점별 해야 할 것 정리

본 문서는 작성된 문서(`docs/roadmap`, `docs/core`, `docs/reports`)와 이미 구현된 코드를 기준으로, **두 가지 관점**에서 해야 할 것들을 정리합니다.

- **첫째**: 춘심톡과 실제 연결 (결제, 수익 연동 등)
- **둘째**: 현재 페이지 UI/UX 업데이트

---

## 1. 춘심톡과 실제 연결 (결제, 수익 연동 등)

### 1.1 현재 구현 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| 수익 수집 API (Bridge) | 구현됨 | `api/revenue` – REVENUE, MILESTONE, METRICS 수신 |
| API Key 인증 | 구현됨 | `CHOONSIM_API_KEY` Bearer Token |
| DB 저장 (choonsim_revenue 등) | 구현됨 | Turso, Drizzle |
| 오라클 봇 (DB → 온체인) | 구현됨 | `scripts/oracle-bot.js` 로컬 실행 |
| 춘심톡 → BondBase 실제 연동 | 미구현 | 현재는 `simulate-integration.cjs`로 시뮬레이션만 |

### 1.2 해야 할 것 (로드맵 Phase 4 기준)

로드맵 `02_BOND-BASE_CHOONSIM_ROADMAP.md` Phase 4 및 `01_BOND-BASE_CHOONSIM_INTEGRATION_PLAN.md` 기준:

1. **춘심 AI-Talk 백엔드 연동**
   - 춘심톡 서버에서 **실제 구독/결제 발생 시** BondBase `api/revenue`로 REVENUE 이벤트 전송
   - 웹훅 또는 스케줄 배치로 `POST /api/revenue` 호출, `CHOONSIM_API_KEY`로 인증
   - 페이로드 규격: `{ type: "REVENUE", data: { amount, source, description } }` (현재 API 스펙 유지)

2. **결제/수익 데이터 일치**
   - 춘심톡 내부 결제 시스템(스토어, 구독)과 금액/단위(USDC 기준) 매핑 정의
   - 필요 시 `api/revenue`에 원화/다른 통화 → USDC 환산 로직 또는 춘심톡 측에서 USDC 단위로 전송

3. **AI-Talk 지갑 연동 (Phase 4)**
   - 춘심 AI-Talk 앱 내 BondBase 지갑 인터페이스 삽입
   - 앱 내에서 투자·수익 확인·클레임 가능하도록 Deep Link 또는 WebView/미니앱 연동

4. **통합 수익 리포팅**
   - 춘심톡에서 투자 수익 실시간 확인 및 클레임 가능한 ‘빨대’ 연동
   - BondBase 포트폴리오/수익 API 노출 또는 전용 연동 API 설계

5. **RAG/지식 연동 (Phase 4)**
   - 춘심 AI에게 BondBase 투자 지식 학습 (이미 `knowledge.json`·AI Guide 존재)
   - 춘심톡 챗에서 BondBase 안내·링크 제공 시 API 또는 지식 베이스 표준화

### 1.3 기술 체크리스트

- [ ] 춘심톡 백엔드에 BondBase `api/revenue` 호출 모듈 추가 (환경변수: API URL, API Key)
- [ ] 실제 결제/구독 이벤트 → REVENUE 전송 플로우 설계 및 검증
- [ ] (선택) 웹훅 보안: IP 화이트리스트 또는 서명 검증
- [ ] 앱–웹 연동 방식 결정 (Deep Link / WebView / 미니앱) 및 BondBase 클라이언트 경로 정의

---

## 2. 현재 페이지 UI/UX 업데이트

### 2.1 문서상 목표 (정규화·브랜딩)

`08_BOND-BASE_NORMALIZATION_BRANDING_PLAN.md`, `02_BOND-BASE_CHOONSIM_ROADMAP.md` 기준:

- 메뉴/용어: Impact Map → **Fandom Impact**, Bond Market → **Growth Market** (일부 반영됨)
- 용어 정제: Loan/Borrower/Repayment → Subscription/IP Owner/Revenue Share
- 시각: 태국 소상공인 관련 더미 이미지 제거, 춘심 글로벌(일본·남미 등) 톤으로 통일

### 2.2 이미 반영된 부분

| 위치 | 내용 |
|------|------|
| `dashboard-layout.tsx` | 사이드바 "Growth Market", "Fandom Impact" 사용 |
| `bonds.tsx` | 페이지 타이틀 "Growth Market" |
| `impact.tsx` | "Fandom Impact", "Global Fandom Growth" 등 |
| `api.chat.ts` | AI 안내 링크 "Growth Market", "Fandom Impact" |
| `home.tsx` | Choonsim Official, Phase 3 등 뱃지·카피 |

### 2.3 아직 통일/업데이트 필요한 부분

1. **Help Guide (`help-guide.tsx`)**
   - `title: "Bond Market"` → **"Growth Market"**으로 변경
   - 설명 문구를 춘심 IP·수익 공유(Revenue Share) 중심으로 수정

2. **Portfolio 빈 상태 문구 (`investment-list.tsx`)**
   - `"Visit the Bond Market to start earning yield."` → **"Visit the Growth Market to start earning yield."** 로 변경

3. **용어 일관성**
   - 전체 앱에서 "Loan", "Borrower", "Repayment" 노출 시 → Subscription, IP Owner, Revenue Share로 점검 및 교체
   - (이미 대부분 춘심 용어로 되어 있으나, 레거시 컴포넌트·도움말·에러 메시지 등 검색 후 정리)

4. **시각 자산**
   - 태국 농민/소상공인 관련 더미 이미지 잔존 여부 확인 후 제거
   - 필요 시 춘심 글로벌 활동(일본·남미·메타버스) 톤의 placeholder 또는 실제 에셋으로 교체

5. **AI Guide 페이지 (`ai-guide.tsx`)**
   - 문구를 IP RWA·춘심 투자 가이드라인으로 완전히 정리 (레거시 태국 대출 설명 제거 여부 확인)

6. **설정/기타**
   - Faucet, 네트워크 전환 등 설명 문구가 "테스트넷·춘심 성장 채권" 맥락과 맞는지 점검

### 2.4 UI/UX 체크리스트

- [ ] `help-guide.tsx`: Bond Market → Growth Market, 설명 문구 춘심/Revenue Share 기준으로 수정
- [ ] `investment-list.tsx`: 빈 상태 문구 "Growth Market"으로 통일
- [ ] 프로젝트 전체 "Bond Market" 문자열 검색 후 Growth Market 또는 문맥에 맞는 용어로 통일
- [ ] 레거시 이미지·카피 검색 후 제거 또는 춘심 톤으로 교체
- [ ] AI Guide 텍스트 IP RWA·춘심 전용으로 최종 점검

---

## 3. 참고 문서

- `docs/roadmap/02_BOND-BASE_CHOONSIM_ROADMAP.md` – Phase 1~4 로드맵
- `docs/core/01_BOND-BASE_CHOONSIM_INTEGRATION_PLAN.md` – 춘심 연동 기획
- `docs/core/08_BOND-BASE_NORMALIZATION_BRANDING_PLAN.md` – 정규화·브랜딩 계획
- `docs/core/09_PHASE-4_AI_INTEGRATION_PLAN.md` – Phase 4 AI·연동 계획
- `docs/reports/04_PHASE_1_COMPLETION_REPORT.md` – Phase 1 완료 (API·DB·대시보드)
- `docs/reports/10_PHASE-4_COMPLETION_REPORT.md` – Phase 4 완료 (AI·QA)

---

**작성일**: 2026-01-29  
**기준**: 문서 및 `frontend/` 구현 코드 검토 결과
