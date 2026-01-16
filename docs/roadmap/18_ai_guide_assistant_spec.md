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

#### B. 데이터 주입 전략 (Context Injection Strategy)
벡터 DB(RAG)를 통한 부분 검색 방식 대신, **Direct Context Injection (Full-Text Injection)** 방식을 채택합니다. 마크다운 문서(`docs/**/*.md`)의 전체 내용을 실시간으로 추출하여 **System Prompt**에 직접 주입합니다.

*   **동기식 재귀 탐색 (Recursive Scan)**: API 요청 시마다 `docs/` 디렉토리를 재귀적으로 탐색하여 최신 가이드, 아키텍처, 로드맵 문서를 실시간으로 수집합니다. (단, `archive/` 디렉토리는 제외)
*   **Context Injection의 이점**:
    *   **정확도 극대화**: AI가 문서의 파편화된 조각이 아닌 전체 맥락(Context)을 파악하여 답변하므로 오답률이 현저히 낮습니다.
    *   **실시간 반영**: 별도의 벡터 데이터 가공(Embedding)이나 DB 동기화 없이, 관리자가 마크다운 파일을 수정하는 즉시 AI의 지식에 반영됩니다.
    *   **효율성**: 현재 프로젝트 규모(수십 개 문서 이내)에서는 최신 LLM(Gemini 2.0, GPT-4o)의 광대한 Context Window를 활용하는 것이 인프라 복잡도를 줄이는 가장 스마트한 선택입니다.

*   **System Prompt 구성**:
    > "너는 BondBase의 AI Concierge야. 아래 제공된 [Master Documents] 내용을 기반으로 기술적 세부사항(컨트랙트 주소, 체인 ID 등)을 인용하여 답변해. 문서에 없는 내용은 모른다고 답하고 지어내지 마."

#### C. 모델 선택 (Model Selection)
*   **Default**: Google `gemini-2.0-flash-exp` (최신 Long Context 모델, 빠른 응답 속도 및 높은 한국어 처리 능력)
*   **Alternative**: OpenAI `gpt-4o` (복잡한 기술적 추론 시 활용)
*   **Streaming Control**: Vercel AI SDK의 `smoothStream()` 및 `experimental_transform`을 사용하여 한 글자씩 부드럽게 나타나는 타이핑 효과를 구현합니다.

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
