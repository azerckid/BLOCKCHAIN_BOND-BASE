# 데모 시뮬레이션 구현 문서 (Demo Simulation Implementation)
> Created: 2026-03-05
> Last Updated: 2026-01-23 (게임 의도 반영·구현 원칙 정리)

## 1. 구현 범위 및 게임 의도

기획 문서([03_Specs/10_DEMO_SIMULATION_SPEC.md](../03_Specs/10_DEMO_SIMULATION_SPEC.md))를 기반으로 구현. 기획상 **게임** = 어느 캐릭터(춘심/리나 등 bond)에 얼마를 투자하는가, **랭킹** = 얼마를 벌었는가(총 수익, yield 합계) 기준 (동 스펙 1.2 게임 구조 참조).

### 1.1 구현 시 반드시 지킬 원칙 (게임 의도 정합성)

| 원칙 | 설명 | 위반 시 |
|------|------|---------|
| yield는 고정 APR이 아님 | 투자자 yield = 해당 bond의 **실제 revenue** × (해당 투자자 투자금 / 해당 bond 총 투자금). 고정 18.5% APR 식 사용 금지. | "캐릭터가 벌어들인 만큼만 나눠 받는다"는 게임 구조가 깨짐. |
| 랭킹 지표는 "총 수익" | 데모 Live Leaderboard 및 `/ranking` 모두 **기간 내 yield 합계(총 수익)** 기준. 다른 지표(예: 투자금만)로 순위 매기지 않음. | "얼마를 벌었는가"로 경쟁한다는 의도와 불일치. |
| 캐릭터 = bond | 어느 캐릭터에 투자했는가 = 어느 bond에 투자했는가. bondId 101=춘심, 102=리나 등. | 게임의 선택 단위가 코드/DB와 일치해야 함. |
| 시딩 시 yield 과거 생성 없음 | bonds, investors, investments만 시딩. yieldDistributions는 revenue 유입·tick 분배로만 생성. | "지금부터 쌓아가는" 설계 원칙 위반. |

### 1.2 구현 파일 목록

| 파일 | 역할 | 상태 |
|------|------|------|
| `frontend/app/lib/demo-investors.ts` | 20명 투자자 상수 + wallet→name 매핑. 주소는 `demo-investor-addresses.json`에서 로드 | 완료 |
| `frontend/app/lib/demo-investor-addresses.json` | 20명 지갑 주소 배열 (generate-demo-wallets로 생성, 리포 커밋 가능) | 완료 |
| `frontend/app/lib/demo-seed.server.ts` | 시딩 로직 (api.demo.ts reset 공유) | 완료 |
| `frontend/scripts/seed-demo.ts` | 스탠드얼론 시딩 스크립트 (DB만, 가짜 txHash) | 완료 |
| `frontend/scripts/generate-demo-wallets.ts` | 20개 키페어 생성 → 주소 JSON + `.env.demo.local` (private key, gitignore) | 완료 |
| `frontend/scripts/seed-demo-onchain.ts` | 20명 각각 approve + purchaseBond 실행 후 실제 tx hash로 investments INSERT | 완료 |
| `frontend/scripts/apply-choonsim-migrations.ts` | Turso 등 원격 DB에 `choonsim_projects.bond_id`, `choonsim_revenue.demo_yield_distributed_at` 컬럼 적용 (drizzle push 미사용 시) | 완료 |
| `frontend/app/routes/api.demo.ts` | tick / reset API | 완료 |
| `frontend/app/routes/demo.tsx` | 데모 페이지 (SSR + 클라이언트) | 완료 |
| `frontend/app/routes.ts` | `/demo`, `/api/demo` 라우트 추가 | 완료 |

### 1.3 데모 tick 전제 조건 (DB)

- `choonsim_revenue.demo_yield_distributed_at`, `choonsim_projects.bond_id` 컬럼이 있어야 함.
- 원격 DB(Turso)에 `drizzle-kit push`를 하지 않은 경우: `npm run apply-choonsim-migrations` 실행 후 `npm run update-choonsim-bond-ids`로 프로젝트별 bond_id(101/102) 설정 필요.
- tick 시 분배할 revenue가 있으려면 `choonsim_revenue`에 `demo_yield_distributed_at = null`인 행이 있어야 함 (`seed-demo-revenue` 또는 bondbase-sync로 삽입).

