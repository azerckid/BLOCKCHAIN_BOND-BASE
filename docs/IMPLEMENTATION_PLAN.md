# BuildCTC 개발 구현 계획서

## 1. 프로젝트 구조

```
BuildCTC/
├── contracts/                    # Solidity 스마트 컨트랙트
│   ├── BondToken.sol            # ERC-1155 채권 토큰화 컨트랙트
│   ├── LiquidityPool.sol        # 유동성 풀 관리 컨트랙트
│   ├── YieldDistributor.sol     # 수익 배분 로직 컨트랙트
│   ├── ReservePool.sol          # 리저브 풀 관리 컨트랙트
│   ├── OracleAdapter.sol        # Creditcoin Universal Oracle 연동
│   ├── interfaces/              # 인터페이스 정의
│   └── libraries/               # 라이브러리 (SafeMath 등)
├── backend/                     # 백엔드 서비스
│   ├── api/                     # REST API 엔드포인트
│   │   ├── routes/
│   │   │   ├── bonds.ts         # 채권 관련 API
│   │   │   ├── pool.ts          # 유동성 풀 API
│   │   │   ├── yield.ts         # 수익 배분 API
│   │   │   └── oracle.ts        # 오라클 연동 API
│   │   └── middleware/          # 인증, 검증 등
│   ├── services/                # 비즈니스 로직
│   │   ├── tokenization/        # 토큰화 서비스
│   │   ├── yield/               # 수익 계산 및 배분
│   │   ├── oracle/              # 오라클 데이터 처리
│   │   └── risk/                # 리스크 관리
│   ├── database/                # 데이터베이스
│   │   ├── schema/              # DB 스키마
│   │   ├── migrations/          # 마이그레이션
│   │   └── models/              # 데이터 모델
│   └── config/                  # 설정 파일
├── frontend/                    # 프론트엔드 애플리케이션
│   ├── dashboard/               # 투자자 대시보드
│   │   ├── components/
│   │   │   ├── BondCard.tsx     # 채권 카드 컴포넌트
│   │   │   ├── PoolStats.tsx    # 풀 통계
│   │   │   ├── YieldChart.tsx   # 수익 차트
│   │   │   └── ImpactMap.tsx    # 소셜 임팩트 지도
│   │   └── pages/
│   │       ├── Invest.tsx       # 투자 페이지
│   │       ├── Portfolio.tsx    # 포트폴리오
│   │       └── Impact.tsx       # 임팩트 대시보드
│   ├── admin/                   # 관리자 패널
│   └── shared/                  # 공통 컴포넌트
├── gateway/                     # 크로스체인 Gateway 연동
│   ├── ethereum/                # 이더리움 브릿지
│   ├── polygon/                 # 폴리곤 브릿지
│   └── adapters/                # Gateway 어댑터
├── scripts/                     # 유틸리티 스크립트
│   ├── deploy.ts                # 배포 스크립트
│   ├── seed.ts                  # 테스트 데이터 생성
│   └── oracle-sync.ts           # 오라클 동기화
├── tests/                       # 테스트
│   ├── contracts/               # 컨트랙트 테스트
│   ├── backend/                 # 백엔드 테스트
│   └── integration/             # 통합 테스트
└── docs/                        # 문서
    ├── core/                    # 핵심 설계 문서
    ├── features/                # 기능별 문서
    ├── roadmap/                 # 로드맵
    └── guides/                  # 개발 가이드
```

## 2. 기술 스택

### 2.1 스마트 컨트랙트
- **언어**: Solidity ^0.8.20
- **프레임워크**: Hardhat 또는 Foundry
- **테스트**: Hardhat Test 또는 Forge
- **배포**: Hardhat Deploy 또는 스크립트
- **표준**: 
  - ERC-1155 (Multi Token Standard)
  - ERC-20 (USDC 등 스테이블코인)
  - OpenZeppelin Contracts

