# 인프라 및 개발 환경 (Infrastructure & Environment)
> Created: 2026-01-24 23:38
> Last Updated: 2026-02-09

본 문서는 BondBase 프로젝트의 네트워크 설정, 외부 서비스 엔드포인트 및 배포 환경에 대한 최신 정보를 관리합니다.

## 1. Blockchain Network (Creditcoin 3.0)

현재 스마트 컨트랙트 배포 및 테스트를 위해 **Creditcoin 3.0 (CC3) Testnet**을 사용합니다.

- **Network Name**: `creditcoin-testnet`
- **RPC URL**: `https://rpc.cc3-testnet.creditcoin.network`
- **Chain ID**: `102031`
- **Currency**: `CTC` (Testnet)
- **Explorer**: [Creditcoin Explorer](https://explorer.creditcoin.org)
- **Primary Wallet Address**: `0xf42138298fa1Fc8514BC17D59eBB451AceF3cDBa`
- **Contract Environment**: Hardhat / Foundry (EVM Compatible)

## 2. Database & Storage

데이터 무결성 및 고성능 조회를 위해 하이브리드 저장 구조를 사용합니다.

- **Primary Database**: Turso (libSQL/SQLite)
- **ORM**: Drizzle ORM
- **Media Storage**: Cloudinary (이미지 및 영상 자산 호스팅)
- **Vector Search**: Turso Vector Search (RAG 시스템용)

## 3. Backend & API Services

- **Runtime**: Node.js 18+ (TypeScript)
- **Hosting**: Vercel (Node.js Edge Runtime 또는 API Routes)
- **Authentication**: Better Auth (Session-based)
- **Oracle**: Creditcoin Universal Oracle (실물 자산 데이터 연동용)

## 4. Tokenomics (Choonsim Growth Model)

춘심 프로젝트의 지속 가능성과 경제적 안정을 위해 다음 세 가지 자산이 상호 보완적으로 작동합니다.

- **Native Coin (CTC)**: Creditcoin 네트워크의 연료입니다. 모든 트랜잭션 수수료(Gas Fee)를 지불하는 데 사용되며, 네트워크의 보안과 처리 속도를 보장합니다.
- **ERC-1155 (ChoonsimBond)**: 단순한 코인이 아닌 '특정한 권리'가 담긴 증서입니다. 춘심이의 성장에 대한 수익권(Revenue Share Right)과 거버넌스 투표권, 한정판 대화 권한 등을 포함하는 다기능 토큰으로, 각 마일스톤이나 자산 등급별로 세밀하게 발행됩니다.
- **ERC-20 (MockUSDC)**: 실제 경제 활동의 척도가 되는 스테이블코인입니다. CTC의 가격 변동성에 영향받지 않고, 투자자가 투입한 금액과 돌려받을 배당금(Yield)을 안정적인 법정화폐 가치에 고정하여 지급하기 위한 기초 통화로 활용됩니다.

## 5. Frontend Environment

- **Framework**: React Router v7 (Vite)
- **Styling**: Tailwind CSS v4
- **Date/Time Standard**: **Luxon** (Asia/Seoul 기준 우선 처리)
- **Hosting**: Vercel

## 6. Deployment Status (Current)

| Module | Env | Status | Last Deployment |
| :--- | :--- | :--- | :--- |
| Smart Contracts | Testnet | Active (v3) | 2026-02-09 |
| Dashboard App | Dev | Active | 2026-01-24 |
| RAG Engine | Dev | Integrated | 2026-01-24 |

## 7. V3 Contract Addresses (Creditcoin Testnet)

| Contract | Address | 비고 |
| :--- | :--- | :--- |
| MockUSDC (V3) | `0x03E7d375e76A105784BFF5867f608541e89D311B` | 프론트/릴레이어 기본 USDC |
| BondToken (V3) | `0x01607c3Ff57e3234702f55156E4356e3036f8D4E` | ERC-1155 |
| YieldDistributor (V3) | `0x0D38d19dA1dC7F018d9B31963860A39329bf6974` | Bond 101 등록·DISTRIBUTOR_ROLE 설정 완료 |
| LiquidityPool (V3) | `0xC86F94d895331855C9ac7E43a9d96cf285512B31` | |
| OracleAdapter (V3) | `0xDaD165Ba828bD90f0e4897D92005bb1660f4785f` | 선택 B 적용, V3 YD + V3 MockUSDC |

완료 항목·잔여 작업·OracleAdapter 선택 A/B는 [05_V3_DEPLOYMENT_STATUS.md](./05_V3_DEPLOYMENT_STATUS.md) 참조.

---

## X. Related Documents
- **Foundation**: [Project Overview](../01_Foundation/00_PROJECT_OVERVIEW.md) - 전체 프로젝트 비전
- **Foundation**: [Roadmap](../01_Foundation/03_ROADMAP.md) - 개발 단계 로드맵
- **Specs**: [Revenue Bridge Spec](./02_REVENUE_BRIDGE_SPEC.md) - 수익 연동 API 명세
- **Specs**: [V3 배포 완료 항목 및 잔여 작업](./05_V3_DEPLOYMENT_STATUS.md) - 완료/잔여 체크리스트, OracleAdapter 선택
