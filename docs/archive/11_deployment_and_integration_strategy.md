# 11_Deployment & Integration Strategy

## 1. 개요 (Overview)
본 문서는 앞서 개발된 스마트 컨트랙트(Task 07, 09, 10)를 블록체인 네트워크(Creditcoin Testnet)에 배포하고, 이를 프론트엔드 애플리케이션과 유기적으로 연결하기 위한 통합 전략을 정의합니다. "코드 작성 -> 배포 -> 연동"의 정석적인 흐름을 따릅니다.

- **관련 작업**: Task 11 (Smart Contract Integration Setup)
- **일자**: 2026-01-15
- **상태**: 계획 (Planned)

## 2. 배포 전략 (Deployment Strategy)

### 2.1 배포 순서 및 의존성
컨트랙트 간의 참조 관계를 고려하여 다음 순서로 배포를 진행해야 오류가 없습니다.

1.  **MockUSDC**: 독립적임. (USDC 주소 생성)
2.  **BondToken**: 독립적임. (BondToken 주소 생성)
3.  **LiquidityPool**: `USDC Address`, `BondToken Address`가 필요함.
4.  **YieldDistributor**: `USDC Address`, `BondToken Address`가 필요함.

### 2.2 권한 설정 자동화 (Configuration Script)
배포 직후, 컨트랙트가 정상 동작하기 위해 필요한 권한을 스크립트에서 자동으로 부여합니다.
- `BondToken`의 `MINTER_ROLE` -> `LiquidityPool`에 부여 (자동 발행 위함)
- `BondToken`의 `URI_SETTER_ROLE` -> `Deployer`유지 (추후 관리자용)

### 2.3 배포 목표 환경
- **Network**: Creditcoin Testnet (EVM Compatible)
- **Tool**: Hardhat Script (`deploy_all.ts`)

## 3. 프론트엔드 연동 전략 (Frontend Integration)

### 3.1 라이브러리 선정
- **Client**: `viem` (가볍고 빠른 로우레벨 인터페이스)
- **Hooks**: `wagmi` (React 친화적인 상태 관리 및 훅 제공)
- **UI Kit**: `RainbowKit` 또는 순수 `wagmi` 커스텀 UI (디자인 통일성 고려)
  - *Decision*: 현재 shadcn/ui 디자인 시스템을 유지하기 위해, `wagmi` 훅을 사용하여 커스텀 Connect Button을 구현하는 것을 권장.

### 3.2 디렉토리 구조 및 파일
```
frontend/
├── app/
│   ├── config/
│   │   └── wagmi.ts         # 체인 설정, 클라이언트 생성
│   ├── hooks/
│   │   ├── use-web3.ts      # 지갑 연결 상태 훅
│   │   └── use-contract/    # 컨트랙트별 전용 훅
│   │       ├── use-bond.ts
│   │       └── use-pool.ts
│   └── components/
│       └── wallet/
│           └── connect-button.tsx # 커스텀 지갑 연결 버튼
```

## 4. 실행 계획 (Action Plan)

1.  **배포 스크립트 작성 (`contracts/scripts/deploy_all.ts`)**:
    - 4개 컨트랙트 순차 배포 및 주소 출력.
    - `grantRole` 트랜잭션 실행.
    - 배포된 주소와 ABI를 프론트엔드(`frontend/app/config/contracts.json`)로 자동 복사하거나 로그로 출력.
2.  **배포 실행 (Execute Deployment)**:
    - 테스트넷 배포 수행.
3.  **프론트엔드 설정 (Setup Frontend)**:
    - `npm install wagmi viem @tanstack/react-query`
    - `wagmi.ts` 설정.
4.  **핵심 기능 연동**:
    - 지갑 연결 (Connect Wallet)
    - 내 보유 채권 조회 (Read BondToken)
    - 투자하기 (Approve -> Deposit)

## 5. 비고 (Notes)
- 배포 시 Private Key 노출 주의 (`.env` 관리 필수).
- 테스트넷 가스비(CTC) 사전 확보 필요.