### 2.2 백엔드
- **런타임**: Node.js 18+ 또는 Python 3.13+
- **프레임워크**: 
  - Node.js: Express.js 또는 Fastify
  - Python: FastAPI
- **데이터베이스**: Turso (SQLite)
- **ORM**: Drizzle ORM
- **인증**: Better Auth
- **검증**: Zod (TypeScript)

### 2.3 프론트엔드
- **프레임워크**: React 18+ (React Router v7 Framework)
- **상태 관리**: Zustand 또는 Redux Toolkit
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui
- **차트**: Recharts 또는 Chart.js
- **지도**: Google Maps API 또는 Mapbox
- **지갑 연동**: ethers.js 또는 viem
- **날짜/시간**: Luxon

### 2.4 인프라
- **블록체인**: Creditcoin 2.0 (EVM 호환)
- **오라클**: Creditcoin Universal Oracle
- **Gateway**: Creditcoin Gateway
- **호스팅**: 
  - 백엔드: Vercel, AWS, 또는 Railway
  - 프론트엔드: Vercel 또는 Netlify
  - 데이터베이스: Turso

## 3. 스마트 컨트랙트 설계

### 3.1 BondToken.sol (ERC-1155)
```solidity
// 주요 기능:
// - 채권 토큰 발행 (mint)
// - 분할 토큰 전송 (transfer)
// - 메타데이터 관리 (URI)
// - 소각 (burn)
// - 총 공급량 조회
```

**주요 함수**:
- `mintBond(address to, uint256 bondId, uint256 amount, bytes calldata data)`: 채권 토큰 발행
- `getBondInfo(uint256 bondId)`: 채권 정보 조회
- `updateBondStatus(uint256 bondId, BondStatus status)`: 채권 상태 업데이트

### 3.2 LiquidityPool.sol
```solidity
// 주요 기능:
// - USDC 예치 (deposit)
// - USDC 인출 (withdraw)
// - 채권 구매 (buyBond)
// - 채권 판매 (sellBond)
// - 유동성 풀 통계 조회
```

**주요 함수**:
- `deposit(uint256 amount)`: USDC 예치
- `withdraw(uint256 amount)`: USDC 인출
- `buyBond(uint256 bondId, uint256 amount)`: 채권 구매
- `getPoolBalance()`: 풀 잔액 조회
- `getAvailableBonds()`: 구매 가능한 채권 목록

### 3.3 YieldDistributor.sol
```solidity
// 주요 기능:
// - 오라클로부터 상환 데이터 수신
// - 투자자별 수익 계산
// - USDC로 수익 배분
// - 자동 재투자 옵션
```

**주요 함수**:
- `distributeYield(uint256 bondId, uint256 repaymentAmount)`: 수익 배분
- `calculateYield(uint256 bondId, address investor)`: 개별 수익 계산
- `claimYield(uint256 bondId)`: 수익 청구
- `setAutoReinvest(address investor, bool enabled)`: 자동 재투자 설정

### 3.4 ReservePool.sol
```solidity
// 주요 기능:
// - 리저브 풀 자금 관리
// - 디폴트 손실 보상
// - 최소 유지 비율 관리
```

**주요 함수**:
- `depositReserve(uint256 amount)`: 리저브 풀 예치
- `withdrawReserve(uint256 amount)`: 리저브 풀 인출 (제한적)
- `coverLoss(uint256 bondId, uint256 lossAmount)`: 손실 보상
- `getReserveRatio()`: 리저브 비율 조회

### 3.5 OracleAdapter.sol
```solidity
// 주요 기능:
// - Creditcoin Universal Oracle 연동
// - 상환 데이터 검증
// - 이벤트 발생
```

**주요 함수**:
- `requestRepaymentData(uint256 bondId)`: 상환 데이터 요청
- `fulfillRepaymentData(uint256 bondId, uint256 amount)`: 오라클 콜백
- `verifyOracleData(bytes32 requestId)`: 데이터 검증

## 4. 백엔드 서비스 설계

