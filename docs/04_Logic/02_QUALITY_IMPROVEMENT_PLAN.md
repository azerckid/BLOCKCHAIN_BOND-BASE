# 코드 품질 개선 구현 계획 (Quality Improvement Implementation Plan)
> Created: 2026-02-09 10:50
> Last Updated: 2026-02-09 (Phase 1 완료)

본 문서는 [코드 품질 감사 보고서](../05_Test/04_CODE_QUALITY_AUDIT.md)에서 식별된 P0~P2 이슈에 대한 구현 계획을 정의한다. 작업을 3개 Phase로 분리하여, 의존 관계와 영향 범위에 따라 순차적으로 진행한다.

---

## 1. Phase 정의 및 의존 관계

```
Phase 1: 프론트엔드 즉시 수정 (코드 변경만, 재배포 불필요한 수준)
  ↓
Phase 2: 환경 및 보안 정비 (운영 환경 설정, git history 정리)
  ↓
Phase 3: 스마트 컨트랙트 강화 + 재배포 (온체인 변경, 주소 갱신)
```

**Phase 간 의존 관계:**
- Phase 1은 독립적으로 즉시 시작 가능
- Phase 2는 Phase 1 완료 후 진행 (환경변수 검증 로직이 Phase 1에서 추가되므로)
- Phase 3은 Phase 1, 2와 독립적이나, 재배포 후 프론트엔드 주소 갱신이 필요하므로 Phase 1 완료 후 진행 권장

---

## 2. Phase 1: 프론트엔드 즉시 수정

**목표**: 코드 변경만으로 해결 가능한 P0/P1/P2 이슈를 모두 처리한다.
**예상 영향**: 프론트엔드 재빌드 + Vercel 재배포

### 2.1 API Zod 검증 추가 (P0 3.3)

**대상 파일 및 변경 내용:**

#### (A) `frontend/app/routes/api.faucet.ts`
- Zod 스키마 정의: `address`가 `0x`로 시작하는 42자 hex 문자열인지 검증
- `safeParse()` 실패 시 400 응답 반환
```
변경 전: const { address } = await request.json();
변경 후: const parsed = faucetSchema.safeParse(await request.json());
         if (!parsed.success) return Response(400);
```

#### (B) `frontend/app/routes/api.revenue.ts`
- `type` 필드: `z.enum(["REVENUE", "MILESTONE", "METRICS"])`
- `data` 필드: type별 discriminated union 스키마
  - REVENUE: `{ amount: z.string().regex(/^\d+(\.\d+)?$/), source: z.string(), description: z.string() }`
  - MILESTONE: `{ key: z.string(), description: z.string(), achievedAt: z.number().optional(), bonusAmount: z.string().optional() }`
  - METRICS: `{ followers: z.number(), subscribers: z.number(), shares: z.object({...}).optional() }`
- `amount` 범위 검증: 0 초과, 상한값(예: 1,000,000) 이하

#### (C) `frontend/app/routes/api.chat.ts`
- `messages` 배열 스키마: `z.array(z.object({ role: z.enum(["user","assistant","system"]), content: z.string() }))`
- `model` 필드: `z.enum(["google", "openai"]).default("google")`

**완료 기준:**
- [ ] 3개 API 라우트 모두 Zod 스키마 적용
- [ ] 유효하지 않은 입력 시 400 응답 + 에러 메시지 반환 확인
- [ ] 정상 입력 시 기존 동작과 동일하게 작동 확인

---

### 2.2 Faucet Rate Limiting (P0 3.2)

**대상 파일**: `frontend/app/routes/api.faucet.ts`

**구현 방식**: DB 기반 cooldown (Turso에 faucet_requests 테이블 추가)

**변경 내용:**
1. `frontend/app/db/schema.ts`에 `faucetRequests` 테이블 추가
   ```
   faucetRequests: { id, address, requestedAt, txHash }
   ```
2. `api.faucet.ts`에서 동일 주소의 마지막 요청 시각을 조회하여 24시간 이내 재요청 차단
3. 일일 총 지급 한도 설정 (예: 전체 10,000 USDC/일)

**완료 기준:**
- [ ] 동일 주소 24시간 내 재요청 시 429 응답
- [ ] 일일 한도 초과 시 429 응답
- [ ] DB 마이그레이션 정상 적용 (Drizzle push)

