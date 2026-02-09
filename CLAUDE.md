# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BondBase is an IP Revenue Rights-based RWA (Real World Asset) Launchpad built around the ChoonSim AI-Talk IP. It tokenizes IP revenue rights as ERC-1155 tokens pegged to USDC on Creditcoin 3.0 Testnet, providing transparent yield distribution to investors.

## Repository Structure

```
BondBase/
├── frontend/     # React Router v7 (Vite) SSR web app
├── contracts/    # Solidity smart contracts (Hardhat)
├── relayer/      # Off-chain oracle data sync service
└── docs/         # 5-layer documentation (Foundation/Prototype/Specs/Logic/Test)
```

## Build & Development Commands

### Frontend (`frontend/`)
```bash
npm run dev              # Start dev server (generates knowledge.json first)
npm run build            # Production build (react-router build)
npm run generate-knowledge  # Regenerate AI knowledge base JSON
```

### Smart Contracts (`contracts/`)
```bash
npm test                                           # Run all Hardhat tests
npx hardhat test test/YieldDistributorV2.test.ts   # Run single test file
npx hardhat compile                                # Compile contracts
npx hardhat run scripts/deploy_all.ts --network creditcoin-testnet  # Deploy
```

### Relayer (`relayer/`)
```bash
npm start    # Run oracle sync bot (tsx src/index.ts)
```

## Architecture

### Smart Contract Flow
```
LiquidityPool (USDC deposit) → BondToken (ERC-1155 mint)
OracleAdapter (off-chain data) → YieldDistributor (yield calculation/claim)
```

- **BondToken.sol**: ERC-1155 semi-fungible bond tokens with MINTER_ROLE access control
- **YieldDistributor.sol**: Real-time yield based on token holdings (no staking), supports claim and auto-reinvest
- **LiquidityPool.sol**: USDC-to-BondToken purchase mechanism with ReentrancyGuard
- **OracleAdapter.sol**: Bridges off-chain asset performance + ESG impact data on-chain
- **ChoonsimBond.sol**: Specialized bond for ChoonSim IP with revenue bridge and milestone bonuses
- **MockUSDC.sol**: ERC-20 test stablecoin

All contracts use OpenZeppelin AccessControl (RBAC). Deployed on Creditcoin Testnet (Chain ID: 102031).

### Frontend Architecture

- **Framework**: React Router v7 with SSR, deployed on Vercel (`@vercel/react-router` preset)
- **Path alias**: `@/*` maps to `./app/*`
- **State**: WagmiProvider + QueryClientProvider at root level (`app/root.tsx`)
- **Database**: Turso (libSQL/SQLite) via Drizzle ORM. Schema at `app/db/schema.ts`
- **Auth**: Better Auth (session-based), client at `app/lib/auth-client.ts`
- **AI Chat**: Streaming via Vercel AI SDK v6. Primary model: Gemini 2.5 Flash, fallback: GPT-4O. Knowledge base auto-generated at build from `scripts/generate-knowledge.cjs` into `app/lib/knowledge.json`
- **Contract config**: All ABIs and addresses in `app/config/contracts.ts`, chain config in `app/config/wagmi.ts`
- **UI**: Tailwind CSS v4 + shadcn/ui components in `app/components/ui/`

### Routes
| Path | File | Purpose |
|------|------|---------|
| `/` | `home.tsx` | Dashboard |
| `/bonds` | `bonds.tsx` | Growth Market (bond listings) |
| `/choonsim` | `choonsim.tsx` | ChoonSim project dashboard |
| `/portfolio` | `portfolio.tsx` | User investment portfolio (lazy-loaded) |
| `/admin` | `admin.tsx` | Admin panel (DISTRIBUTOR_ROLE gated) |
| `/ai-guide` | `ai-guide.tsx` | AI Concierge chatbot |
| `/impact` | `impact.tsx` | ESG/Fandom impact visualization |
| `/settings` | `settings.tsx` | User profile & wallet settings |
| `/api/chat` | `api.chat.ts` | AI streaming endpoint |
| `/api/revenue` | `api.revenue.ts` | Revenue bridge (ChoonSim-Talk -> BondBase) |
| `/api/faucet` | `api.faucet.ts` | Testnet token faucet |

### Relayer
TypeScript service using ethers.js v6 that syncs mock fintech data to on-chain OracleAdapter every 30 seconds. Config at `relayer/src/config.ts`.

### Database Tables (Drizzle ORM)
Core: `bonds`, `investors`, `investments`, `yieldDistributions`, `repayments`
ChoonSim: `choonsimProjects`, `choonsimMetricsHistory`, `choonsimRevenue`, `choonsimMilestones`
Auth: `user`, `session`, `account`, `verification` (managed by Better Auth)

## Key Contract Addresses (Creditcoin Testnet, V3 Phase 3)
```
MockUSDC:        0x03E7d375e76A105784BFF5867f608541e89D311B
BondToken:       0x01607c3Ff57e3234702f55156E4356e3036f8D4E
LiquidityPool:   0xC86F94d895331855C9ac7E43a9d96cf285512B31
YieldDistributor:0x0D38d19dA1dC7F018d9B31963860A39329bf6974
MockOracle:      0x4022BC37a1F9030f9c0dCA179cb1fFaF26E59bcE
OracleAdapter:   0xDaD165Ba828bD90f0e4897D92005bb1660f4785f
```

## Governance Rules (from AGENTS.md)

- **Documentation-First**: Update docs before implementation. Follow the 5-layer structure under `docs/`
- **Strict Approval**: Report modification plans and get explicit approval before changing code
- **Korean commit messages**: Format `type(scope): 메시지` with 3+ line body using `-` bullets
- **No emojis** in communication
- **Mandatory libraries**: Zod for validation, Luxon for date/time
- **DB safety**: Always backup before migrations or schema changes
- **Evidence-based**: Verify current state with tools before answering; never guess
- **Phase-Exit QA**: All pages must render (no 404), empty states must not break, errors must show toast feedback, console must be clean of red errors
