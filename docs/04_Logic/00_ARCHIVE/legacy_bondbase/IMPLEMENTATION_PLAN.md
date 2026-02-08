# BuildCTC 개발 구현 계획서

## 1. 프로젝트 구조

```
BuildCTC/
├── contracts/                    # Solidity 스마트 컨트랙트
│   ├── BondToken.sol            # ERC-1155 채권 토큰화 컨트랙트
│   ├── LiquidityPool.sol        # 유동성 풀 관리 컨트랙트
│   ├── YieldDistributor.sol     # 수익 배분 로직 컨트랙트
│   ├── ReservePool.sol          # 리저브 풀 관리 컨트랙트 (예정)
│   ├── OracleAdapter.sol        # Creditcoin Universal Oracle 연동 (예정)
│   ├── interfaces/              # 인터페이스 정의
│   └── libraries/               # 라이브러리 (SafeMath 등)
├── backend/                     # 백엔드 서비스 (Smart Contract 중심 구조로 대체 가능성 있음)
│   ├── api/                     # REST API 엔드포인트
│   │   ├── routes/
│   │   └── middleware/
│   ├── services/                # 비즈니스 로직
│   └── config/                  # 설정 파일
├── frontend/                    # 프론트엔드 애플리케이션
│   ├── app/                     # React Router v7 App Directory
│   │   ├── routes/              # 페이지 라우트
│   │   │   ├── _index.tsx       # 홈 (대시보드)
│   │   │   ├── bonds.tsx        # 채권 마켓
│   │   │   ├── portfolio.tsx    # 포트폴리오
│   │   │   └── settings.tsx     # 설정
│   │   ├── components/          # UI 컴포넌트
│   │   │   ├── bonds/           # 채권 관련
│   │   │   ├── portfolio/       # 포트폴리오 차트 등
│   │   │   └── settings/        # 설정 폼
│   │   ├── config/              # 설정 (contracts.ts 등)
│   │   └── lib/                 # 유틸리티
│   └── public/
├── scripts/                     # 유틸리티 스크립트
│   ├── deploy.ts                # 배포 스크립트
│   └── deploy_all.ts            # 전체 배포 스크립트
└── docs/                        # 문서
    ├── core/                    # 핵심 설계 문서
    ├── reports/                 # 진행 상황 리포트
    └── roadmap/                 # 로드맵
```

## 2. 기술 스택 (Updated)

### 2.1 스마트 컨트랙트
- **언어**: Solidity ^0.8.20 (EVM Version: `paris`)
- **프레임워크**: Hardhat
- **테스트**: Hardhat Test (Mocha/Chai)
- **배포**: Hardhat Scripts
- **네트워크**: Creditcoin Testnet (Chain ID: 102031) (EVM 호환)
- **표준**: 
  - ERC-1155 (BondToken)
  - ERC-20 (MockUSDC)
  - OpenZeppelin AccessControl, ReentrancyGuard

### 2.2 백엔드 (Optional/Hybrid)
- **런타임**: Node.js 18+
- **데이터베이스**: Turso (SQLite) - 사용자 프로필 등 오프체인 데이터
- **ORM**: Drizzle ORM
- **인증**: Better Auth (Cookie Session) + Wallet Auth (SIWE 예정)

### 2.3 프론트엔드
- **프레임워크**: React Router v7 (Vite)
- **상태 관리**: @tanstack/react-query (Server State), Local State
- **스타일링**: Tailwind CSS v3.4, shadcn/ui
- **Web3 연동**: 
  - **wagmi**: React Hooks for Ethereum
  - **viem**: Low-level Interface
- **차트**: Recharts
- **지도**: Google Maps API (예정)
- **날짜/시간**: Luxon

## 3. 스마트 컨트랙트 설계 (Current Status)

### 3.1 BondToken.sol (Deployed)
- **Address**: `frontend/app/config/contracts.ts` 참조
- **기능**: ERC-1155 기반, `RoleBased` AccessControl, 동적 URI 설정.

### 3.2 LiquidityPool.sol (Deployed)
- **Address**: `frontend/app/config/contracts.ts` 참조
- **기능**: USDC 예치(Deposit), 채권 구매(Invest), 관리자 인출.

### 3.3 YieldDistributor.sol (Deployed)
- **Address**: `frontend/app/config/contracts.ts` 참조
- **기능**: Synthetix 스타일 `RewardPerToken` 알고리즘 기반 수익 배분.