---

### 2.3 DEV_FALLBACK_KEY 제거 (P1 4.4)

**대상 파일**: `frontend/app/lib/relayer.ts`

**변경 내용:**
1. 21행 `DEV_FALLBACK_KEY` 상수 삭제
2. `getValidPrivateKey()` 함수에서 fallback 로직 제거
3. `RELAYER_PRIVATE_KEY` 미설정 시 명시적 에러 throw:
   ```typescript
   if (!privateKey) {
       throw new Error('[Relayer] RELAYER_PRIVATE_KEY 환경변수가 설정되지 않았습니다.');
   }
   ```

**완료 기준:**
- [ ] DEV_FALLBACK_KEY 문자열이 코드에서 완전히 제거됨
- [ ] 환경변수 미설정 시 명확한 에러 메시지와 함께 실패
- [ ] 환경변수 설정 시 기존 동작과 동일

---

### 2.4 Chat API Dead Code 제거 (P2 5.6)

**대상 파일**: `frontend/app/routes/api.chat.ts`

**변경 내용:**
- 69~81행의 `createPublicClient`, `defineChain`, `http` import 및 `client` 생성 로직 전체 삭제
- 해당 코드는 생성만 되고 사용되지 않는 dead code

**완료 기준:**
- [ ] `viem` import가 api.chat.ts에서 제거됨
- [ ] 채팅 기능 정상 동작 확인

---

### 2.5 ErrorBoundary 및 404 페이지 추가 (P1 4.6)

**대상 파일:**
- `frontend/app/root.tsx` - 글로벌 ErrorBoundary 추가
- `frontend/app/routes/` - catchall 404 라우트 파일 생성

**변경 내용:**

#### (A) `root.tsx`에 ErrorBoundary export 추가
React Router v7의 `ErrorBoundary` export를 사용하여 라우트 레벨 에러 캐치:
```typescript
export function ErrorBoundary() {
    // useRouteError()로 에러 정보 획득
    // 사용자 친화적 에러 UI 렌더링
    // "홈으로 돌아가기" 링크 제공
}
```

#### (B) 404 Catchall 라우트
React Router v7 filesystem routing에서 `$.tsx` (splat route) 파일 생성:
- `frontend/app/routes/$.tsx` - 매칭되지 않는 모든 경로 처리
- DashboardLayout 내에서 "페이지를 찾을 수 없습니다" 메시지 표시

**완료 기준:**
- [ ] 존재하지 않는 URL 접근 시 404 페이지 표시 (빈 페이지 아님)
- [ ] 라우트 컴포넌트 에러 시 ErrorBoundary가 fallback UI 표시
- [ ] ErrorBoundary에서 홈으로 복귀 가능

---

### 2.6 미사용 의존성 제거 (P2 5.4)

**대상 파일**: `frontend/package.json`

**변경 내용:**
1. `dependencies`에서 제거:
   - `lucide-react` (HugeIcons로 대체됨)
   - `@base-ui/react` (import 없음)
2. `dependencies` → `devDependencies`로 이동:
   - `shadcn` (CLI 도구, 런타임 불필요)
3. `relayer/package.json`에서 제거:
   - `axios` (미사용)

**주의**: `zod`는 Phase 1의 2.1에서 사용하게 되므로 유지

**완료 기준:**
- [ ] `npm install` 후 에러 없음
- [ ] 빌드 (`npm run build`) 성공
- [ ] 기존 기능 정상 동작 (아이콘 누락 없음)

---

### 2.7 DB 쿼리 병렬화 (P2 5.5)

**대상 파일**: `frontend/app/routes/choonsim.tsx` loader 함수 (16~42행)

**변경 내용:**
현재 4개 쿼리가 순차 실행:
```typescript
// 현재 (순차)
const project = await db.query.choonsimProjects.findFirst(...);
const rawHistory = await db.query.choonsimMetricsHistory.findMany(...);
const revenueResult = await db.select(...);
const milestonesList = await db.query.choonsimMilestones.findMany(...);
```