---

## 2. 현재 파이프라인 현황 (2026-03-05 확인)

### 2.1 실제 데이터 흐름 (확인됨)

```
춘심톡 DB (Turso)                      BondBase DB (Turso)
──────────────────────                  ────────────────────
User (mock 50명) ✔                      choonsim_projects
  email: mock-*@test.local               └ bond_id: null ← 문제 ①

ChocoConsumptionLog (102건) ✔           investors (demo-inv-*) ← 미삽입 ②
  chunsim: 49건, 599 CHOCO
  rina:    53건, 625 CHOCO
  isSynced: 전부 false ← 문제 ③

character
  chunsim.bondBaseId: 101 ✔
  rina.bondBaseId:    102 ✔
```

### 2.2 미완료 항목 (수정 필요)

| # | 항목 | 위치 | 필요 작업 |
|---|------|------|-----------|
| ① | `choonsim_projects.bond_id = null` | BondBase DB | 101로 업데이트 |
| ② | mock 투자자 20명 미삽입 | BondBase DB | `seed-demo.ts` 실행 |
| ③ | ChocoConsumptionLog 102건 미전송 | 춘심톡 | `bondbase-sync` 수동 실행 |
| ④ | tick yield 계산이 APR 기반 | `api.demo.ts` | revenue 실 데이터 기반으로 교체 |
| ⑤ | 지갑 주소 non-hex 문자 포함 | `demo-investors.ts` | 유효한 42자 hex로 교체 |
| ⑥ | 춘심톡 Cron 미등록 | 춘심톡 `vercel.json` | mock-grant/activity/bondbase-sync 등록 |

---

## 3. 데이터 설계

### 3.1 춘심톡 → BondBase 수익 흐름 (정상 상태)

```
매일
 ├─ mock-grant Cron
 │     50명 × 3,000 CHOCO 지급
 │
 ├─ mock-activity Cron
 │     50명이 채팅 (토큰 500~2,000 → CHOCO 5~20 차감)
 │     → ChocoConsumptionLog INSERT (isSynced=false)
 │
 └─ bondbase-sync Cron
       isSynced=false 로그 캐릭터별 집계
       → CHOCO 합산 × 0.001 = USDC 환산
       → POST /api/revenue {bondId: 101, type: "REVENUE", amount: ...}
       → BondBase choonsimRevenue 적재
       → isSynced=true 업데이트
```

### 3.2 BondBase 투자자별 yield 분배 (목표 방식)

게임 의도: "어느 캐릭터에 얼마를 투자했는가"에 따라, 그 캐릭터가 벌어든 revenue만큼만 비율대로 받는다. 따라서 yield는 **고정 APR이 아니라 revenue 비례**여야 함.

```
당일 choonsimRevenue (해당 bondId) 합산 → daily_revenue
각 투자자 yield = daily_revenue × (투자자_투자금 / bond_총_투자금)
```

**현재 구현(임시)**: APR 18.5% 기반 근사 — **게임 의도와 불일치, 제거 필요**
```
yieldAmount = floor(totalInvested × 0.185 / 365)
```

**교체 목표**: `choonsimRevenue` 실 데이터 기반 비례 분배
- 춘심톡 활동량이 많은 날 → 투자자 수익 증가
- 이것이 실제 RWA 메커니즘과 일치함

### 3.3 시딩 데이터 스펙 (bonds, investors, investments)

#### bonds (2개) — 과거 히스토리 없음, 지금부터 누적

| id | bondId | borrowerName | loanAmount | interestRate |
|----|--------|--------------|------------|-------------|
| demo-bond-choonsim | 101 | ChoonSim AI-Talk | $500,000 | 18.50% |
| demo-bond-rina | 102 | Rina Virtual IP | $300,000 | 16.50% |

#### investors (20명)
- `userId = null` (실제 auth 연동 없음, 격리)
- `kycStatus = VERIFIED`
- 지갑 주소: 현재 `0xDEMO...` (non-hex 포함) → 유효 hex 42자로 교체 필요

