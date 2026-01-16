# 18. AI Guide Assistant Integration Plan

## 1. 개요 (Overview)
**AI Guide Assistant**는 BondBase 플랫폼 내에 대화형 AI 인터페이스를 탑재하여, Web3 및 RWA 투자에 익숙하지 않은 사용자들이 쉽고 빠르게 서비스 사용법을 익힐 수 있도록 돕는 온보딩(Onboarding) 솔루션입니다.

## 2. 목표 (Key Objectives)
*   **진입 장벽 최소화**: "지갑 연결은 어떻게 하나요?", "투자는 어떻게 하나요?" 등 초보적인 질문에 실시간으로 즉답 제공.
*   **운영 효율화**: 반복되는 문의를 AI가 자동 처리하여 운영팀의 리소스 절감.
*   **차별화된 UX**: 정적인 매뉴얼 대신 능동적인 AI 컨시어지 경험을 제공하여 아이디어톤 심사 시 기술적/사용성 측면의 가산점 확보.

---

## 3. 기능 명세 (Feature Specification)

### 3.1 UI/UX
*   **진입점 (Entry Point)**: 사이드바(Sidebar) 메뉴에 **[AI Guide]** 탭 추가.
*   **인터페이스**: 카카오톡이나 ChatGPT와 유사한 **채팅(Chat)** 형태.
*   **주요 기능**:
    *   **Q&A**: 사용자가 자연어로 질문하면 AI가 답변.
    *   **Quick Action**: 자주 묻는 질문(FAQ)을 버튼 형태로 제공 (예: "가스비 받는 법", "투자 방법").
    *   **Direct Link**: 답변 내에 관련 페이지(예: 설정 페이지, 채권 마켓)로 바로 이동하는 링크 제공.

### 3.2 제공 콘텐츠 (Knowledge Base)
기존에 작성된 `user-testing-guide.md` 및 `yield-operation-guide.md`를 기반으로 답변을 구성합니다.
*   MetaMask 설치 및 네트워크 설정법
*   Creditcoin Testnet Faucet 사용법
*   MockUSDC 수령 방법
*   채권 구매 및 Reinvest(재투자) 절차 안내

---

## 4. 기술 구현 전략 (Technical Architecture)

Vercel AI SDK를 활용하여 최신 LLM(OpenAI, Gemini)을 즉시 통합합니다. 별도의 벡터 DB 구축 없이 핵심 가이드 문서를 System Prompt에 주입(Context Injection)하여 정확도를 확보합니다.

### 4.1 기술 스택 (Tech Stack)
*   **Core Library**: `ai` (Vercel AI SDK) - React `useChat` hook 및 스트리밍 처리.
*   **Providers**: 
    *   `@ai-sdk/openai`: OpenAI (GPT-4o / GPT-3.5-turbo)
    *   `@ai-sdk/google`: Google (Gemini 1.5 Pro / Flash)
*   **Framework**: React Router v7 (Resource Route / Action 기반 API 처리)

### 4.2 구현 상세 (Implementation Details)

#### A. 환경 설정 (Environment Setup)
`.env.local`을 통해 API Key를 관리합니다.
```env
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
```

#### B. 데이터 주입 전략 (Context Injection)
벡터 DB(RAG) 대신, 관리 중인 마크다운 문서(`docs/guides/*.md`)의 내용을 텍스트로 추출하여 **System Prompt**에 직접 주입합니다. 문서 양이 적으므로(Token limit 내) 이 방식이 가장 효율적이고 정확합니다.

*   **Source 1**: `user-testing-guide.md` (테스트넷 설정, Faucet)
*   **Source 2**: `yield-operation-guide.md` (수익 배분 운영)
*   **System Prompt 예시**:
    > "너는 BondBase의 AI 가이드야. 아래의 [문서 내용]을 기반으로 사용자의 질문에 친절하게 답변해. 문서에 없는 내용은 모른다고 답하고 지어내지 마."

#### C. 모델 선택 (Model Selection)
*   **Default**: OpenAI `gpt-4o` (높은 정확도)
*   **Alternative**: Google `gemini-1.5-flash` (빠른 속도, 무료 티어 활용 가능)
*   개발 단계에서는 두 모델을 모두 연결해두고, 필요에 따라 스위칭하거나 비용 효율적인 모델을 선택합니다.

---

## 5. 실행 계획 (Action Plan)

1.  **UI 구현**:
    *   `/ai-guide` 라우트 생성.
    *   `Sidebar`에 메뉴 아이콘(Robot/Chat) 추가.
    *   ShadCN UI를 활용한 채팅방 컴포넌트 (`Bubble`, `Input`, `ScrollArea`) 개발.
2.  **데이터 구성**:
    *   `user-testing-guide.md`의 내용을 Q&A 형식(JSON)으로 변환.
3.  **로직 구현**:
    *   간단한 키워드 매칭 로직으로 사용자의 질문 의도 파악 및 답변 출력.

---

## 6. 기대 효과
이 기능이 구현되면 심사위원들에게 **"BondBase는 블록체인의 복잡성을 AI 기술로 해결하여 대중성(Mass Adoption)을 확보한 플랫폼"**이라는 강력한 인상을 줄 수 있습니다.
