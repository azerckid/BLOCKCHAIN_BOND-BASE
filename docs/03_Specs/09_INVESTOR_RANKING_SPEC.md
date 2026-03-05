# 투자자 랭킹 기능 명세 (Investor Ranking Leaderboard)
> Created: 2026-03-04 00:00
> Last Updated: 2026-01-23 (게임과 랭킹 관계 명시)

## 1. 기능 개요

BondBase 투자자들의 수익 성과를 기간별로 비교하여 순위를 시각화하는 리더보드 기능.

**게임과의 관계**: 유저가 "어느 캐릭터에 얼마를 투자하는가"를 선택하고, 캐릭터별 revenue에 비례해 yield를 받는다. **랭킹은 그 결과 "얼마를 벌었는가(총 수익)"**를 기준으로 한다. ([데모 시뮬레이션 스펙](./10_DEMO_SIMULATION_SPEC.md) 1.2 게임 구조 참조.)

**목적**: 투자자 간 경쟁 동기 부여 및 플랫폼 재방문율 향상.

**대상 유저**: 지갑을 연결한 모든 BondBase 투자자. 비로그인 사용자도 열람 가능하되, 본인 순위 강조는 로그인 시에만 표시.

---

## 2. 기능 요구사항

### 2.1 기간 필터

| 탭 | 기준 기간 | 쿼리 기준 컬럼 |
|----|-----------|---------------|
| 이번 주 | 이번 주 월요일 00:00 KST ~ 현재 | `yieldDistributions.distributedAt` |
| 이번 달 | 이번 달 1일 00:00 KST ~ 현재 | `yieldDistributions.distributedAt` |
| 전체 | 전체 기간 (필터 없음) | - |

- 날짜 계산은 **Luxon** 사용 (AGENTS.md 필수 라이브러리)
- 기본 탭: 이번 주

### 2.2 랭킹 지표

- **기준 지표**: 해당 기간 내 `yieldDistributions.yieldAmount` 합산 (USDC base units)
- **동점 처리**: 총 투자금액(`investments.usdcAmount` 합산) 많은 순 → 가입일(`investors.createdAt`) 빠른 순
- **표시 상위 N명**: 100위까지 표시

### 2.3 유저 식별 (개인정보 처리)

- 지갑 주소 마스킹: 앞 6자리 + `...` + 뒤 4자리 표시
  - 예시: `0xC86F94...2B31`
- 이름·이메일 등 개인정보 미노출

### 2.4 본인 순위 강조 (로그인 시)

- 리스트 상단에 "내 순위" 배너 표시
  - 예시: `이번 주 기준 현재 5위입니다 (수익 $320.00)`
- 본인 행: 배경 하이라이트(`bg-neutral-900 text-white`) + bold 처리
- 100위 밖일 경우 배너에 `100위 밖` 표시, 테이블 하단에 본인 행 별도 표시

---

## 3. 화면 구성 (UI 명세)

### 3.1 라우트 및 사이드바

| 항목 | 내용 |
|------|------|
| Path | `/ranking` |
| 파일 | `frontend/app/routes/ranking.tsx` |
| 사이드바 레이블 | `Leaderboard` |
| 아이콘 | `Trophy01Icon` (Hugeicons) |
| 사이드바 위치 | `Fandom Impact` 아래 |

### 3.2 레이아웃 구조

```
[페이지 헤더]
  제목: Leaderboard
  부제: 투자자들의 수익 성과를 비교합니다

[내 순위 배너] — 로그인 시만 표시
  "이번 주 기준 현재 5위 | 총 수익: $320.00 USDC"

[기간 탭]
  [ 이번 주 ] [ 이번 달 ] [ 전체 ]

[랭킹 테이블]
  순위  | 지갑 주소        | 총 수익 (USDC) | 투자 채권 수
  ------|-----------------|---------------|------------
  1위   | 0x1234...5678   | $1,250.00      | 3
  2위   | 0xabcd...ef01   | $980.00        | 2
  3위   | 0x9900...1122   | $750.00        | 4
  ...
  (로그인 유저 행 → 배경 강조)

[마지막 업데이트 시각]
  "Last updated: 2026-03-04 12:00 KST"
```

