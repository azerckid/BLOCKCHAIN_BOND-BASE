# AGENTS.md

Welcome! your AI coding agent. This file follows the [AGENTS.md](https://agents.md/) standard to provide me with the context and instructions I need to work on the **BuildCTC (RWA Yield Protocol)** project effectively.

## Project Overview
BuildCTC is a Real World Assets (RWA) Yield Protocol built on Creditcoin 2.0 that tokenizes real-world lending assets and provides yield returns to investors. The protocol bridges traditional finance and DeFi by bringing tangible asset value on-chain and distributing returns from real-world loan interest payments.

### Core Value Proposition
- **Asset Tokenization**: Tokenizes small business loan bonds from emerging markets (initially focused on Thailand) into ERC-1155 fractional tokens (NFTs)
- **Liquidity Pool**: Investors deposit stablecoins (USDC) to provide liquidity for real-world lending assets
- **Real-World Yield Distribution**: Loan interest payments from borrowers are recorded on-chain via Creditcoin network and distributed as yield to investors
- **Cross-Chain Gateway**: Investors from other chains (Ethereum, Polygon, etc.) can participate through Creditcoin's Gateway functionality

### Target Market
- **Primary Market**: Thailand (small business loan market)
- **Future Expansion**: Other Southeast Asian and African emerging markets
- **Investor Base**: DeFi investors seeking uncorrelated returns, ESG-focused institutional investors

### Key Differentiators
- **Volatility Hedge**: Provides uncorrelated returns that are not affected by Bitcoin/Ethereum price fluctuations
- **Transparency**: Creditcoin 2.0+ recorded loan history allows investors to verify repayment performance through dashboards
- **Social Impact**: Compliance dashboard showing which businesses and regions receive investment, appealing to ESG-focused institutions
- **Risk Management**: Loss distribution mechanisms and reserve pool to protect investors from defaults

### Current Status
- **Partnerships**: Not yet established (seeking partnerships with local lending institutions in Thailand)
- **Regulatory Compliance**: Must comply with Thai financial regulations and cross-border capital movement regulations
- **Token Model**: ERC-1155 fractional tokens for flexible asset division and trading

## Setup Commands

### Smart Contracts
- Install dependencies: `npm install` (in `contracts/` directory)
- Compile contracts: `npx hardhat compile` or `forge build`
- Run tests: `npx hardhat test` or `forge test`
- Deploy to testnet: `npx hardhat run scripts/deploy.ts --network creditcoin-testnet`
- Start local node: `npx hardhat node` or `anvil`

### Backend
- Install dependencies: `npm install` (in `backend/` directory)
- Start development server: `npm run dev`
- Run database migrations: `npm run migrate` or `npx prisma migrate dev`
- Start database studio: `npx prisma studio`

### Frontend
- Install dependencies: `npm install` (in `frontend/` directory)
- Start development server: `npm run dev`
- Build production bundle: `npm run build`

## Tech Stack

### Smart Contracts
- **Language**: Solidity ^0.8.20
- **Framework**: Hardhat or Foundry
- **Testing**: Hardhat Test or Forge
- **Standards**: ERC-1155 (Multi Token), ERC-20, OpenZeppelin Contracts
- **Blockchain**: Creditcoin 2.0 (EVM Compatible)

### Backend
- **Runtime**: Node.js 18+ or Python 3.13+
- **Framework**: Express.js/Fastify (Node.js) or FastAPI (Python)
- **Database**: PostgreSQL (Supabase recommended)
- **ORM**: Prisma/TypeORM (Node.js) or SQLAlchemy (Python)
- **Validation**: Zod (TypeScript) or Pydantic (Python)
- **Authentication**: JWT or OAuth2

### Frontend
- **Framework**: React 18+ (Next.js recommended)
- **State Management**: Zustand or Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts or Chart.js
- **Maps**: Google Maps API or Mapbox (for impact visualization)
- **Wallet Integration**: ethers.js or viem

### Infrastructure
- **Oracle**: Creditcoin Universal Oracle
- **Cross-Chain**: Creditcoin Gateway (Ethereum, Polygon, etc.)
- **Hosting**: Vercel (frontend), AWS/Railway (backend), Supabase (database)

## Code Style & Conventions

### Smart Contracts
- Use **Solidity** ^0.8.20 or higher
- Follow OpenZeppelin Contracts patterns and best practices
- Implement comprehensive access control (Ownable, AccessControl)
- Use SafeMath or Solidity 0.8+ built-in overflow protection
- Add ReentrancyGuard for functions that interact with external contracts
- Write extensive unit tests with high coverage (>90%)
- Document all public functions with NatSpec comments

### Backend
- Use **TypeScript** (Node.js) or **Python 3.13+** (FastAPI)
- Use **Zod** (TypeScript) or **Pydantic** (Python) for all schema validations
- Implement comprehensive error handling with proper error types
- Use structured logging (Winston, Pino, or Python logging)
- Follow RESTful API design principles
- Implement rate limiting and authentication middleware

### Frontend
- Use **TypeScript** for all files
- Stick to functional components and React Hooks
- Follow shadcn/ui design system for UI consistency
- Use **Zod** for client-side validation
- Use **Toast notifications** (Sonner) for user feedback:
  - Success: Investment, withdrawal, yield claim, etc.
  - Error: Transaction failures, validation errors, API errors
  - Info: Transaction pending, pool updates, etc.
  - Warning: Low reserve pool, high risk investments, etc.
- **Error Handling**: Always implement comprehensive error handling:
  - Check for errors in all API responses
  - Display errors using `toast.error()` instead of raw error messages
  - Handle wallet connection errors gracefully
  - Provide clear transaction status feedback
- **Wallet Integration**: 
  - Support MetaMask, WalletConnect, and other popular wallets
  - Handle network switching (Creditcoin mainnet/testnet)
  - Show transaction status (pending, success, failed)

### Git
- Git commit messages must follow Conventional Commits in Korean
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat(contracts): ERC-1155 채권 토큰 컨트랙트 구현`

## Workflow & Safety
- **[Safe Checkpoint Strategy]** 새로운 작업이나 중요한 변경(새 파일 생성, DB 스키마 수정, 패키지 설치 등)을 시작하기 전에, 반드시 현재 상태를 git commit하거나 작업 디렉토리가 깨끗한지 확인을 요청해야 합니다.

## Communication Rules
- **[No Emojis]** 사용자와의 모든 채팅 대화에서 이모지(Emoji) 및 이모티콘(Emoticon) 사용을 전면 금지합니다. 텍스트와 코드만으로 명확하게 정보를 전달하십시오.

## Testing Instructions
- Currently, tests are being integrated as part of the development phase (Phase 9).
- Run available tests using: `npm test`

## Key Documentation
- `docs/PLAN.md`: 프로젝트 기획서 및 비즈니스 모델
- `docs/IMPLEMENTATION_PLAN.md`: 개발 구현 계획서 및 기술 아키텍처
- `docs/core/`: 시스템 설계 문서, DB 스키마, 표준 규칙
- `docs/features/`: 기능별 상세 명세서
- `docs/roadmap/`: 향후 구현 계획 및 전략 제안

### [Strict Document Hierarchy Rule]
To ensure the structural integrity and maintainability of the project, all documentation within the `docs/` directory must be strictly categorized into the following 7 core sub-directories (as defined in `DOCUMENT_MANAGEMENT_PLAN.md`):

1. **`docs/core/`**: System-wide design foundations, DB schemas, and standard rules.
2. **`docs/features/`**: Detailed specifications of how individual features (billing, ai, chat, etc.) currently operate.
3. **`docs/roadmap/`**: Future implementation plans and strategic proposals.
4. **`docs/reports/`**: Historical verification reports and test results from previous phases.
5. **`docs/guides/`**: Practical guides and troubleshooting notes for developers and operators.
6. **`docs/stitch/`**: Detailed UI/UX designs and flowcharts for each screen.
7. **`docs/archive/`**: Legacy documentation retained for historical context only.

AI agents MUST respect this hierarchy when creating or modifying documents and proactively rebase misplaced files.


[CRITICAL: DATABASE INTEGRITY RULE] You are strictly prohibited from performing any database operations, including migrations, schema resets, or structural changes, without first creating a complete data backup (dump). Data preservation is your absolute priority. Never execute destructive commands like 'DROP TABLE' or 'migrate reset' until a verifiable backup has been secured and confirmed.

[MANDATORY BACKUP PROCEDURE] Before initiating any database-related tasks, you must perform a full export of all existing records. This is a non-negotiable prerequisite for any migration or schema update. You must ensure that both user-generated content and administrative data are fully protected against loss before any changes are applied.

[STRICT ADHERENCE TO STANDARDS] Never suggest or implement "quick fixes," "short-cuts," or temporary workarounds. You must always prioritize formal, standardized, and industry-best-practice methodologies. All proposed solutions must be production-ready and architecturally sound, focusing on long-term stability and correctness over immediate speed.

[NO TEMPORARY PATCHES] You are strictly forbidden from proposing temporary bypasses or "quick-and-dirty" solutions. Every recommendation and implementation must follow the most formal and correct path. Prioritize robustness and adherence to professional engineering standards in every decision, ensuring that no technical debt is introduced for the sake of convenience.

[Side-Effect Isolation] When modifying shared components or logic, you MUST analyze the 'Impact Scope' first. Ensure that changes intended for a specific use case (e.g., AI features) do not inadvertently affect general functionality (e.g., normal chat). You MUST strictly isolate such logic using conditional checks or specific guards.

[Strict Document Integrity Rule] When updating or modifying any strategy, implementation, or design documents, you MUST strictly preserve the existing framework, formatting, and structural integrity. Do not perform total overwrites that discard previous detailed technical specifications, historical context, or complex logic. All updates must be made incrementally and appropriately integrated into the current structure to ensure no data loss or architectural context is sacrificed.

[Strict Document Persistence Rule] When updating or modifying any document, you MUST NOT overwrite, delete, or discard the existing content, historical context, or previous specifications. All updates must be made by appending new information or integrating changes incrementally while preserving the original framework. This ensures that the entirety of the project's evolution, including past technical decisions and verification records, remains fully traceable.

[Standard Rules for Environment Variable Management]
1. Strategic Isolation of Environments
Principle: Maintain strict separation between Local and Production environments using file suffixes.
Workflow:
Use .env.development or .env.local for local execution (test keys, localhost URLs).
Use .env.production as the source of truth for deployment parameters (production domains, live API keys).
Priority: AI must respect the framework's priority logic (typically: .env.development/local overrides .env).
2. Zero-Leak Security Policy (Git Integrity)
Rule: No part of any .env* file shall ever be committed to a Version Control System (VCS).
Verification: AI must proactively audit 
.gitignore
 to ensure global patterns like .env* are effectively blocking all potential environment files before suggesting any variable updates.
3. Cloud-Native Secret Management
Deployment Strategy: Environment variables in production must be managed via the hosting provider's secure dashboard (e.g., Vercel, AWS) or CLI, never via file transmission to the server.
Automation: When syncing variables, prioritize using official CLIs to pull/push secrets between the local .env files and the cloud environment to prevent manual entry errors.
4. Context-Aware Variable Configuration
Dynamic Mapping: Redirection URLs, Auth providers, and Database connection strings must be dynamically configured to point to localhost in development and the verified production domain in deployment, managed through the isolated .env files.