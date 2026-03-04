# 투자자 랭킹 스펙 대비 구현 검토 (09_INVESTOR_RANKING_SPEC)
> Created: 2026-03-04
> 대조 기준: [09_INVESTOR_RANKING_SPEC.md](./09_INVESTOR_RANKING_SPEC.md)

---

## 1. 충족 항목 (구현 완료)

| 스펙 항목 | 구현 위치 | 비고 |
|-----------|-----------|------|
| Path `/ranking` | `app/routes.ts` → `routes/ranking.tsx` | 충족 |
| 페이지 파일 `ranking.tsx` | `frontend/app/routes/ranking.tsx` | 충족 |
| 사이드바 "Leaderboard" | `dashboard-layout.tsx` 59행 | 충족 |
| 사이드바 위치 (Fandom Impact 아래) | `dashboard-layout.tsx` navigation 배열 순서: Impact → Ranking | 충족 |
| 기간 필터 (이번 주 / 이번 달 / 전체) | `PERIOD_TABS`, `period` 쿼리, `getPeriodStart(period)` | 충족 |
| 쿼리 기준 컬럼 `yieldDistributions.distributedAt` | loader 61행 `gte(yieldDistributions.distributedAt, startTs)` | 충족 |
| 기본 탭 "이번 주" | `periodSchema.catch("week")` | 충족 |
| 기준 지표: 해당 기간 `yieldAmount` 합산 | `sum(yieldDistributions.yieldAmount)` groupBy investorId | 충족 |
| 상위 100명 | `.limit(100)` | 충족 |
| 지갑 주소 마스킹 (앞 6 + ... + 뒤 4) | `maskAddress()` 36~38행 | 충족 |
| 개인정보 미노출 (이름·이메일 없음) | 지갑 주소만 표시 | 충족 |
| 본인 행 배경 강조 | `isMe ? "bg-neutral-900 text-white"` 233행 | 충족 |
| 로그인 시에만 본인 순위 표시 | `useAccount()`, `myEntry` 존재 시 배너·행 강조 | 충족 |
| 제목 "Leaderboard", 부제 "투자자들의 수익 성과를 비교합니다" | 154~156행 | 충족 |
| 테이블 컬럼: 순위, 지갑 주소, 총 수익, 투자 채권 수 | 218~222행 | 충족 |
| 빈 상태 문구 "이번 기간에 수익 분배 내역이 없습니다." | 213행 | 충족 |
| 마지막 업데이트 시각 (KST 포맷) | 284행 `toFormat("yyyy-MM-dd HH:mm") KST` | 충족 |
| Luxon 사용 | `DateTime.now()`, `startOf("week")`, `startOf("month")`, `toISO()` | 충족 |
| period 파라미터 Zod 검증 | `periodSchema = z.enum(["week","month","all"]).catch("week")` | 충족 |
| DB 테이블 활용 | `yieldDistributions`, `investors`, `investments` | 충족 |

---

## 2. 부분 충족 또는 스펙과 상이

### 2.1 API 형태

- **스펙**: `GET /api/ranking?period=week|month|all` 별도 API + 응답 스키마 `myRanking`, `rankings[].isMe` 등.
- **구현**: 별도 API 없음. **페이지 loader**에서 동일 쿼리 수행 후 직렬화 데이터 반환. 클라이언트에서 `useAccount()`로 본인 여부 판별.
- **판단**: 단일 앱 내에서만 사용할 때는 loader 방식으로도 목적 달성. 외부/클라이언트 전용 API가 필요하면 `api.ranking.ts` 리소스 라우트 추가 필요.

### 2.2 응답 스키마 — 완료

- **조치 반영**: loader 및 `getRankingData()` 반환에 `rankings[].isMe`, `myRanking: { rank, totalYield, bondCount } | null` 포함. API 응답에서도 동일 스키마.

### 2.3 아이콘

- **스펙**: `Trophy01Icon` (Hugeicons).
- **구현**: `ChampionIcon` 사용 (페이지·사이드바·빈 상태).
- **판단**: 스펙 미결 사항 7번("Trophy01Icon 포함 여부 확인")에 따라 대체 아이콘 사용한 것으로 보임. `@hugeicons/core-free-icons` 내 Trophy 계열 노출명 미확인.

### 2.4 기간 경계 타임존 (KST) — 완료

- **조치 반영**: `lib/ranking.server.ts`의 `getPeriodStart()`에서 `DateTime.now().setZone("Asia/Seoul")` 적용 후 `startOf("week")` / `startOf("month")` 사용.

---

## 3. 미구현 또는 보완 필요

### 3.1 동점 처리 (필수) — 완료

- **조치 반영**: `lib/ranking.server.ts`에서 Raw SQL로 `ORDER BY total_yield DESC, COALESCE(SUM(inv.usdc_amount), 0) DESC, i.created_at ASC` 적용.

### 3.2 100위 밖 본인 처리 — 완료

- **조치 반영**: loader에 쿼리 파라미터 `wallet` 수신. 클라이언트에서 지갑 연결 시 URL에 `wallet` 추가. `resolveMyRanking()`으로 100위 밖 사용자도 `myRanking: { rank: null, totalYield, bondCount }` 반환. 배너 "100위 밖", 테이블 하단 본인 행 별도 렌더링.

### 3.3 Cache-Control — 완료

- **조치 반영**: `GET /api/ranking` 라우트(`api.ranking.ts`)에서 `Cache-Control: public, max-age=300` 설정.

### 3.4 api.ranking.ts — 완료

- **조치 반영**: `frontend/app/routes/api.ranking.ts` 신규. `lib/ranking.server.ts`의 `getRankingData()` 공유.

---

## 4. 요약

| 구분 | 상태 | 내용 |
|------|------|------|
| 충족 | 유지 | 경로, UI, 기간 필터, 마스킹, 상위 100, 빈 상태, Luxon, Zod, DB 테이블 |
| 부분/상이 | 1건 남음 | 아이콘(Champion vs Trophy) — 스펙 미결 사항으로 유지 |
| 미구현/보완 | 전부 반영 | 동점 처리, KST 경계, 100위 밖 배너·하단 행, Cache-Control, api.ranking.ts, 응답 스키마 myRanking/isMe |

**구현 파일**: `ranking.tsx`, `lib/ranking.ts` (타입·maskAddress, 클라이언트 안전), `lib/ranking.server.ts`, `api.ranking.ts`, `routes.ts`

---

## X. Related Documents

- **Spec**: [09_INVESTOR_RANKING_SPEC.md](./09_INVESTOR_RANKING_SPEC.md)
- **구현**: `frontend/app/routes/ranking.tsx`, `frontend/app/components/layout/dashboard-layout.tsx`
