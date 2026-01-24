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
- Run database migrations: `npm run db:push` or `npx drizzle-kit push`
- Start database studio: `npx drizzle-kit studio`

### Frontend
- Initialize project (shadcn preset): `npx shadcn@latest create --preset "https://ui.shadcn.com/init?base=base&style=nova&baseColor=neutral&theme=neutral&iconLibrary=hugeicons&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=vite" --template vite`
- Install dependencies: `npm install`
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
- **Database**: Turso (SQLite)
- **ORM**: Drizzle ORM
- **Validation**: Zod (TypeScript) or Pydantic (Python)
- **Authentication**: Better Auth

### Frontend
- **Framework**: React 18+ (React Router v7 Framework)
- **State Management**: Zustand or Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts or Chart.js
- **Maps**: Google Maps API or Mapbox (for impact visualization)
- **Wallet Integration**: ethers.js or viem
- **Date/Time**: Luxon

### Infrastructure
- **Oracle**: Creditcoin Universal Oracle
- **Cross-Chain**: Creditcoin Gateway (Ethereum, Polygon, etc.)
- **Hosting**: Vercel (frontend), AWS/Railway (backend), Turso (database)

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
- Use **Luxon** for all date and time operations
- **Style Conventions**:
  - Tailwind CSS v4의 `@custom-variant` 등 새로운 문법을 사용함.
  - 에디터 경고 방지를 위해 `.vscode/settings.json`의 `css.lint.unknownAtRules` 설정을 `ignore`로 유지함.
- **React Router v7 Patterns**:
  - Strictly follow **loader** and **action** patterns for data fetching and mutations.
  - Use `LoaderFunctionArgs` and `ActionFunctionArgs` from `react-router` for type-safe parameter handling.
  - Implement proper type definitions for `useLoaderData` and `useActionData`.
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

## Communication Rules
- **[No Emojis]** 사용자와의 모든 채팅 대화에서 이모지(Emoji) 및 이모티콘(Emoticon) 사용을 전면 금지합니다.
- **[Documentation-First Implementation]** If the USER requests a task or technical implementation that is not defined in the existing documentation, you must first clarify that it is outside the current scope and ask if the documentation should be updated before proceeding with the implementation. (문서에 정의되지 않은 작업을 수행하기 전, 반드시 문서 업데이트 여부를 먼저 확인하십시오.)

