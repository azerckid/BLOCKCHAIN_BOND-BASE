# 데모 시뮬레이션 구현 검토 (Demo Simulation Implementation Review)

> 검토 기준: [10_DEMO_SIMULATION_SPEC.md](../03_Specs/10_DEMO_SIMULATION_SPEC.md), [03_DEMO_SIMULATION_IMPL.md](./03_DEMO_SIMULATION_IMPL.md)  
> 검토일: 2026-01-23

---

## 1. 요약

| 구분 | 상태 | 비고 |
|------|------|------|
| 스펙 대비 구현 충족도 | 충족 | 컨트롤, Feed, Leaderboard, 시딩, Reset, 격리 설계 일치 |
| 구현 문서와 코드 정합성 | 일부 불일치 | seed-demo.ts의 app/ import 방식만 문서와 상이 |
| 누락/개선 권장 | 2건 | Reset 후 Feed 복원, 데모 진입점(네비) |

---

## 2. 스펙 대비 구현 점검

### 2.1 데이터 격리 및 시딩

| 스펙 항목 | 구현 위치 | 결과 |
|-----------|-----------|------|
| bonds `id LIKE 'demo-%'` | demo-seed.server.ts, seed-demo.ts | O — `demo-bond-choonsim`, `demo-bond-rina` |
| investors `id IN ('demo-inv-01' … 'demo-inv-20')`, `userId = null` | 동일 | O |
| investments `id LIKE 'demo-investment-%'` | 동일 | O |
| yieldDistributions `investorId` demo 또는 `id LIKE 'demo-yield-%'` | 동일 | O |
| onConflictDoNothing() 중복 보호 | demo-seed.server.ts, seed-demo.ts | O |
| Reset 역순 삭제 (yield → investments → investors → bonds) | api.demo.ts resetDemo() | O |

### 2.2 Mock 투자자 20명

| 스펙 항목 | 구현 위치 | 결과 |
|-----------|-----------|------|
| 지역·이름 (일본 7, 남미 5, 한국 4, 글로벌 4) | demo-investors.ts | O |
| 지갑 주소 42자, `0xDEMO…` prefix | demo-investors.ts | O (0x + 40자 = 42자) |
| DB ID `demo-inv-01` ~ `demo-inv-20` | 동일 | O |
| 이름은 DB가 아닌 상수 매핑 (wallet/id → name) | demo-investors.ts WALLET_TO_NAME, ID_TO_NAME | O |

### 2.3 채권·투자·Yield

| 스펙 항목 | 구현 위치 | 결과 |
|-----------|-----------|------|
| 채권 2개 (ChoonSim 101, Rina 102) | demo-seed DEMO_BONDS | O |
| 투자 금액 $2,000 ~ $25,000, 12단계 | INVESTMENT_AMOUNTS | O |
| 짝수 인덱스 2개 채권, 홀수 1개 | hasTwoBonds = i % 2 === 0 | O |
| APR 18.5%, 일할 floor(total × 0.185/365) | DAILY_RATE, Math.floor(totalUsdc * DAILY_RATE) | O |
| 30일치 히스토리, 하루 2~4건 | 30일 루프, eventsPerDay = 2 + rand*3 | O |
| tick 시 ID `demo-yield-live-{uuid}` | api.demo.ts tickDemo() | O |
| LCG seed=42 결정론적 | makeSeedRandom(42) | O |

### 2.4 데모 페이지 UI/동작

| 스펙 항목 | 구현 위치 | 결과 |
|-----------|-----------|------|
| Start / Pause / Reset 버튼 | demo.tsx | O |
| Start 시 2.5초 주기 tick | setInterval(…, 2500) | O |
| Live Activity Feed 최대 50건, 최신 상단 | slice(0, 50), [event, ...prev] | O |
| 신규 항목 slide-in 애니메이션 | @keyframes slideIn, .animate-slide-in | O |
| Feed 표시: 투자자 이름, 채권명, yield 금액, 시각 | BOND_LABELS, formatUsdc, formatTime | O |
| Live Leaderboard 상위 20명, total yield 내림차순 | loader groupBy investorId, orderBy sum(yieldAmount) desc, limit 20 | O |
| 1~3위 다크 배경 + yellow 배지 | rank <= 3 → bg-neutral-900, text-yellow-400 | O |
| SSR loader로 초기 데이터 조회 | loader에서 leaderboard, recentEvents | O |
| tick마다 useRevalidator로 갱신 | revalidate() in useEffect on fetcher.data | O |
| How It Works 3단계 (Invest, IP Revenue, Earn Yield) | demo.tsx 하단 카드 | O |

### 2.5 API