#### investments (28~30건)
- **유저별 차등**: 20명이 각 캐릭터에 투자하되, 유저마다 **투자 시점(createdAt)·금액(usdcAmount)·투자한 캐릭터 수**가 다르게 시딩됨. (짝수 인덱스 2개 채권, 홀수 1개 채권 랜덤 / 금액 12단계 LCG 선택 / createdAt 5~50일 전 랜덤) → 동일 revenue가 들어와도 유저별 yield·랭킹이 다르게 나옴.
- 짝수 인덱스: 2개 채권 모두, 홀수 인덱스: 1개 채권 랜덤
- 금액: $2,000 ~ $25,000 (12단계 중 결정론적 선택)

#### yieldDistributions
- 초기 시딩 시: **과거 데이터 생성하지 않음** (기획 원칙)
- 춘심톡 revenue 수신 시마다 실시간 생성
- 데모 tick 시: 즉시 1건 생성 (시연용)

---

## 4. 파일별 구현 상세

### 4.1 `app/lib/demo-investors.ts` — 20명 주소·개인키 정책

20명 투자자 상수. `investors` 테이블에 이름 컬럼 없으므로 id→name, wallet→name 맵으로 관리.

#### 주소 생성·보관 (현재)

| 항목 | 현재 방식 | 비고 |
|------|-----------|------|
| **CTC 주소(지갑 주소)** | `demo-investors.ts`에 **상수로 하드코딩**. 20개 주소만 정의되어 있음. | DB 시딩 시 `investors.walletAddress`로 사용. 코드/리포에만 존재. |
| **생성 방식** | 수동. 별도 키 생성 스크립트 없음. | 유효 hex로 교체 시에도 “20개 주소만 정하면 됨”이면 수동 생성·교체 가능. |
| **Private key** | **보관하지 않음. 생성하지 않음.** | 20명은 현재 **오프체인 전용 mock** (시딩·tick으로 DB만 채움). 해당 주소로 온체인 서명을 하지 않음. |

즉, **20명의 CTC 주소는 코드 상수로만 존재하고, private key는 두지 않는 구조**이다. Faucet·투자·Claim 등 실제 서명이 필요한 트랜잭션은 **일반 사용자(지갑 연결)** 또는 **Relayer**가 처리한다.

#### 유효 주소로 교체 시 (Step 3)

- 20개 주소를 **유효한 42자 EVM hex**로 바꿀 때:
  - **옵션 A**: 도구로 20개 키페어 생성 → 주소만 `demo-investors.ts`에 반영, **private key는 저장하지 않음** (계속 mock으로만 사용).
  - **옵션 B**: 20명이 실제로 온체인에서 서명해야 하면 → 키 생성 스크립트로 20개 키페어 생성 후, **private key는 서버 env 또는 시크릿 저장소에만 보관**, 리포/클라이언트에 넣지 않음. (아래 “실제 서명이 필요한 경우” 참고.)

#### 요구: 지갑·익스플로러에서 20명 계좌·트랜잭션 확인 가능 (private key 필요)

**확인하고 싶은 것**: 20명 투자자 계좌를 **지갑에서 확인**할 수 있고, **트랜잭션이 익스플로러에서 확인** 가능해야 하며, 그에 따라 **private key도 필요**하다.

**현재 설정으로는 이 요구를 충족하지 않는다.**

| 항목 | 현재 상태 | 요구 충족을 위해 필요한 것 |
|------|-----------|----------------------------|
| 20명 주소 | `0xDEMO...` 상수. 유효 hex가 아니며 실제 키페어에서 나온 주소가 아님. | **20개 실제 키페어 생성** → 도출된 20개 주소로 교체. |
| Private key | 없음. 생성·보관하지 않음. | **20개 private key 생성 후 안전한 곳에만 보관** (env 또는 시크릿 매니저, Git·클라이언트 미노출). |
| 지갑에서 계좌 확인 | 불가. 주소가 가짜이며 해당 주소로 온체인 자산/내역이 없음. | 위 20개 주소에 **CTC·USDC를 실제로 지급**하고, **해당 키로 지갑에 import**하면 잔액·내역 확인 가능. |
| 익스플로러에서 트랜잭션 확인 | 불가. 20명이 **온체인 트랜잭션을 보내지 않음**. investments는 **DB만** insert, `transactionHash`는 가짜(`0xDEMOTX...`) 값. | **20명 각자가 서명하는 온체인 트랜잭션**이 필요. 예: 시딩 시(또는 별도 스크립트) 각 주소로 **approve + purchaseBond** 호출을 해당 private key로 서명·전송. 그러면 블록 익스플로러에 해당 주소의 tx가 노출됨. |