변경 후:
```typescript
// 개선 (병렬)
const [project, rawHistory, revenueResult, milestonesList] = await Promise.all([
    db.query.choonsimProjects.findFirst(...),
    db.query.choonsimMetricsHistory.findMany(...),
    db.select(...),
    db.query.choonsimMilestones.findMany(...)
]);
```

**완료 기준:**
- [ ] ChoonSim 페이지 정상 렌더링
- [ ] 데이터 표시 결과가 변경 전과 동일

---

## 3. Phase 2: 환경 및 보안 정비

**목표**: 환경변수 관리 체계화, 보안 헤더 설정, git history 정리
**전제 조건**: Phase 1 완료

### 3.1 환경변수 Startup 검증 (P2 5.1)

**대상 파일**: `frontend/app/lib/env.ts` (신규 생성)

**변경 내용:**
1. Zod 스키마로 필수 환경변수 정의:
   ```typescript
   const serverEnvSchema = z.object({
       TURSO_DATABASE_URL: z.string().url(),
       TURSO_AUTH_TOKEN: z.string().min(1),
       GEMINI_API_KEY: z.string().min(1),
       RELAYER_PRIVATE_KEY: z.string().startsWith('0x').length(66),
       CHOONSIM_API_KEY: z.string().min(1),
       BETTER_AUTH_SECRET: z.string().min(16),
   });
   ```
2. 서버 진입점에서 import하여 시작 시 검증
3. `relayer.ts`의 `getEnv()` 헬퍼를 이 모듈로 통합

**완료 기준:**
- [x] 필수 환경변수 누락 시 서버 시작 단계에서 명확한 에러 메시지 (2026-02 구현)
- [x] 모든 환경변수가 설정된 상태에서 정상 구동
- [x] `relayer.ts`, `db/index.ts`, `api.revenue`, `api.chat`에서 `env.ts` getEnv 사용

---

### 3.2 보안 헤더 설정 (P1 4.7)

**대상 파일**: `frontend/vercel.json` (신규 생성 또는 수정)

**변경 내용:**
Vercel 배포 환경에서 보안 헤더 추가:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

**추가 조치:**
- `/api/chat` 엔드포인트: origin 검증으로 외부 직접 호출 차단 (구현함)

**완료 기준:**
- [x] vercel.json에 보안 헤더 설정 (2026-02 구현)
- [x] `/api/chat`에서 Origin !== request.url.origin 시 403 반환
- [ ] 배포 후 브라우저 DevTools로 응답 헤더 확인

---

### 3.3 .env Git History 정리 (P0 3.1)

**주의**: 이 작업은 모든 collaborator에게 영향을 미친다. 사전 공지 필수.

**사전 확인:**
- 리포지토리 공개 여부 (private이면 긴급도 낮음, public이면 즉시 수행)
- 현재 collaborator 수 및 로컬 clone 상태

**절차:**
1. 노출된 모든 API 키 로테이션 (각 서비스 대시보드에서 재발급)
   - OpenAI: https://platform.openai.com/api-keys
   - Google/Gemini: https://aistudio.google.com/apikey
   - Turso: `turso db tokens create`
   - Google Maps: Google Cloud Console
2. BFG Repo-Cleaner로 .env 파일 제거:
   ```bash
   bfg --delete-files '.env.development' --delete-files '.env.production'
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   git push --force
   ```
3. `.gitignore` 확인: `.env*` 패턴이 포함되어 있는지 재검증
4. `.env.example` 업데이트: 모든 필수 변수 키를 나열 (값은 placeholder)
5. collaborator에게 `git pull --rebase` 또는 re-clone 안내

**Phase 2 구현 상태:** 3.1·3.2 코드 반영 완료. 3.3 중 `.env.example` 갱신 및 `.gitignore` 확인 완료. **키 로테이션·BFG·force push는 사용자 수동 실행 필요** (협업자 영향 있음).

**완료 기준:**
- [ ] `git log --all --full-history -- '*.env*'` 결과 없음 (BFG 수동 실행 후)
- [ ] 새 API 키로 모든 서비스 정상 동작 (로테이션 수동)
- [x] `.env.example`에 모든 필수 키 나열

---

## 4. Phase 3: 스마트 컨트랙트 강화 + 재배포