| 스펙/문서 항목 | 구현 위치 | 결과 |
|----------------|-----------|------|
| POST /api/demo body { action: "tick" \| "reset" } | api.demo.ts action(), bodySchema | O |
| tick: 랜덤 1명, yield 1건 삽입 후 이벤트 반환 | tickDemo() | O |
| reset: demo 삭제 후 seedDemo() 호출 | resetDemo() | O |
| Zod discriminatedUnion 검증 | bodySchema | O |
| JSON 파싱 실패 400, 투자 없음 404, 기타 500 | action() try/catch, jsonRes | O |

---

## 3. 구현 문서(03_DEMO_SIMULATION_IMPL.md)와 코드 차이

| 문서 내용 | 실제 코드 | 비고 |
|-----------|-----------|------|
| "scripts/seed-demo.ts는 … app/ 내부 모듈 import 없이 자체 구현" | seed-demo.ts에서 `../app/db/schema.js`, `../app/lib/demo-investors.js` import | 코드는 app/의 schema·DEMO_INVESTORS를 재사용. 문서는 “독립 복사”로 기술되어 있어 불일치. 구현 선택은 합리적(중복 제거). |

**권장**: `03_DEMO_SIMULATION_IMPL.md`의 "3.3 scripts/seed-demo.ts"를 실제처럼 수정.  
예: "schema 및 DEMO_INVESTORS는 app/에서 import. 로직은 demo-seed.server.ts와 동일하게 시딩만 수행."

---

## 4. 누락·개선 권장 사항

### 4.1 Reset 후 Feed 복원 (선택)

- **현상**: Reset 시 `setFeed([])`만 하고, 재시딩 후 loader의 `recentEvents`로 Feed를 다시 채우지 않음.
- **결과**: Reset 후 Leaderboard는 revalidate로 갱신되지만, Feed는 빈 상태로 유지됨.
- **권장**: Reset 응답 수신 후(예: `fetcher.data?.ok === true`) revalidate가 끝난 뒤, `recentEvents`를 Feed 초기값으로 한 번 설정하거나, "Reset 완료 후 최근 10건을 다시 보여준다"는 요구가 있으면 해당 동작을 명시 후 구현.

### 4.2 데모 페이지 진입점

- **현상**: `/demo` 라우트는 등록되어 있으나, `dashboard-layout.tsx`의 사이드 네비게이션에는 "Demo" 항목이 없음.
- **결과**: URL 직접 입력(`/demo`)으로만 접근 가능.
- **권장**: 시연/QA용으로만 쓸 경우 현재도 무방. 데모를 일반 사용자에게 노출하려면 네비에 "Live Demo" 등 링크 추가 검토.

---

## 5. 스키마·Reset 삭제 순서

- `yieldDistributions.bondId`는 `bonds.id` FK로, 값은 `demo-bond-choonsim`, `demo-bond-rina`.
- resetDemo()는 (1) `investorId IN (demo-inv-*)` 로 yield 삭제 후 (2) `bondId LIKE 'demo-%'` 로 한 번 더 삭제.
- (1)으로 이미 모든 데모 투자자 yield가 제거되며, (2)는 혹시 모를 다른 investorId의 demo bond 참조를 정리하는 안전장치로 적절함.

---

## 6. Phase-Exit QA 검증 기준 대비

| 항목 | 확인 |
|------|------|
| 시딩 스크립트 에러 없이 완료, 중복 실행 safe | onConflictDoNothing, seed-demo.ts 독립 실행 가능 |
| /demo 초기 로드 시 20명 leaderboard + 최근 10건 feed | loader limit 20, limit 10, useState 초기값 recentEvents |
| Start 후 2.5초 새 feed 이벤트, leaderboard 갱신 | setInterval 2500, tick 응답 시 feed 갱신 + revalidate |
| Reset 시 데이터 초기화 + 재시딩 완료 메시지 | resetDemo() 역순 삭제 후 seedDemo(), 응답 message |
| 실제 유저 데이터 오염 없음 | demo- prefix 및 demo-inv-* id로만 조회·삭제 |

---

## 7. 결론

- **10_DEMO_SIMULATION_SPEC.md**와 **03_DEMO_SIMULATION_IMPL.md**에 적힌 기능·데이터 설계는 현재 코드로 대부분 충족됨.
- **문서 수정 권장**: `03_DEMO_SIMULATION_IMPL.md`에서 seed-demo.ts가 app/을 import한다는 점을 반영.
- **선택 개선**: Reset 후 Feed를 `recentEvents`로 복원할지 여부, 데모 링크를 네비에 넣을지 여부를 요구사항에 따라 결정하면 됨.
