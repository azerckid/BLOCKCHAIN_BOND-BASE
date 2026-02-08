# 프로젝트 개요 (Project Overview)
> Created: 2026-01-26 00:46
> Last Updated: 2026-02-09

## 1. 프로젝트 비전 (Vision)
- **"IP 수익권 기반의 차세대 RWA 런치패드"**
- 강력한 글로벌 팬덤을 보유한 **'춘심(ChoonSim)'** IP의 수익권을 온체인 자산화(USDC 페깅)하여 투명한 수익 배분을 실현합니다.
- 투자자에게는 IP 성장과 연동된 수익을, IP 보유자에게는 팬덤 기반의 유동성을 제공하는 정서적 투자 생태계 구축을 목표로 합니다.

## 2. 핵심 인프라 스택 (Key Infrastructure)

### 2.1 Blockchain & Smart Contracts
- **Network**: Creditcoin 3.0 (CC3) Testnet
- **Protocol**: BondBase RWA Protocol (ERC-1155 기반 수익권 토큰화)
- **Oracle**: Creditcoin Universal Oracle (실물 매출 데이터 온체인 검증용 Audit 시스템)

### 2.2 Backend & Data
- **Database**: Turso (libSQL) / Drizzle ORM
- **Runtime**: Vercel Edge Runtime / Node.js
- **Secret Management**: Cloud-native environments (.env.production / Vercel Secrets)

### 2.3 AI & Intelligence
- **Engine**: Google Gemini 2.5 Flash (Primary) / OpenAI GPT-4O (Fallback)
- **Framework**: Vercel AI SDK (Core + React)
- **Knowledge Base**: RAG (Static Context via `knowledge.json` + Live DB Data)

### 2.4 Frontend
- **Framework**: React Router v7 (Vite)
- **Styling**: Tailwind CSS v4 / shadcn/ui
- **Icons**: Lucide Icons, Hugeicons

---

## X. Related Documents
- **Foundation**: [Integration Plan](./01_INTEGRATION_PLAN.md) - BondBase x 춘심 통합 기획 전략
- **Foundation**: [Roadmap](./03_ROADMAP.md) - 단계별 실행 계획 및 마일스톤
- **Specs**: [Infrastructure Specs](../03_Specs/01_INFRASTRUCTURE.md) - 기술 인프라 명세
