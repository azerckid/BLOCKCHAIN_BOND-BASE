# AGENTS.md (BondBase - Project Specific Context)

이 파일은 **BondBase (RWA Yield Protocol)** 프로젝트에 특화된 기술적 맥락과 비즈니스 로직을 담고 있습니다. 공통적인 커뮤니케이션 규칙 및 안전 가이드는 Antigravity 시스템의 **Customizations (Global Rules)** 설정을 따릅니다.

## 1. Project Overview
BuildCTC는 Creditcoin 2.0 기반의 실물 자산(RWA) 수익률 프로토콜입니다. 신흥 시장(태국 등)의 소상공인 대출 채권을 토큰화하여 투자자에게 안정적인 이자 수익을 제공합니다.

### Core Value Proposition
- **Asset Tokenization**: ERC-1155를 이용한 채권 분할 토큰화.
- **Real-World Yield**: Creditcoin 네트워크에 기록된 실물 대출 이자를 기반으로 수익 분배.
- **Transparency**: 대출 이력을 온체인으로 관리하여 대시보드에서 투명하게 확인 가능.

## 2. Tech Stack & Integration

### Smart Contracts
- **Solidity**: ^0.8.20 (Hardhat / Foundry 사용)
- **Standards**: ERC-1155, ERC-20 (OpenZeppelin)
- **Blockchain**: Creditcoin 2.0 (EVM Compatible)

### Frontend (React Router v7)
- **Framework**: React Router v7 (Strict Loader/Action 패턴 준수)
- **Styling**: Tailwind CSS v4 (Custom At-rules 사용)
- **State/Data**: UI는 shadcn/ui, 데이터 검증은 zod, 날짜 처리는 **Luxon** 사용.

### Backend & Database
- **Runtime**: Node.js (TypeScript)
- **Database**: Turso (SQLite) + Drizzle ORM
- **Authentication**: Better Auth

## 3. Setup Commands

### 개발 환경 구축
- **Frontend/General**: `npm install` -> `npm run dev`
- **Smart Contracts**: `npm install` (in `contracts/`) -> `npx hardhat compile`
- **Database**: `npm run db:push` (Drizzle schema sync)

## 4. Project-Specific Workflows

- **`/code-review`**: Antigravity 전문 Skill과 오픈소스 도구를 활용한 신뢰성 검사.
    - 정적 분석: `solidity-security-auditor`, `vercel-react-best-practices`.
    - 동적 분석: Lint, Type Check, Hardhat/Vitest 실행.

## 5. Current Phase & Focus
- **Current Status**: Phase 9 - 테스트 통합 및 검증 단계.
- **Key Task**: RAG 검색 엔진(Turso Vector Search + Gemini) 고도화 및 대시보드 연동 최적화.

## 6. Git Commit Convention
- **Format**: `type(scope): 메시지` (한국어 준수)
- **Example**: `feat(contracts): ERC-1155 채권 토큰 컨트랙트 구현`