**정리**: “20명 계좌를 지갑에서 확인, 트랜잭션을 익스플로러에서 확인, private key 보유”에 **만족하는 설정은 아직 되어 있지 않다.** 충족하려면 (1) 20개 실키 생성·주소 교체, (2) private key 보관, (3) 20명이 서명하는 온체인 트랜잭션 실행(예: 시딩/스크립트에서 approve + purchaseBond), (4) 20명 주소에 CTC·USDC 보충이 모두 필요하다. 아래 “실제 서명이 필요한 경우”를 **필수 설계**로 반영해야 한다.

#### 실제 서명이 필요한 경우 (지갑·익스플로러 확인 시 필수)

**구현 상태**: 아래 흐름을 위한 스크립트가 추가됨. `npm run generate-demo-wallets` → 주소·키 생성, `npm run seed-demo-onchain` → 20명 각각 approve + purchaseBond 실행 후 실제 tx hash를 DB에 저장.

20명 계좌를 지갑·익스플로러에서 확인하려면 아래가 **필수**이다:

1. **주소 생성**: 스크립트에서 `ethers.Wallet.createRandom()` 또는 고정 mnemonic + 경로로 20개 지갑 생성. 도출된 **20개 주소**를 `demo-investors.ts` 및 시딩에 반영.
2. **Private key 보관**: 각 private key를 **환경변수**(예: `DEMO_INV_01_PRIVATE_KEY`, …) 또는 **시크릿 매니저**에 저장. **Git·클라이언트 번들·로그에 노출 금지.** 지갑에서 해당 계좌를 확인하려면 이 키로 지갑에 import 가능해야 함.
3. **CTC·USDC 보충**: 생성된 20개 주소에 Discord Faucet 등으로 CTC, Relayer 또는 Faucet으로 USDC 지급.
4. **온체인 트랜잭션 실행**: 20명이 **실제로 서명·전송**하는 트랜잭션이 있어야 익스플로러에 노출됨. 예: 시딩 스크립트 또는 별도 배치에서 각 investor private key로 **approve(LiquidityPool)** + **purchaseBond(bondId, amount)** 호출 후 broadcast. 전송된 tx hash를 `investments.transactionHash`에 저장. (현재는 DB만 insert하고 가짜 hash를 넣는 구조이므로, 이 부분을 “실제 서명·전송 후 실제 tx hash 저장”으로 교체 필요.)
5. **서명 주체**: 키 사용은 **백엔드/스크립트/배치**에서만. 프론트엔드에는 주소만 노출.

지갑·익스플로러 확인을 요구한다면 위 1~5가 **필수**이다. “DB만 시딩하고 랭킹만 보여준다”는 현재 방식만으로는 충족되지 않는다.

**현재 문제**: 지갑 주소에 `M`, `O` 등 non-hex 문자 포함
```
0xDEMO000100000000000000000000000000000001  ← 'M', 'O' 비유효
```
**수정 필요**: 유효한 EVM hex 주소 42자로 교체 (위 옵션 A/B 중 선택)

### 4.2 `app/lib/demo-seed.server.ts`

`api.demo.ts`의 reset 액션에서 import하여 재시딩 시 사용.
- bonds 2개, investors 20명, investments 생성
- yieldDistributions 과거 생성 **없음** (기획 원칙 반영 필요 — 현재 코드는 30일치 생성 중 → 제거 필요)

### 4.3 `scripts/seed-demo.ts`

```bash
cd frontend && npx tsx --tsconfig tsconfig.json scripts/seed-demo.ts
```
- `TURSO_DATABASE_URL` 없으면 `file:local.db`
- `onConflictDoNothing()` — 중복 실행 safe

### 4.4 `app/routes/api.demo.ts`

#### tick (현재 → 개선 필요)

**현재 (임시)**:
```
랜덤 투자자 선택 → 투자금 × APR / 365 → yieldDistributions INSERT
```

