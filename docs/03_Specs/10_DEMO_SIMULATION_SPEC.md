# 데모 시뮬레이션 기획 명세 (Demo Simulation Feature)
> Created: 2026-03-05
> Last Updated: 2026-01-23 (전체 흐름 요약·유저별 시간·금액 차이 명시)

## 1. 기능 개요

### 1.1 목적

BondBase를 처음 접하는 잠재 투자자 및 심사위원에게 **플랫폼이 실제로 어떻게 작동하는지**를 실시간으로 시각화한다.

- 춘심톡 mock 유저 50명이 30일간 CHOCO를 소비하며 IP 수익을 발생시킴
- 그 수익이 BondBase Revenue Bridge를 통해 전달됨
- BondBase mock 투자자 20명이 해당 수익에 비례하여 yield를 수령
- `/demo` 페이지에서 이 흐름을 실시간으로 시각화

### 1.2 게임 구조 (핵심 루프)

**게임**은 "어느 캐릭터에 얼마를 투자하는가"를 선택하는 것이다. **랭킹**은 그 결과 "얼마를 벌었는가(총 수익)"로 정한다.

| 단계 | 내용 |
|------|------|
| 1. 투자 선택 | 캐릭터(춘심/리나 등 bond)별로 투자할 금액을 정한다. (어느 캐릭터에 얼마를 넣을지가 게임의 핵심 선택.) |
| 2. 수익 발생 | 캐릭터별로 들어온 revenue(CHOCO 소비 → USDC 환산)를 해당 bond 투자자들에게 **투자 비율**대로 나눠 yield로 지급한다. (고정 APR이 아님.) |
| 3. 랭킹 | 기간 내 받은 yield 합계(총 수익) 기준으로 순위를 매긴다. "얼마를 벌었는가"가 리더보드의 지표이다. |

- 데모 페이지의 Live Leaderboard와 `/ranking` 리더보드는 동일한 원리(총 수익 기준)를 따른다.

### 1.3 전체 흐름 요약 (문서 준비 범위)

아래 흐름이 가능하도록 기획·구현·운영 문서가 정리되어 있다.

| 단계 | 내용 | 관련 문서 |
|------|------|-----------|
| 1. 20명 투자자 | 각 투자자가 **캐릭터(춘심/리나 등 bond)별로** 투자. **유저별로 투자 시점·투자 금액·투자한 캐릭터 수(1~2개)**가 다르게 시딩/구현됨 → 결과적으로 수익·랭킹이 유저마다 달라짐. | 본 스펙 3절, [구현 03](../04_Logic/03_DEMO_SIMULATION_IMPL.md) 3.3 시딩 스펙 |
| 2. 춘심톡 데이터 수신 | 춘심톡에서 CHOCO 소비 집계 → bondbase-sync가 **POST /api/revenue**로 BondBase에 전달. BondBase는 `choonsimRevenue` 테이블에 적재. | [Revenue Bridge 02](./02_REVENUE_BRIDGE_SPEC.md), 본 스펙 1.5·2절 |
| 3. 수익 정리(분배) | 수신한 revenue를 해당 bond 투자자들에게 **투자 비율**대로 yield로 분배 → `yieldDistributions` 기록. (고정 APR 아님.) | 본 스펙 3.3, [구현 03](../04_Logic/03_DEMO_SIMULATION_IMPL.md) 3.2 |
| 4. 랭킹 표시 | 기간 내 **총 수익(yield 합계)** 기준으로 순위 계산 → `/demo` Live Leaderboard 및 **`/ranking`** 리더보드에 표시. | [투자자 랭킹 09](./09_INVESTOR_RANKING_SPEC.md), 본 스펙 1.2·5.3 |
| 5. 테스트 자원 | 20명 투자자·Relayer에 CTC·MockUSDC 보충 필요. 20명 × 500 USDC = 10,000 등. | [Relayer Ops 06](./06_RELAYER_OPS.md) 6절 |

- **유저별 시간·금액 차이**: 시딩 시 `investments`에 유저별로 상이한 `createdAt`(투자 시점), `usdcAmount`(금액), 투자한 bond(1개 또는 2개)가 들어가므로, 동일 revenue가 들어와도 받는 yield와 최종 랭킹이 유저마다 다르게 나온다.

### 1.4 핵심 설계 원칙

> "30일치 과거 데이터를 만드는 것이 아니라, 지금부터 30일간 실제로 쌓아가는 것이다."

- 과거 히스토리를 시딩하지 않음
- 춘심톡 → BondBase 파이프라인이 매일 실제로 동작하면서 데이터가 누적됨
- 30일 후에는 자연스럽게 30일치 실적이 쌓여 있음

### 1.5 시연 흐름 (End-to-End)

