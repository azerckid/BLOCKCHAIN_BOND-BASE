# AGENTS.md (BondBase - Project Specific Context)

이 파일은 **BondBase (RWA Yield Protocol)** 프로젝트에 특화된 기술적 맥락과 비즈니스 로직을 담고 있습니다. 공통적인 커뮤니케이션 규칙 및 안전 가이드는 Antigravity 시스템의 **Customizations (Global Rules)** 설정을 따릅니다.

## 1. Project Overview
BuildCTC는 Creditcoin 2.0 기반의 실물 자산(RWA) 수익률 프로토콜입니다. 두 가지 투자 모델을 지원합니다:

1. **Legacy Assets**: 신흥 시장(태국 등) 소상공인 대출 채권 토큰화
2. **IP Rights (Primary)**: Choonsim (춘심) AI-Talk IP 글로벌 확장 투자

### Core Value Proposition
- **Asset Tokenization**: ERC-1155를 이용한 채권/IP Rights 분할 토큰화.
- **Real-World Yield**: Creditcoin 네트워크에 기록된 실물 대출 이자 및 IP 구독 수익 기반 배분.
- **IP Growth Model**: 팔로워/구독자 성장 마일스톤 달성 시 보너스 수익 배분.
- **Transparency**: 대출 이력 및 IP 성장 지표를 온체인으로 관리하여 대시보드에서 투명하게 확인.

## 2. Tech Stack & Integration

### Smart Contracts
- **Solidity**: ^0.8.20 (Hardhat / Foundry 사용)
- **Standards**: ERC-1155, ERC-20 (OpenZeppelin)
- **Blockchain**: Creditcoin 2.0 (EVM Compatible)
- **Oracle**: Creditcoin Universal Oracle (실물 상환 데이터 및 IP 메트릭스 연동)

### Frontend (React Router v7)
- **Framework**: React Router v7 (Strict Loader/Action 패턴 준수)
- **Styling**: Tailwind CSS v4 (Custom At-rules 사용)
- **State/Data**: UI는 shadcn/ui, 데이터 검증은 zod, 날짜 처리는 **Luxon** 사용.

### Backend & Database
- **Runtime**: Node.js (TypeScript)
- **Database**: Turso (SQLite) + Drizzle ORM
- **Authentication**: Better Auth
- **Key Tables**: `bonds`, `investors`, `investments`, `choonsimProjects`, `choonsimRevenue`, `choonsimMilestones`

## 3. Setup Commands

### 개발 환경 구축
- **Frontend/General**: `npm install` -> `npm run dev`
- **Smart Contracts**: `npm install` (in `contracts/`) -> `npx hardhat compile`
- **Database**: `npm run db:push` (Drizzle schema sync)
- **Relayer**: `npm install` (in `relayer/`) -> `npx ts-node src/index.ts`

## 4. Project-Specific Workflows

- **`/code-review`**: Antigravity 전문 Skill과 오픈소스 도구를 활용한 신뢰성 검사.
    - 정적 분석: `solidity-security-auditor`, `vercel-react-best-practices`.
    - 동적 분석: Lint, Type Check, Hardhat/Vitest 실행.

## 5. Current Phase & Focus
- **Current Status**: Phase 4 완료 - AI 컨시어지 통합 및 플랫폼 안정화.
- **Completed**: Choonsim 온체인 인프라 구축, 컨트랙트 V2 배포, 오라클 감사 시스템 구현.
- **Active Bond**: Choonsim AI-Talk Growth Bond (ID: 101, APR: 18.5%, Category: IP Rights)

## 6. Git Commit Convention
- **Format**: `type(scope): 메시지` (한국어 준수)
- **Example**: `feat(choonsim): 춘심 프로젝트 UI 연동 및 온체인 인프라 구축`