### 4.1 토큰화 서비스 (tokenization/)
- **기능**:
  - 실물 대출 채권 데이터 수집
  - 채권 메타데이터 생성
  - 스마트 컨트랙트 토큰 발행 트리거
  - 토큰 상태 동기화

### 4.2 수익 서비스 (yield/)
- **기능**:
  - 오라클 데이터 수신 및 처리
  - 투자자별 수익 계산
  - 배분 스케줄링
  - 재투자 로직 처리

### 4.3 오라클 서비스 (oracle/)
- **기능**:
  - Creditcoin Universal Oracle 연동
  - 상환 데이터 폴링
  - 데이터 검증 및 변환
  - 스마트 컨트랙트 트랜잭션 트리거

### 4.4 리스크 관리 서비스 (risk/)
- **기능**:
  - 디폴트 감지
  - 리저브 풀 관리
  - 손실 분산 계산
  - 신용 점수 업데이트

## 5. 데이터베이스 스키마

### 5.1 주요 테이블

**bonds** (채권)
- id (UUID)
- bond_id (uint256, on-chain)
- borrower_info (JSON)
- region (string)
- business_type (string)
- loan_amount (decimal)
- interest_rate (decimal)
- maturity_date (timestamp)
- credit_score (integer)
- status (enum)
- created_at, updated_at

**investors** (투자자)
- id (UUID)
- wallet_address (string, unique)
- kyc_status (enum)
- total_invested (decimal)
- total_yield (decimal)
- auto_reinvest (boolean)
- created_at, updated_at

**investments** (투자 내역)
- id (UUID)
- investor_id (UUID, FK)
- bond_id (UUID, FK)
- token_amount (decimal)
- usdc_amount (decimal)
- transaction_hash (string)
- created_at

**yield_distributions** (수익 배분)
- id (UUID)
- bond_id (UUID, FK)
- investor_id (UUID, FK)
- yield_amount (decimal)
- distribution_date (timestamp)
- transaction_hash (string)
- created_at

**repayments** (상환 내역)
- id (UUID)
- bond_id (UUID, FK)
- repayment_amount (decimal)
- repayment_date (timestamp)
- oracle_request_id (string)
- transaction_hash (string)
- created_at

**reserve_pool** (리저브 풀)
- id (UUID)
- total_reserve (decimal)
- minimum_ratio (decimal)
- last_updated (timestamp)

## 6. API 엔드포인트 설계

### 6.1 채권 API (/api/bonds)
- `GET /api/bonds`: 채권 목록 조회
- `GET /api/bonds/:id`: 채권 상세 정보
- `GET /api/bonds/:id/investors`: 채권 투자자 목록
- `GET /api/bonds/:id/repayments`: 상환 이력

### 6.2 유동성 풀 API (/api/pool)
- `GET /api/pool/stats`: 풀 통계
- `GET /api/pool/balance`: 풀 잔액
- `POST /api/pool/deposit`: 예치 요청
- `POST /api/pool/withdraw`: 인출 요청

### 6.3 수익 API (/api/yield)
- `GET /api/yield/portfolio`: 포트폴리오 수익
- `GET /api/yield/history`: 수익 이력
- `POST /api/yield/claim`: 수익 청구
- `POST /api/yield/reinvest`: 재투자 설정

### 6.4 오라클 API (/api/oracle)
- `POST /api/oracle/request`: 오라클 데이터 요청
- `GET /api/oracle/status/:requestId`: 요청 상태 조회

## 7. 프론트엔드 페이지 설계

### 7.1 투자자 대시보드
- **홈**: 전체 통계, 최신 채권, 수익 요약
- **투자**: 채권 목록, 필터링, 상세 정보, 투자 실행
- **포트폴리오**: 보유 채권, 수익 현황, 차트
- **임팩트**: 지역별 분포, 사업 유형, ESG 지표

### 7.2 관리자 패널
- **채권 관리**: 채권 등록, 상태 업데이트
- **유동성 풀 관리**: 풀 모니터링, 설정
- **수익 배분**: 배분 실행, 이력 조회
- **리스크 관리**: 디폴트 처리, 리저브 풀 관리