### Git
- Git commit messages must follow Conventional Commits in Korean
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat(contracts): ERC-1155 채권 토큰 컨트랙트 구현`

## Workflow & Safety
- **[Safe Checkpoint Strategy]** 새로운 작업이나 중요한 변경(새 파일 생성, DB 스키마 수정, 패키지 설치 등)을 시작하기 전에, 반드시 현재 상태를 git commit하거나 작업 디렉토리가 깨끗한지 확인을 요청해야 합니다.

## Workflows
이 프로젝트는 반복적인 작업을 표준화하기 위해 자동화된 워크플로우를 사용합니다.

- **`/code-review`**: Antigravity의 전문 Skill과 TestSprite를 사용하여 코드의 품질을 검증합니다.
    - **정적 분석**: `solidity-security-auditor` (스마트 컨트랙트), `vercel-react-best-practices` (프론트엔드)
    - **동적 분석**: TestSprite를 통한 자동 테스트 생성 및 실행
    - **리포트**: 보안, 성능, 안정성 결과를 통합한 마크다운 리포트 생성

## Testing Instructions
- Currently, tests are being integrated as part of the development phase (Phase 9).
- Run available tests using: `npm test`

## Documentation Standards

### Key Documents
- `docs/PLAN.md`: 프로젝트 기획서 및 비즈니스 모델
- `docs/IMPLEMENTATION_PLAN.md`: 개발 구현 계획서 및 기술 아키텍처

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

### [Document Prefix Numbering Rule]
When creating or naming documentation files, **prefix numbers must be attached** to indicate the chronological order in which documents were actually worked on. This prefix serves solely as a visual indicator of the sequence of documentation work. While the actual completion status of a document can be determined by dates recorded within the document itself, the prefix number is necessary for quickly identifying the order of document creation and should always be included when writing documentation.


## Development Standards & Critical Rules

### [CRITICAL: DATABASE INTEGRITY RULE]
You are strictly prohibited from performing any database operations, including migrations, schema resets, or structural changes, without first creating a complete data backup (dump). Data preservation is your absolute priority. Never execute destructive commands like 'DROP TABLE' or 'migrate reset' until a verifiable backup has been secured and confirmed.

### [MANDATORY BACKUP PROCEDURE]
Before initiating any database-related tasks, you must perform a full export of all existing records. This is a non-negotiable prerequisite for any migration or schema update. You must ensure that both user-generated content and administrative data are fully protected against loss before any changes are applied.

### [STRICT ADHERENCE TO STANDARDS]
Never suggest or implement "quick fixes," "short-cuts," or temporary workarounds. You must always prioritize formal, standardized, and industry-best-practice methodologies. All proposed solutions must be production-ready and architecturally sound, focusing on long-term stability and correctness over immediate speed.

### [NO TEMPORARY PATCHES]
You are strictly forbidden from proposing temporary bypasses or "quick-and-dirty" solutions. Every recommendation and implementation must follow the most formal and correct path. Prioritize robustness and adherence to professional engineering standards in every decision, ensuring that no technical debt is introduced for the sake of convenience.

### [Side-Effect Isolation]
When modifying shared components or logic, you MUST analyze the 'Impact Scope' first. Ensure that changes intended for a specific use case (e.g., AI features) do not inadvertently affect general functionality (e.g., normal chat). You MUST strictly isolate such logic using conditional checks or specific guards.

### [Strict Document Integrity Rule]
When updating or modifying any strategy, implementation, or design documents, you MUST strictly preserve the existing framework, formatting, and structural integrity. Do not perform total overwrites that discard previous detailed technical specifications, historical context, or complex logic. All updates must be made incrementally and appropriately integrated into the current structure to ensure no data loss or architectural context is sacrificed.

### [Strict Document Persistence Rule]
When updating or modifying any document, you MUST NOT overwrite, delete, or discard the existing content, historical context, or previous specifications. All updates must be made by appending new information or integrating changes incrementally while preserving the original framework. This ensures that the entirety of the project's evolution, including past technical decisions and verification records, remains fully traceable.

### [Standard Rules for Environment Variable Management]
1. **Strategic Isolation of Environments**
   - **Principle**: Maintain strict separation between Local and Production environments using file suffixes.
   - **Workflow**: Use `.env.development` or `.env.local` for local execution (test keys, localhost URLs). Use `.env.production` as the source of truth for deployment parameters.
   - **Priority**: AI must respect the framework's priority logic (typically: `.env.development`/`.env.local` overrides `.env`).

2. **Zero-Leak Security Policy (Git Integrity)**
   - **Rule**: No part of any `.env*` file shall ever be committed to a Version Control System (VCS).
   - **Verification**: AI must proactively audit `.gitignore` to ensure global patterns like `.env*` are effectively blocking all potential environment files before suggesting any variable updates.

3. **Cloud-Native Secret Management**
   - **Deployment Strategy**: Environment variables in production must be managed via the hosting provider's secure dashboard (e.g., Vercel, AWS) or CLI, never via file transmission to the server.
   - **Automation**: When syncing variables, prioritize using official CLIs to pull/push secrets between the local .env files and the cloud environment to prevent manual entry errors.

4. **Context-Aware Variable Configuration**
   - **Dynamic Mapping**: Redirection URLs, Auth providers, and Database connection strings must be dynamically configured to point to localhost in development and the verified production domain in deployment, managed through the isolated .env files.

### [React Performance Standards (Adapted from Vercel Engineering)]
All frontend development MUST strictly adhere to modern React engineering best practices.
**Primary Source of Truth: [React Router v7 Documentation](https://reactrouter.com/home)**

**Architectural Reference:**
We adopt Vercel's high-performance principles (Anti-Waterfalls, Zero-Bloat) but verify implementation details against React Router patterns.
*For conceptual guidance, consult the local knowledge base at `.agent/skills/vercel-react-best-practices/`.*
*(Note: If the skill is missing, retrieve it from [SkillsCokac](https://skills.cokac.com/) or install via `npx skillscokac -i vercel-react-best-practices`. Always apply rules within the context of React Router v7.)*

1. **Eliminate Waterfalls**: Strictly prohibit sequential blocking data fetches. Always use `Promise.all` for parallel execution or leverage `Suspense` for streaming.
2. **Zero-Bundle-Bloat**: 
   - Mandate `React.lazy` (lazy loading) for heavy components.
   - Prohibition of "Barrel Files" (re-exporting index files) in ways that break tree-shaking.
3. **Server-Centric Optimizations**: Prioritize server-side data fetching (Loaders) and transformation to minimize client payload.
4. **Core Rules Enforcement**: 
   - Consult the rules in `.agent/skills/vercel-react-best-practices/rules/` for specific patterns (e.g., `rendering-content-visibility.md`, `js-early-exit.md`).