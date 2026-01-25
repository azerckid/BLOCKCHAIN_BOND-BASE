# [기획서] Phase 4: AI 에이전트 통합 및 지식 고도화 (AI Integration)

**작성일**: 2026-01-25
**작성자**: Antigravity (Project BondBase Manager)

---

## 1. 개요 (Overview)

Phase 4는 BondBase의 'AI Concierge'가 단순한 안내 기능을 넘어, **실시간 온체인 데이터 조회**와 **외부 플랫폼(춘심 톡)과의 연동**을 수행할 수 있도록 지능화하는 단계입니다.
사용자는 AI와의 대화를 통해 자신의 투자 현황을 파악하고, 최적의 수익 전략을 제안받을 수 있어야 합니다.

## 2. 목표 (Goals)

1.  **실시간 지식 동기화 (Live RAG)**:
    - AI가 정적 문서(Markdown)뿐만 아니라, **스마트 컨트랙트의 현재 상태**(APR, TVL, 내 잔액)를 조회하여 답변할 수 있어야 함.
2.  **맥락 인식 투자 제안 (Contextual Advice)**:
    - 사용자의 지갑 연결 여부, 포트폴리오 상태를 인식하여 "지금 재투자하면 수익률이 X% 상승합니다"와 같은 구체적 제안 가능.
3.  **외부 연동 준비 (External Linkage)**:
    - 춘심 AI-Talk 앱에서 BondBase의 핵심 기능을 호출할 수 있도록 API 및 지식 베이스 표준화.

## 3. 핵심 과제 및 실행 계획 (Tasks)

### 3.1 AI Knowledge Base 고도화 (Knowledge Cleanup)
- **Problem**: 현재 `knowledge.json`에 과거 태국 대출 관련 레거시 데이터(Stitch Design Brief 등)가 포함되어 있어 AI가 환각(Hallucination)을 일으킬 수 있음.
- **Action**:
    - `08_BOND-BASE_NORMALIZATION_BRANDING_PLAN.md` 등 최신 정규화 문서를 포함.
    - Legacy 파트(Stitch, Thai-specific design) 제거.
    - 춘심 세계관(IP Lore) 관련 데이터(캐릭터 말투, 팬덤 용어) 추가.

### 3.2 온체인 데이터 조회 도구 (On-chain Tools for AI)
- **Concept**: Vercel AI SDK의 `tools` 기능을 활용하여 AI가 함수 호출(Function Calling)을 수행하도록 업그레이드.
- **Functions**:
    - `getBondStatus(bondId)`: 채권의 현재 모집율 및 APR 조회.
    - `getUserBalance(walletAddress)`: 사용자의 스테이킹 현황 조회.
    - `getNextMilestone()`: 달성 임박한 마일스톤 조회.

### 3.3 춘심 페르소나 미세조정 (Fine-tuning Persona)
- **Tone & Manner**:
    - 금융 전문용어와 팬덤 은어의 조화로운 사용.
    - 딱딱한 "투자하세요" 대신 "춘심이의 성장에 동참하세요"와 같은 네러티브 중심 화법.

## 4. 기술 스택 (Tech Stack)

- **AI Engine**: Google Gemini 2.0 Flash (속도 및 멀티모달 최적화)
- **Framework**: Vercel AI SDK (Core + React)
- **Data Source**:
    - Static: `knowledge.json` (Build-time generated)
    - Dynamic: `viem` / `wagmi` actions (Real-time RPC calls)

## 5. 예상 결과물 (Deliverables)

- **Smart AI Concierge**: 실시간 APR과 내 잔액을 조회해주는 대화형 에이전트.
- **Cleaned Knowledge Base**: 레거시 없이 완벽하게 정규화된 RAG 데이터셋.

---
**다음 단계**: 본 계획 승인 즉시 `knowledge.json` 정비 및 시스템 프롬프트 업데이트 착수.