**목표 (1.1 구현 원칙 준수)**:
```
1. choonsimRevenue에서 오늘 수신된 revenue 조회
2. 아직 분배 안 된 revenue 1건 선택
3. 해당 bondId 투자자들에게 비율 기반 yield 계산 (revenue × 투자금/총투자금)
4. yieldDistributions INSERT
```
→ 이렇게 해야 "캐릭터가 벌어든 만큼만 나눠 받는다"는 게임 구조가 구현됨.

#### reset
```
yieldDistributions → investments → investors → bonds (역순 삭제)
→ seedDemo() 재호출
```

### 4.5 `app/routes/demo.tsx`

- SSR loader: 20명 leaderboard + 최근 10건 feed 초기 조회. **Leaderboard = 기간 내 yield 합계(총 수익) 기준** → 게임 의도 "얼마를 벌었는가" 랭킹과 동일.
- `useFetcher`: 2.5초마다 tick POST
- `useRevalidator`: tick 후 leaderboard 갱신
- `animate-slide-in` keyframe: 신규 feed 항목 애니메이션

---

## 5. 구현 시작 전 점검 및 누락 사항

### 5.1 준비된 것

| 항목 | 상태 |
|------|------|
| 기획·게임 구조·랭킹 정의 | 10 스펙, 09 랭킹 스펙, 본 문서 1.1 원칙 정리됨 |
| 전체 흐름(20명 투자 → 춘심톡 수신 → 분배 → 랭킹) | 10 스펙 1.3 전체 흐름 요약, 관련 문서 링크 정리됨 |
| `choonsimRevenue` 테이블 | 존재. api/revenue에서 수신 시 INSERT. projectId → bondId 매핑 가능(choonsimProjects) |
| POST /api/revenue | 수신·검증·choonsimRevenue 적재·온체인 relayDepositYield 호출 구현됨 |
| /demo, /ranking, Live Leaderboard | 페이지·API·yield 합계 기준 랭킹 구현됨 |
| 시딩 스크립트(seed-demo, demo-seed.server) | bonds, investors, investments 생성 구현됨 |
| 테스트 자원(CTC·MockUSDC) | 06_RELAYER_OPS 6절에 20명·Relayer 보충 안내 정리됨 |

### 5.2 누락·필수 작업 (구현 전 반드시 반영)

| # | 항목 | 설명 |
|---|------|------|
| 1 | **미분배 revenue 추적** | tick이 "아직 분배 안 된 revenue 1건"을 쓰려면 `choonsim_revenue`에 **demo 분배 완료 여부** 컬럼 필요. 예: `demo_yield_distributed_at` (nullable integer timestamp). 미설정 시 tick이 조회 대상으로 사용. |
| 2 | **tick 로직 교체** | 현재 APR 기반 → choonsimRevenue에서 `demo_yield_distributed_at IS NULL` 1건 조회 → 해당 projectId의 bondId로 demo 투자자 비율 계산 → yieldDistributions INSERT → 해당 revenue 행에 `demo_yield_distributed_at` 갱신. (Step 5 상세) |
| 3 | **시딩 시 yield 생성 제거** | `demo-seed.server.ts`, `scripts/seed-demo.ts`에서 **yieldDistributions 30일치 생성 로직 제거**. bonds, investors, investments만 시딩. (기획 원칙) |
| 4 | **지갑 주소 hex 교체** | `demo-investors.ts`의 `0xDEMO...` → 유효한 42자 EVM hex 주소. (Step 3) |
| 5 | **지갑·익스플로러에서 20명 확인** (요구 시) | 20명 계좌를 지갑에서, 트랜잭션을 익스플로러에서 확인하려면: 20개 **실제 키페어 생성·보관**, 주소 교체, **온체인 트랜잭션**(approve + purchaseBond 등)을 20명이 각각 서명·전송하는 흐름 필요. 현재는 DB만 시딩·가짜 txHash라 **미충족**. (4.1절 “지갑·익스플로러 확인” 참조.) |

### 5.3 선택·사전 확인

| 항목 | 비고 |
|------|------|
| `choonsim_projects.bond_id` | 기존 행이 null이면 101(춘심)·102(리나) 등으로 업데이트 필요. getOrCreateProjectByBondId로 신규는 bondId 설정됨. (Step 1) |
| amount 단위 | choonsimRevenue.amount 저장 단위와 yieldDistributions.yieldAmount·투자 비율 계산 시 단위(6 vs 18 decimals) 정합성 확인 권장. |
| Step 2 실행 시점 | 시딩은 1·2·3·4 중 시딩 제거(3) 반영 후 실행하는 것이 기획과 맞음. |