**목표**: 보안 강화 컨트랙트 재배포 및 프론트엔드 주소 갱신
**전제 조건**: Phase 1 완료 (프론트엔드 주소 갱신 로직이 안정적이어야 함)
**영향 범위**: 컨트랙트 재배포 → 신규 주소 발급 → `contracts.ts` + `relayer/config.ts` 갱신 → 재빌드

### 4.1 컨트랙트 수정 사항

#### (A) LiquidityPool.sol - Pausable + SafeERC20 + Bond 검증 (P0 3.4, 3.5 + P1 4.1)

**변경 내용:**
1. OpenZeppelin `Pausable` 상속 추가
2. OpenZeppelin `SafeERC20` 라이브러리 적용 (`using SafeERC20 for IERC20`)
3. `purchaseBond()` 수정:
   - `whenNotPaused` modifier 추가
   - YieldDistributor와 연동하여 bond 등록 여부 검증
   - (선택) Bond별 모집 한도 매핑 추가
4. `withdrawFunds()`: `whenNotPaused` 추가
5. `pause()` / `unpause()` 함수 추가 (ADMIN_ROLE 전용)
6. `transfer` → `safeTransfer`, `transferFrom` → `safeTransferFrom` 교체

**테스트:** `test/LiquidityPool.ts`에 pause/unpause 테스트 추가

#### (B) YieldDistributor.sol - Pausable + SafeERC20 + CEI 수정 + Zero-address (P0 3.4, 3.5 + P1 4.2, 4.5)

**변경 내용:**
1. `Pausable` 상속 추가
2. `SafeERC20` 적용
3. `reinvest()` CEI 패턴 수정:
   ```solidity
   // 변경 후: require 먼저, 상태 변경, 외부 호출 순서
   uint256 reward = userRewards[bondId][msg.sender].rewards;
   require(reward > 0, "No yield to reinvest");
   userRewards[bondId][msg.sender].rewards = 0;
   usdcToken.safeTransfer(liquidityPool, reward);
   IBondToken(bondToken).mint(msg.sender, bondId, reward, "", "");
   ```
   (참고: 현재 코드도 rewards=0 후 transfer이므로 CEI 순서 자체는 맞지만, SafeERC20로 교체하면 revert가 보장되어 문제 해소)
4. Setter 함수에 zero-address 검증 추가:
   ```solidity
   function setBondToken(address _bondToken) external onlyRole(DEFAULT_ADMIN_ROLE) {
       require(_bondToken != address(0), "Zero address");
       bondToken = _bondToken;
   }
   function setLiquidityPool(address _pool) external onlyRole(DEFAULT_ADMIN_ROLE) {
       require(_pool != address(0), "Zero address");
       liquidityPool = _pool;
   }
   ```
5. `depositYield()`, `claimYield()`, `reinvest()`: `whenNotPaused` modifier 추가
6. `setAuditRequirement()`: 이벤트 emit 추가

**테스트:** `test/YieldDistributorV2.test.ts`에 pause, zero-address, SafeERC20 테스트 추가

#### (C) OracleAdapter.sol - SafeERC20 + Zero-address + 이벤트 (P0 3.5 + P1 4.5 + P3 6.5)

**변경 내용:**
1. `SafeERC20` 적용 (63~67행의 transfer/approve 패턴)
2. `setYieldDistributor()`: zero-address 검증 + 이벤트 emit 추가

---

### 4.2 배포 절차

**배포 스크립트**: `contracts/scripts/redeploy_v3.ts` (신규 생성, `redeploy_v2.ts` 기반)

**절차:**
1. `npx hardhat test` - 전체 테스트 통과 확인
2. `npx hardhat run scripts/redeploy_v3.ts --network creditcoin-testnet` 실행
3. 출력된 신규 주소를 기록
4. 역할(Role) 부여 확인:
   - BondToken: MINTER_ROLE → LiquidityPool, YieldDistributor
   - YieldDistributor: BondToken 연결, LiquidityPool 연결, Bond 등록
   - OracleAdapter: YieldDistributor 연결, ORACLE_ROLE 부여

---

### 4.3 프론트엔드 주소 갱신

**대상 파일:**
- `frontend/app/config/contracts.ts` - 6개 컨트랙트 주소 + ABI 갱신
- `relayer/src/config.ts` - ORACLE_ADAPTER_ADDRESS, MOCK_USDC_ADDRESS 갱신
- `CLAUDE.md` - Key Contract Addresses 섹션 갱신
- `docs/03_Specs/01_INFRASTRUCTURE.md` - 배포 상태 테이블 갱신