```
춘심톡 (매일 자동 실행)
├─ mock-grant Cron   → 50명 mock 유저에게 CHOCO 지급 (일 3,000 CHOCO/인)
└─ mock-activity Cron → 50명이 CHOCO 소비 (5~20 CHOCO/회) → ChocoConsumptionLog 적재

bondbase-sync Cron (매일)
    → isSynced=false 로그 집계 → 캐릭터별 CHOCO 합산
    → USDC 환산 (1 CHOCO = $0.001)
    → POST /api/revenue (bondId: 101/102)
    → isSynced=true 업데이트

BondBase /api/revenue 수신
    → choonsimRevenue 테이블 적재
    → 20명 mock 투자자에게 투자 비율 기반 yield 분배
    → yieldDistributions 테이블 기록

/demo 페이지
    → Live Activity Feed: 최신 yield 이벤트 실시간 표시
    → Live Leaderboard: 누적 수익 기준 20명 순위
    → Start 후 tick 클릭 시: BondBase에 쌓인 미분배 revenue(choonsim_revenue, demo_yield_distributed_at=null)를 1건씩 순서대로 분배 → 총 수익 갱신
```

**참고**: 춘심톡 DB에 `isSynced=false`인 로그(예: 102건)가 있으면 bondbase-sync가 BondBase로 보낸 뒤 `choonsim_revenue`에 적재된다. 그 미분배 revenue는 /demo에서 tick을 누를 때마다 1건씩 분배된다. 상세는 [03_DEMO_SIMULATION_IMPL 2.1.1](../04_Logic/03_DEMO_SIMULATION_IMPL.md#211-데모에서-총-수익이-갱신되는-흐름-사용자-관점) 참조.

---

## 2. 춘심톡 데이터 연계 구조

### 2.1 춘심톡 현황 (2026-03-05 확인)

| 항목 | 현황 |
|------|------|
| mock 유저 수 | **50명** (정상 구성) |
| 활동 시작일 | 2026-03-03 (2일 전부터 시작) |
| ChocoConsumptionLog | 102건, 1,224 CHOCO 소비 기록 |
| BondBase 전송 상태 | **isSynced=false 102건** — 미전송 |
| chunsim bondBaseId | **101** (연결 완료) |
| rina bondBaseId | **102** (연결 완료) |

### 2.2 춘심톡 Cron 구조

| Cron | 엔드포인트 | 주기 | 역할 |
|------|-----------|------|------|
| mock-grant | `GET /api/cron/mock-grant` | 매일 | 50명에게 CHOCO 3,000개 지급 |
| mock-activity | `GET /api/cron/mock-activity` | 매일 | 50명이 CHOCO 소비 → Log 생성 |
| bondbase-sync | `GET /api/cron/bondbase-sync` | 매일 | 미전송 Log 집계 → BondBase 전송 |

### 2.3 캐릭터 → Bond 매핑

| 캐릭터 | bondId | 시연 포함 |
|--------|--------|-----------|
| 춘심 (chunsim) | 101 | O |
| Rina (rina) | 102 | O |
| Mina, Yuna, Sora, Hana | null (미연동) | X |

### 2.4 예상 일일 Revenue (실측 기반)

춘심톡 mock-activity 실측:
- 유저당 1회 소비: 토큰 500~2,000 → CHOCO 5~20개
- 50명 합산: **250~1,000 CHOCO/일/캐릭터**
- USDC 환산 (1 CHOCO = $0.001): **$0.25~$1.00/일/캐릭터**

> 소액이지만, 이는 demo 목적의 mock 데이터임. 실제 서비스에서는 훨씬 큰 규모로 발생.

---

## 3. BondBase Mock 투자자 20명

### 3.1 투자자 구성 (지역 다양성)

춘심톡의 팬 베이스(남미 70%, 일본 30%)를 반영한 투자자 분포:

| 지역 | 인원 | 이름 |
|------|------|------|
| 일본 | 7명 | Yuki Tanaka, Haruto Sato, Sakura Yamamoto, Kenji Nakamura, Aoi Kobayashi, Ren Watanabe, Miku Ito |
| 남미 | 5명 | Maria Garcia, Carlos Rodriguez, Ana Martinez, Diego Lopez, Sofia Hernandez |
| 한국 | 4명 | Ji-su Kim, Min-jun Lee, Soo-yeon Park, Tae-yang Choi |
| 글로벌 | 4명 | Alex Johnson, Sarah Williams, Wei Chen, Priya Sharma |

### 3.2 투자 설정

20명이 **각 캐릭터(춘심/리나)에** 투자하며, **유저별로 투자 시점과 금액이 다르게** 설계된다. (시딩/구현에서 `investments.createdAt`, `usdcAmount`, 투자 bond 수를 유저마다 다르게 넣어, 랭킹 결과가 서로 다르게 나오도록 함.)

| 항목 | 값 |
|------|----|
| 투자 금액 범위 | $2,000 ~ $25,000 USDC (유저별 상이) |
| 투자 채권 수 | 인당 1~2개 (유저별 상이) |
| 투자 시점 | 시딩 시 유저별 상이한 `createdAt` (구현 문서 3.3 참조) |
| KYC 상태 | 전원 VERIFIED |
| 지갑 주소 | 유효한 42자 EVM hex 주소 (개선 필요 → 4절 참조) |
| DB ID 형식 | `demo-inv-01` ~ `demo-inv-20` |

### 3.3 Yield 분배 방식 (목표)

```
일별 yield = 해당 bondId의 당일 choonsimRevenue 합산
           × (투자자 투자금 / 해당 bond 총 투자금)
```

- 춘심톡 revenue가 많은 날 → 투자자 수익도 많음 (현실 반영)
- 현재 구현(APR 근사)에서 이 방식으로 전환 필요 (구현 문서 참조)

---

## 4. 현재 미완료 항목 (Action Required)

| 항목 | 현황 | 필요 작업 |
|------|------|-----------|
| BondBase `choonsim_projects.bond_id` | **null** | 101로 업데이트 |
| BondBase mock 투자자 20명 | **DB 미삽입** | `seed-demo.ts` 실행 |
| 지갑 주소 형식 | `0xDEMO...` (non-hex 문자 포함) | 유효한 hex 주소로 교체 |
| tick yield 계산 | APR 18.5% 근사 | `choonsimRevenue` 실 데이터 기반으로 교체 |
| 춘심톡 102건 미전송 | isSynced=false | `bondbase-sync` 수동 실행 |
| 춘심톡 Vercel Cron | 미등록 | `vercel.json` cron 설정 추가 |

---

## 5. 데모 페이지 기능 요구사항

### 5.1 컨트롤

| 버튼 | 동작 |
|------|------|
| Start | 2.5초 주기 tick 시작 (최근 미분배 revenue → yield 삽입) |
| Pause | tick 일시정지 |
| Reset | demo- 투자자·투자·yield 데이터 삭제 후 재시딩 |

### 5.2 Live Activity Feed

- 최신 yield 이벤트가 상단에 추가 (최대 50건 유지)
- 신규 항목: `animate-slide-in` CSS keyframe 애니메이션
- 표시 정보: 투자자 이름, 채권명 (ChoonSim/Rina), yield 금액, 발생 시각

### 5.3 Live Leaderboard

- 상위 20명, 누적 yield 합산 기준 내림차순
- 1~3위: 다크 배경 강조
- SSR loader 초기 조회 + tick마다 `useRevalidator` 갱신

### 5.4 How It Works (3단계)

1. **Invest** — USDC로 Bond 구매 → BondToken(ERC-1155) 수령
2. **IP Revenue** — 춘심톡 CHOCO 소비 → OracleAdapter → YieldDistributor
3. **Earn Yield** — 투자 비율 기반 자동 분배, 랭킹 경쟁, Claim or Reinvest

---

## 6. 격리 및 안전 설계

| 테이블 | 격리 방식 |
|--------|-----------|
| `bonds` | `id LIKE 'demo-%'` |
| `investors` | `id IN ('demo-inv-01' ~ 'demo-inv-20')`, `userId = null` |
| `investments` | `id LIKE 'demo-investment-%'` |
| `yieldDistributions` | `investorId IN (demo-inv-*)` 또는 `id LIKE 'demo-yield-%'` |

- 실제 유저(userId != null)와 완전 격리
- `onConflictDoNothing()` — 중복 실행 safe
- 투자자 이름은 DB 미저장, `app/lib/demo-investors.ts` 상수 관리

---

## 7. 검증 기준 (Phase-Exit QA)

| 항목 | 기준 |
|------|------|
| 춘심톡 → BondBase 전송 | `choonsimRevenue` 테이블에 당일 revenue 수신 확인 |
| mock 투자자 시딩 | `/ranking` 에서 20명 표시 |
| `/demo` 초기 로드 | leaderboard + 최근 feed 정상 표시 |
| Start 후 tick | 2.5초마다 feed 갱신, leaderboard 순위 변동 |
| 실제 유저 데이터 오염 | 없음 |
| 콘솔 오류 | 빨간 오류 0건 |

---

## X. Related Documents

- **Specs**: [Revenue Bridge Spec](./02_REVENUE_BRIDGE_SPEC.md) — 춘심톡 → BondBase 수익 연동 규격
- **Specs**: [ChoonSim Integration Handover](./08_CHOONSIM_INTEGRATION_HANDOVER.md) — bondId 매핑
- **Specs**: [Investor Ranking Spec](./09_INVESTOR_RANKING_SPEC.md) — 랭킹 데이터 구조
- **Logic**: [Demo Simulation Implementation](../04_Logic/03_DEMO_SIMULATION_IMPL.md) — 구현 상세
- **Logic**: [Backlog](../04_Logic/00_BACKLOG.md) — 작업 상태