**정리**: 문서와 기본 인프라(테이블, api/revenue, 데모·랭킹 UI)는 갖춰져 있어 **구현을 시작하기에 적당**하다. 위 5.2 네 가지(스키마 1건, tick 교체, 시딩 yield 제거, 지갑 hex)를 순서대로 반영하면 전체 흐름이 스펙대로 동작한다.

---

## 6. 다음 단계 작업 (우선순위 순)

### Step 1 — BondBase DB 수정 (즉시)
```sql
UPDATE choonsim_projects SET bond_id = 1 WHERE id = 'choonsim-main';
-- 또는 bondId 컬럼이 온체인 ID라면:
-- bond_id = 101 (스키마 확인 후 결정)
```

### Step 2 — mock 투자자 20명 시딩 (즉시)
```bash
cd frontend && npx tsx --tsconfig tsconfig.json scripts/seed-demo.ts
```

### Step 3 — 지갑 주소 교체
`demo-investors.ts`의 `0xDEMO...` → 유효한 42자 hex 주소로 교체

### Step 4 — 춘심톡 Cron 등록 (춘심톡 팀)
`apps/web/vercel.json`에 cron 추가:
```json
{
  "crons": [
    { "path": "/api/cron/mock-grant",    "schedule": "0 0 * * *" },
    { "path": "/api/cron/mock-activity", "schedule": "0 6 * * *" },
    { "path": "/api/cron/bondbase-sync", "schedule": "0 12 * * *" }
  ]
}
```

### Step 5 — tick yield 계산을 revenue 실 데이터 기반으로 교체 (게임 의도 필수)
- **스키마**: `choonsim_revenue`에 `demo_yield_distributed_at` (integer, nullable) 추가. null이면 "미분배".
- **api.demo.ts** tick:
  1. `choonsimRevenue`에서 `demo_yield_distributed_at IS NULL` 1건 조회 (projectId → bondId는 choonsimProjects로 매핑).
  2. 해당 bondId에 대응하는 demo bond DB id(예: 101 → demo-bond-choonsim)의 투자자 목록·투자금 합산·비율 계산.
  3. 각 투자자별 yield = revenue.amount × (해당 투자자 투자금 / 해당 bond 총 투자금). 단위 정합성 유지.
  4. yieldDistributions INSERT (investorId, bondId는 bonds.id, yieldAmount, distributedAt).
  5. 해당 choonsimRevenue 행의 `demo_yield_distributed_at` = now 로 업데이트.
- 고정 APR 제거. 이 단계 완료 시 "캐릭터가 벌어든 만큼만 나눠 받는다"는 게임 구조 구현 (1.1 구현 원칙).

---

### Step 3.5 (권장 순서) — 시딩에서 yield 과거 생성 제거
- `demo-seed.server.ts`, `scripts/seed-demo.ts`에서 yieldDistributions 30일치 생성 루프 제거. bonds, investors, investments만 시딩. (Step 2 실행은 이 반영 후 권장.)

## 7. 사용 라이브러리 (AGENTS.md 준수)

| 라이브러리 | 사용처 |
|-----------|--------|
| `zod` | api.demo.ts body 검증 |
| `luxon` | 시간 계산, 날짜 생성 |
| `drizzle-orm` | DB 쿼리 (insert, select, delete, inArray, like) |

---

## X. Related Documents

- **Specs**: [Demo Simulation Spec](../03_Specs/10_DEMO_SIMULATION_SPEC.md) — 기획 명세
- **Specs**: [Revenue Bridge Spec](../03_Specs/02_REVENUE_BRIDGE_SPEC.md) — 춘심톡 Revenue 연동
- **Specs**: [ChoonSim Integration Handover](../03_Specs/08_CHOONSIM_INTEGRATION_HANDOVER.md) — bondId 매핑
- **Specs**: [Investor Ranking Spec](../03_Specs/09_INVESTOR_RANKING_SPEC.md) — 랭킹 쿼리 구조
- **Logic**: [Backlog](./00_BACKLOG.md) — 작업 상태 관리