**완료 기준:**
- [ ] 모든 Hardhat 테스트 통과
- [ ] 테스트넷 배포 성공 및 주소 기록
- [ ] 프론트엔드에서 신규 컨트랙트 정상 호출 확인
- [ ] Growth Market에서 Approve → Deposit 플로우 정상 동작
- [ ] Portfolio에서 Claim / Reinvest 정상 동작
- [ ] Admin 패널에서 Oracle 데이터 업데이트 정상 동작

---

## 5. 범위 외 항목 (P3, 별도 계획 필요)

다음 항목은 본 구현 계획의 범위에 포함하지 않으며, 향후 별도 계획으로 진행한다:

| 항목 | 사유 |
|------|------|
| 모노레포 워크스페이스 (P3 6.1) | 프로젝트 구조 변경으로 별도 계획 필요 |
| 공유 타입 패키지 (P3 6.2) | 워크스페이스 설정과 함께 진행 |
| 컨트랙트 UUPS 업그레이드 (P3 6.3) | 메인넷 전환 시 검토 |
| deploy_all.ts deprecated 처리 (P3 6.4) | Phase 3 배포 시 자연 해소 (v3 스크립트 생성) |
| Relayer 모니터링 체계 (P3 6.6) | 운영 인프라 결정 후 진행 |
| `as any` 타입 개선 (P2 5.2) | Phase 3 ABI 갱신 시 함께 처리 가능 |
| Admin 모듈 리팩토링 (P2 5.3) | 기능 안정화 후 진행 |
| Relayer 데이터 검증 (P2 5.7) | 릴레이어 역할 재정의 후 진행 |

---

## 6. Phase별 완료 기준 총괄

### Phase 1 완료 조건 (2026-02-09 완료)
- [x] 3개 API 라우트 Zod 검증 적용 완료
- [x] Faucet rate limiting 동작 확인 (동일 주소 재요청 차단)
- [x] DEV_FALLBACK_KEY 코드에서 완전 제거
- [x] Chat API dead code 제거
- [x] ErrorBoundary + 404 페이지 동작 확인
- [x] 미사용 의존성 제거 후 빌드 성공
- [x] ChoonSim 페이지 쿼리 병렬화 후 정상 동작
- [x] `npm run build` 성공, 콘솔 에러 없음

### Phase 2 완료 조건
- [ ] 환경변수 누락 시 서버 시작 단계에서 에러 발생 확인
- [ ] 보안 헤더 응답에 포함 확인
- [ ] .env git history 제거 완료 (또는 리포지토리 private 확인 후 보류 판단)
- [ ] 모든 API 키 로테이션 완료

### Phase 3 완료 조건
- [ ] 수정된 컨트랙트 전체 테스트 통과
- [ ] 테스트넷 재배포 성공
- [ ] 프론트엔드 + 릴레이어 주소 갱신 완료
- [ ] E2E 플로우 (Faucet → Invest → Oracle Update → Claim) 정상 동작
- [ ] CLAUDE.md, INFRASTRUCTURE.md 주소 갱신

---

## X. Related Documents
- **Test**: [Code Quality Audit](../05_Test/04_CODE_QUALITY_AUDIT.md) - 본 구현 계획의 근거 문서 (이슈 목록)
- **Foundation**: [Roadmap](../01_Foundation/03_ROADMAP.md) - 전체 프로젝트 로드맵
- **Specs**: [Infrastructure](../03_Specs/01_INFRASTRUCTURE.md) - 컨트랙트 주소 및 배포 환경
- **Specs**: [Revenue Bridge Spec](../03_Specs/02_REVENUE_BRIDGE_SPEC.md) - api.revenue Zod 스키마 참조
- **Logic**: [Backlog](./00_BACKLOG.md) - 전체 작업 현황
- **Logic**: [Audit Logic](./01_AUDIT_LOGIC.md) - 오라클 검증 로직 (Phase 3 연관)
- **Test**: [QA Checklist](../05_Test/02_QA_CHECKLIST.md) - Phase 완료 시 DoD 검증 기준
