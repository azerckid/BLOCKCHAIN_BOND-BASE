# Phase 4: AI 에이전트 통합 및 지식 고도화 전략
> Created: 2026-01-25 14:19
> Last Updated: 2026-02-09

## 1. 개요 (Overview)
Phase 4는 BondBase의 'AI Concierge'가 단순한 안내 기능을 넘어, **실시간 온체인 데이터 조회**와 **외부 플랫폼(춘심 톡)과의 연동**을 수행할 수 있도록 지능화하는 단계입니다. 사용자는 AI와의 대화를 통해 자신의 투자 현황을 파악하고, 최적의 수익 전략을 제안받을 수 있어야 합니다.

## 2. 목표 (Goals)
1.  **실시간 지식 동기화 (Live RAG)**: AI가 스마트 컨트랙트의 현재 상태(APR, TVL, 내 잔액)를 조회하여 답변할 수 있어야 함.
2.  **맥락 인식 투자 제안 (Contextual Advice)**: 사용자의 지갑 연결 여부, 포트폴리오 상태를 인식하여 구체적 제안 가능.
3.  **외부 연동 준비 (External Linkage)**: 춘심 AI-Talk 앱에서 BondBase의 핵심 기능을 호출할 수 있도록 API 및 지식 베이스 표준화.

## 3. 핵심 과제 (Tasks)
- **AI Knowledge Base 고도화**: 레거시 데이터 제거 및 춘심 캐릭터 말투(Persona) 반영.
- **온체인 데이터 조회 도구**: Vercel AI SDK Tools를 활용한 Function Calling 구현.
  > **현황**: Gemini API 스키마 호환성 이슈로 Tool Calling이 현재 비활성화 상태. 안정화 후 재활성화 예정. (`api.chat.ts` 87행 참조)
- **춘심 페르소나 미세조정**: 금융 전문용어와 팬덤 은어의 조화로운 사용.

## 4. 기술 스택 (Tech Stack)
- **AI Engine (Primary)**: Google Gemini 2.5 Flash (`gemini-2.5-flash`)
- **AI Engine (Fallback)**: OpenAI GPT-4O (`gpt-4o`) - 사용자 선택 가능
- **Framework**: Vercel AI SDK v6 (Core + React)
- **Data Source**: Static (`knowledge.json`, 빌드 시 자동 생성) + Dynamic (viem/wagmi RPC)

---

## X. Related Documents
- **Foundation**: [Project Overview](./00_PROJECT_OVERVIEW.md) - 프로젝트 비전 및 기술 스택
- **Foundation**: [Integration Plan](./01_INTEGRATION_PLAN.md) - 춘심 연동 기획 원칙
- **Specs**: [Revenue Bridge Spec](../03_Specs/02_REVENUE_BRIDGE_SPEC.md) - 수익 연동 API 명세
- **Logic**: [Audit Logic](../04_Logic/01_AUDIT_LOGIC.md) - 온체인 데이터 검증 로직