### 3.3 빈 상태

- 해당 기간 수익 데이터가 없을 경우: "이번 기간에 수익 분배 내역이 없습니다." 안내 문구 표시

---

## 4. API 명세

### 4.1 엔드포인트

```
GET /api/ranking?period=week|month|all
```

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `period` | `week \| month \| all` | N | `week` | 집계 기간 |

### 4.2 응답 스키마 (Zod 검증 필수)

```ts
// 응답 타입
{
  period: "week" | "month" | "all",
  updatedAt: string,           // ISO 8601
  rankings: {
    rank: number,
    walletAddress: string,     // 마스킹된 주소 (0x1234...5678)
    totalYield: number,        // USDC base units (정수)
    bondCount: number,
    isMe: boolean,             // 로그인 유저 본인 여부
  }[],
  myRanking: {                 // 로그인 시만 포함, 비로그인 시 null
    rank: number | null,       // 100위 밖이면 null
    totalYield: number,
    bondCount: number,
  } | null,
}
```

### 4.3 DB 쿼리 로직

```sql
-- period 파라미터에 따라 WHERE 절 조건 분기
-- week: distributedAt >= 이번 주 월요일 00:00 Unix timestamp
-- month: distributedAt >= 이번 달 1일 00:00 Unix timestamp
-- all: 조건 없음

SELECT
  i.wallet_address,
  SUM(yd.yield_amount)          AS total_yield,
  COUNT(DISTINCT inv.bond_id)   AS bond_count
FROM yield_distributions yd
JOIN investors i   ON yd.investor_id = i.id
JOIN investments inv ON inv.investor_id = i.id
[WHERE yd.distributed_at >= :startTs]
GROUP BY i.wallet_address
ORDER BY total_yield DESC, SUM(inv.usdc_amount) DESC, i.created_at ASC
LIMIT 100;
```

### 4.4 응답 캐시

- `Cache-Control: public, max-age=300` (5분 캐시)
- 데이터가 자주 변하지 않는 환경(테스트넷)에 적합

---

## 5. 구현 파일 목록

| 파일 | 역할 | 신규/수정 |
|------|------|----------|
| `frontend/app/routes/ranking.tsx` | 랭킹 페이지 컴포넌트 | 신규 |
| `frontend/app/routes/api.ranking.ts` | 랭킹 API 엔드포인트 | 신규 |
| `frontend/app/components/layout/dashboard-layout.tsx` | 사이드바에 Leaderboard 메뉴 추가 | 수정 |

---

## 6. 비기능 요구사항

| 항목 | 기준 |
|------|------|
| 응답 시간 | 400ms 이내 (Turso SQLite, 인덱스 활용) |
| 보안 | 지갑 주소 외 개인정보 미노출 |
| Validation | 입력 파라미터 Zod 스키마 검증 |
| 날짜 처리 | Luxon 사용 (`DateTime.now().startOf('week')` 등) |
| 빈 상태 | 데이터 없을 시 명시적 안내 문구 표시 |

---

## 7. 미결 사항 (구현 전 확인 필요)

- [ ] `Trophy01Icon`이 `@hugeicons/core-free-icons`에 포함되는지 확인. 없을 경우 대체 아이콘 선정.
- [ ] Turso 환경에서 GROUP BY + JOIN 쿼리 성능 실측 후 인덱스 추가 여부 결정.
- [ ] 로그인 세션에서 지갑 주소 조회 방식 확인 (`session` → `investors.walletAddress` JOIN).

---

## X. Related Documents

- **Foundation**: [Roadmap](../01_Foundation/03_ROADMAP.md) - 기능 로드맵 맥락
- **Foundation**: [Project Overview](../01_Foundation/00_PROJECT_OVERVIEW.md) - 프로젝트 비전 및 DB 구조
- **Specs**: [Infrastructure](./01_INFRASTRUCTURE.md) - DB 및 서버 인프라 정보
- **Logic**: [Backlog](../04_Logic/00_BACKLOG.md) - 구현 작업 추적