### 3.4 MockUSDC.sol (Deployed)
- **Address**: `frontend/app/config/contracts.ts` 참조
- **기능**: 테스트용 ERC-20 토큰 (Faucet 기능 포함).

## 4. 프론트엔드 구현 상태
- **대시보드**: `/` (기본 레이아웃 및 요약 정보)
- **채권 마켓**: `/bonds` (필터링, 검색, 모달을 통한 투자 UX)
- **포트폴리오**: `/portfolio` (자산 현황 차트, 투자 리스트)
- **설정**: `/settings` (프로필, 지갑 관리 UI)

## 8. 개발 단계별 계획 (Progress Tracker)

### Phase 1: 기초 인프라 (완료)
- [x] **프로젝트 설정**
   - [x] Hardhat 프로젝트 초기화 (`evmVersion: paris` 설정)
   - [x] React Router v7 프론트엔드 스캐폴딩
   - [x] Tailwind CSS & shadcn/ui 설정
   - [x] 문서 구조화 (`docs/`)

- [x] **스마트 컨트랙트 기본 구조**
   - [x] BondToken.sol 구현 (ERC-1155)
   - [x] MockUSDC.sol 구현 (ERC-20)
   - [x] 단위 테스트 작성 (BondToken)

- [x] **로컬 개발 환경 & 배포**
   - [x] Hardhat 로컬 네트워크 테스트
   - [x] Creditcoin Testnet 배포 스크립트 작성 (`deploy_all.ts`)
   - [x] Testnet 배포 완료 및 주소 확보

### Phase 2: 핵심 기능 (진행 중)
- [x] **유동성 풀 구현**
   - [x] LiquidityPool.sol 완성
   - [x] 예치/인출 로직 구현
   - [x] 채권 구매(Invest) 연동 (`purchaseBond`)
   - [x] AccessControl 권한 설정 (Mininter Role)

- [x] **수익 배분 시스템**
   - [x] YieldDistributor.sol 구현
   - [x] `rewardPerToken` 기반 수익 계산 로직
   - [x] Staking(예치) 및 Claim(수령) 로직
   - [x] 단위 테스트 통과

- [x] **프론트엔드-블록체인 연동** (부분 완료, 버그 수정 필요)
   - [x] `purchaseBond` 함수 호출 구현 ✅
   - [x] `claimYield`, `reinvest` 함수 호출 구현 ✅
   - [x] `balanceOfBatch` 데이터 조회 구현 ✅
   - [ ] `portfolio.tsx` 버그 수정 (bondId 파라미터 누락) ⚠️

- [ ] **오라클 연동** (다음 마일스톤)
   - [ ] Phase 1: MockOracle.sol 구현
   - [ ] Phase 2: OracleAdapter.sol 구현
   - [ ] Phase 3: 백엔드 오라클 서비스 구성
   - [ ] Creditcoin Universal Oracle 연동

### Phase 3: 리스크 관리 (예정)
- [ ] **리저브 풀**
   - [ ] ReservePool.sol 구현
   - [ ] 손실 보상 로직

- [ ] **디폴트 처리**
   - [ ] 디폴트 감지 시스템
   - [ ] 투자자 알림

### Phase 4: UI/UX (부분 완료)
- [x] **투자자 대시보드**
   - [x] 기본 레이아웃 (Sidebar, Header)
   - [x] 채권 목록 및 상세 모달 (Bond Market)
   - [x] 포트폴리오 페이지 (Chart, List)
   - [x] 설정 페이지 (Profile, Wallet UI)

- [x] **Web3 연동** (완료, 일부 버그 존재)
   - [x] `wagmi` / `viem` 설정
   - [x] 지갑 연결 (Connect Wallet) 기능 구현
   - [x] 컨트랙트 데이터 바인딩 (Balance, Invest, Claim)
   - [x] `purchaseBond`, `claimYield`, `reinvest` 실제 호출 구현
   - [ ] `portfolio.tsx` 버그 수정 필요 (Section 9.2 참조)

- [ ] **임팩트 시각화**
   - [ ] 지도 통합
   - [ ] ESG 지표 시각화

### Phase 5 ~ 6 (이후 계획)
- [ ] Gateway 통합 (Cross-chain)
- [ ] 보안 감사 및 최적화
- [ ] 메인넷 배포 준비

## 9. 현재 프로젝트 상태 및 알려진 이슈 (Latest Review: 2026-01-16)