## 8. 개발 단계별 계획

### Phase 1: 기초 인프라 (4-6주)
1. **프로젝트 설정**
   - Hardhat/Foundry 프로젝트 초기화
   - 백엔드 프로젝트 설정
   - 프론트엔드 프로젝트 설정
   - 데이터베이스 스키마 설계

2. **스마트 컨트랙트 기본 구조**
   - BondToken.sol 구현
   - 기본 인터페이스 정의
   - 단위 테스트 작성

3. **로컬 개발 환경**
   - Hardhat 네트워크 설정
   - 데이터베이스 마이그레이션
   - 기본 API 엔드포인트

### Phase 2: 핵심 기능 (6-8주)
1. **유동성 풀 구현**
   - LiquidityPool.sol 완성
   - 예치/인출 로직
   - 채권 구매/판매 로직

2. **수익 배분 시스템**
   - YieldDistributor.sol 구현
   - 수익 계산 로직
   - 배분 스케줄링

3. **오라클 연동**
   - OracleAdapter.sol 구현
   - 백엔드 오라클 서비스
   - 데이터 동기화

### Phase 3: 리스크 관리 (4-6주)
1. **리저브 풀**
   - ReservePool.sol 구현
   - 손실 보상 로직
   - 비율 관리

2. **디폴트 처리**
   - 디폴트 감지 시스템
   - 손실 분산 로직
   - 투자자 알림

### Phase 4: UI/UX (6-8주)
1. **투자자 대시보드**
   - 기본 레이아웃
   - 채권 목록 및 상세
   - 포트폴리오 페이지

2. **임팩트 시각화**
   - 지도 통합
   - 차트 및 그래프
   - ESG 지표

3. **관리자 패널**
   - 채권 관리 UI
   - 풀 모니터링
   - 수익 배분 관리

### Phase 5: Gateway 통합 (4-6주)
1. **크로스체인 브릿지**
   - 이더리움 Gateway 연동
   - 폴리곤 Gateway 연동
   - 자산 전송 테스트

### Phase 6: 테스트 및 보안 (4-6주)
1. **통합 테스트**
   - 전체 플로우 테스트
   - 스트레스 테스트
   - 보안 감사

2. **최적화**
   - 가스 최적화
   - 성능 튜닝
   - UI/UX 개선

## 9. 보안 고려사항

### 9.1 스마트 컨트랙트 보안
- OpenZeppelin Contracts 사용
- 재진입 공격 방지 (ReentrancyGuard)
- 오버플로우 방지 (SafeMath)
- 접근 제어 (Ownable, AccessControl)
- 외부 감사 (Audit) 필수

### 9.2 오라클 보안
- 다중 오라클 검증
- 데이터 신뢰도 점수
- 이상치 감지

### 9.3 백엔드 보안
- API 인증 (JWT)
- Rate Limiting
- 입력 검증 (Zod/Pydantic)
- SQL Injection 방지

## 10. 배포 전략

### 10.1 테스트넷 배포
- Creditcoin 테스트넷
- 로컬 테스트
- 통합 테스트

### 10.2 메인넷 배포
- 단계적 롤아웃
- 멀티시그 지갑
- 업그레이드 가능한 컨트랙트 (Proxy Pattern)

## 11. 모니터링 및 유지보수

### 11.1 모니터링
- 블록체인 이벤트 모니터링
- API 성능 모니터링
- 오류 추적 (Sentry 등)

### 11.2 알림
- 디폴트 알림
- 리저브 풀 임계값 알림
- 시스템 오류 알림

## 12. 문서화

### 12.1 기술 문서
- API 문서 (OpenAPI/Swagger)
- 컨트랙트 ABI 및 인터페이스
- 아키텍처 다이어그램

### 12.2 사용자 문서
- 투자자 가이드
- 관리자 매뉴얼
- FAQ