> **참고**: 전체 검토 내용은 `docs/reports/18_project_review_report.md`를 참조하세요.

### 9.1 현재 진행 상태 요약

#### 완료된 주요 기능 ✅
- [x] 스마트 컨트랙트 개발 및 배포 (Creditcoin Testnet)
  - MockUSDC, BondToken (v2), LiquidityPool, YieldDistributor (v2)
- [x] 프론트엔드 기본 구조 및 UI 컴포넌트
- [x] Web3 연동 (`wagmi`/`viem`) - 지갑 연결, 컨트랙트 호출 구현
- [x] 데이터베이스 스키마 설계 (Drizzle ORM)

#### 진행 중 🚧
- [ ] 프론트엔드-블록체인 연동 (부분 완료, 버그 수정 필요)
- [ ] 오라클 연동 (설계 완료, 구현 대기)
- [ ] 백엔드 API 개발 (미시작)

#### 미시작 ❌
- [ ] 리저브 풀 구현
- [ ] Gateway 통합 (크로스체인)
- [ ] KYC/AML 시스템
- [ ] 보안 감사

### 9.2 알려진 버그 및 이슈

#### Critical (즉시 수정 필요) ⚠️
1. **프론트엔드 버그**
   - `portfolio.tsx`의 `earned` 함수 호출 시 `bondId` 파라미터 누락
     - 컨트랙트 시그니처: `earned(address account, uint256 bondId)`
     - 현재: `args: [address]`만 전달
   - `portfolio.tsx`의 `claimYield` 호출 시 `bondId` 파라미터 누락
     - 컨트랙트 시그니처: `claimYield(uint256 bondId)`
     - 현재: `args` 없이 호출

#### High Priority
2. **테스트 스크립트 미설정**
   - `contracts/package.json`에 `"test": "hardhat test"` 스크립트 추가 필요

3. **환경 변수 보안 검증**
   - `.env*` 파일이 Git에 커밋되지 않았는지 확인 필요
   - `git log --all --full-history -- "*.env*"` 명령어로 검증 권장

### 9.3 즉시 조치 사항

#### Critical (즉시 처리)
1. [ ] 프론트엔드 버그 수정 (`portfolio.tsx`의 `earned`, `claimYield` 호출)
2. [ ] 테스트 스크립트 추가 (`contracts/package.json`)
3. [ ] 환경 변수 보안 검증

#### High Priority (1주일 내)
4. [ ] 오라클 연동 구현 시작 (Phase 1: MockOracle.sol)
5. [ ] 백엔드 API 기본 구조 구축

### 9.4 기술 부채

1. **Mock 데이터 의존**
   - 프론트엔드에서 채권 목록 등 Mock 데이터 사용 중
   - 실제 블록체인 데이터 연동 필요

2. **하드코딩된 컨트랙트 주소**
   - `frontend/app/config/contracts.ts`에 주소 직접 입력
   - 네트워크별 동적 설정 개선 필요

3. **타입 안전성 개선**
   - 프론트엔드에서 컨트랙트 ABI 타입 생성 (`typechain`) 활용 검토
   - 현재 수동으로 ABI 정의 중

## 10. 보안 및 배포 전략 (Refined)

### 10.1 배포 현황
- **Network**: Creditcoin Testnet
- **Deployed Contracts**:
  - MockUSDC, BondToken, LiquidityPool, YieldDistributor
- **Configuration**:
  - Frontend: `frontend/app/config/contracts.ts`에 주소 및 ABI 관리

### 10.2 향후 보안 계획
- [ ] `dotenv`를 통한 환경 변수 관리 강화 (진행 중)
- [ ] 배포 전 `slither` 등을 이용한 정적 분석 수행
- [ ] 주요 권한(Admin Role) 관리자 지갑 분리
- [ ] 멀티시그 지갑 도입 검토

## 11. 문서화
- [x] 구현 계획서 (`IMPLEMENTATION_PLAN.md`)
- [x] 단계별 리포트 (`docs/reports/`)
  - `docs/reports/18_project_review_report.md`: 프로젝트 종합 검토 보고서 (2026-01-16)
  - [x] 오라클 연동 설계 (`docs/core/14_oracle_integration_architecture.md`)
- [ ] API 문서 (백엔드 구축 시)
- [ ] 사용자 가이드 (최종 릴리스 시)
- [ ] 배포 가이드
- [ ] 보안 감사 리포트