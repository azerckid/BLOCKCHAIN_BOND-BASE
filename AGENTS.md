# Antigravity Global Standards & Communication Rules

## 1. 커뮤니케이션 및 승인 원칙 (Strict Approval & Communication)
- **[No Emojis]** 사용자와의 모든 대화에서 이모지(Emoji) 및 이모티콘 사용을 전면 금지한다. 전문적이고 명확한 텍스트로만 소통한다.
- **[Query-First Mode]** 질문이나 설명 요청 시, 파일 수정이나 명령 실행을 금지하고 상세한 텍스트 답변을 최우선으로 제공한다.
- **[Strict Approval Rule]** 코드를 수정하기 전에 반드시 수정 계획을 보고하고 명시적 승인을 얻어야 한다.
- **[Context Awareness]** 코드 수정 지시가 아닌 일반적인 대화에는 응답만 수행하며, 임의로 코드를 건드리지 않는다.
- **[Clear Intent]** 코드 수정을 시작할 때는 반드시 "OOO 기능을 수정하겠습니다"라고 목적을 명확히 밝힌다.
- **[Answer First]** 사용자의 질문에 답변을 가장 먼저 완료하고, 다음 지시를 기다린다.
- **[Documentation-First]** 문서에 정의되지 않은 작업 요청 시, 구현 전 문서 업데이트 필요성을 먼저 확인한다.

## 2. 보안 및 데이터 안전 (System & Data Integrity)
- **[Database Integrity]** 모든 DB 작업(마이그레이션, 스키마 변경 등) 전 반드시 전체 백업(Dump)을 수행한다.
- **[Mandatory Backup]** 데이터 보존이 최우선이며, 백업 확인 전에는 파괴적인 명령어(DROP, Reset 등) 실행을 엄격히 금지한다.
- **[Zero-Leak Secret Policy]** `.env*` 파일의 Git 커밋을 절대 금지하며, 선제적으로 `.gitignore`를 점검한다.
- **[Environment Isolation]** Local(.env.local)과 Production(.env.production) 환경을 엄격히 격리 관리한다.

## 3. 개발 표준 및 품질 (Engineering Standards)
- **[Safe Checkpoint Strategy]** 중요 작업 시작 전 `git commit` 수행 여부를 확인하거나 요청한다.
- **[No Temporary Patches]** 임시 방편(Quick-fix)을 금지하며, 항상 공식적이고 안정적인 표준 아키텍처(Best Practice)를 따른다.
- **[Side-Effect Isolation]** 공통 로직 수정 시 영향 범위를 먼저 분석하고, 조건문 등을 통해 기존 기능에 영향이 없도록 격리한다.
- **[Precision Over Velocity]** 모든 작업에서 속도보다 **'정확성'**을 최우선 가치로 둔다. 빠르게 처리하는 것보다 프로젝트의 기술 스택(Turso DB, 온체인 환경 등)과 운영 맥락을 100% 유지하며 정확하게 구현하는 것이 본질이다.
- **[React Performance]** Vercel 엔지니어링 표준(Anti-Waterfall, Zero-Bloat)을 준수한다.

## 4. 문서 관리 표준 (Document Management)
- **[Strict Document Integrity]** 문서 수정 시 기존 구조와 세부 기술 명세를 보존하며, 전체 덮어쓰기를 금지한다.
- **[Strict Document Persistence]** 과거의 결정 사항과 이력을 추적할 수 있도록 기존 내용을 삭제하지 않고 점진적으로 업데이트한다.
- **[Structured Hierarchy]** `docs/` 하위의 **실전형 5대 디렉토리** 구조를 엄격히 준수하여 정보의 파편화를 막는다.
  - `core/`: 프로젝트 비전, 인프라 설정, 데이터 무결성 설계 등 **시스템의 근간**
  - `features/`: 개별 기능 명세서, 스마트 컨트랙트 로직, API 사양 등 **구현의 상세**
  - `roadmap/`: 전체 일정 및 Phase별 실행 계획(Plans 통합) 등 **미래의 방향**
  - `reports/`: 각 Phase 완료 보고서, QA 결과 및 발견된 이슈 내역 등 **현재의 성과**
  - `archive/`: 레거시(Legacy) 및 폐기된 문서를 격리하여 **AI의 환각(Hallucination) 방지**

## 5. 단계별 품질 보증 및 완료 조건 (Phase-Exit QA & DoD)
- **[Mandatory QA Cycle]** 각 구현 단계(Phase)를 종료하기 전, 반드시 해당 Phase의 핵심 기능에 대한 **'통합 사용자 시나리오 테스트(End-to-End User Journey Test)'**를 수행해야 한다.
- **[Phase-Exit Criteria]** 단순한 코드 작성이 아닌, **"실제 브라우저 환경에서 모든 기능이 정상 작동함"**을 브라우저 도구로 검증하고 스크린샷 등으로 증빙해야만 해당 Phase를 '완료(Complete)'로 선언할 수 있다.
- **[Strict DoD]** 
  - 1. 모든 신규 페이지 및 주요 기능 진입 가능 (No 404/White Screen)
  - 2. 데이터가 없는 상태(Empty State)와 있는 상태에서의 UI 깨짐 없음
  - 3. 에러 발생 시 사용자에게 적절한 피드백(Toast/Alert) 제공 확인
  - 4. 콘솔(Console) 창에 심각한 에러 로그(Red Errors) 부재 확인
- **[Report Verification]** 완료 보고서(Completion Report) 작성 시, 위 QA 수행 결과와 발견된 이슈의 해결 내역을 반드시 포함한다. QA를 통과하지 못한 Phase는 절대 종료할 수 없다.

## 6. 코드 리뷰 및 리팩토링 표준 (Code Review Protocol)
- **[Self-Review First]** 모든 코드 작성 후, AI 스스로 불필요한 주석 제거, 디버깅 로그(console.log) 삭제, 타입 정의(Any 사용 지양) 여부를 점검한 뒤 사용자에게 보고한다.
- **[Logic Verification]** 복잡한 로직 구현 시 반드시 로직의 의도와 동작을 주석이나 다이어그램으로 설명하여 사용자의 검증을 받는다.
- **[Refactoring Trigger]** 기존 코드가 비효율적이라면 리팩토링을 먼저 제안하고 실행한다.
- **[Security Audit]** API 엔드포인트 수정 시 자동으로 **'권한 검사 로직(Guard Clause)'**의 존재 여부를 재확인한다.

## 7. 배포 표준 (Deployment as Final DoD)
- **[Final Verification]** 모든 작업의 완결은 운영 환경(Production) 배포 및 최종 정상 작동 확인 시점으로 정의한다. 단순 로컬 실행 성공은 작업의 완료를 의미하지 않는다.
- **[Production Connectivity]** 배포 전 반드시 **정식 데이터베이스(Production DB)**와의 연결성 및 스키마 정합성을 최종 확약해야 한다.
- **[Zero-Failure Verification]** 배포 직후 실제 서비스 URL에서 주요 시나리오를 재검해 환경 차이로 인한 오류가 없음을 검증한다.

## 8. 환경변수 관리 표준 (Environment Variable Management)
- **[Strategic Isolation]** .env.development(Local)와 .env.production(Production)을 엄격히 분리한다.
- **[Zero-Leak Security]** .env* 파일은 절대 Git에 커밋하지 않으며 선제적으로 .gitignore를 점검한다.
- **[Cloud-Native Secret]** 운영 환경 변수는 호스팅 대시보드 또는 CLI로만 관리하며 파일 전송을 금지한다.

## 9. Git 커밋 컨벤션 (Commit Convention)
- **[Format]** `type(scope): 메시지` (한국어 준수)
- **[Types]** feat, fix, docs, style, refactor, test, chore (English)
- **[Detail]** 커밋 메시지는 최소 3줄 이상, 상세 내용을 - 로 시작하여 작성한다.
- **Example**:
  ```
  feat(choonsim): 춘심 성장 채권 대시보드 UI 연동
  
  - Turso DB에서 춘심 프로젝트의 실시간 팔로워 및 구독자 수 데이터 바인딩
  - 채권 수익률(APR) 계산 로직을 온체인 데이터 기반으로 정규화
  - 투자 상태에 따른 동적 애니메이션 지표 위젯 추가
  ```

## 10. 기술 스택 (Tech Stack)
- **[Validation]** 스키마 검증 및 데이터 파싱에는 **Zod**를 필수 사용한다.
- **[Time Management]** 모든 날짜와 시간 처리에는 **Luxon** 라이브러리를 사용한다.
- **[Continuity]** 어떠한 경우에도 임의로 기술 스택이나 운영 맥락을 하향 조정하지 않는다.
- **[Strict Instruction]** 중요한 것은 무엇이라도 임의로 처리하지 말 것. 처리해야 할 것이 생기면 사용자에게 반드시 물어보고 설명하고 사용자의 승인을 얻어 진행할 것.

---

## 11. Project Core Context (프로젝트 핵심 맥락)

### 11.1 프로젝트 비전 (Vision)
- **"IP 수익권 기반의 차세대 RWA 런치패드"**
- 강력한 글로벌 팬덤을 보유한 **'춘심(ChoonSim)'** IP의 수익권을 온체인 자산화(USDC 페깅)하여 투명한 수익 배분과 정서적 투자를 결합한 생태계 구축.

### 11.2 핵심 인프라 스택 (Key Infrastructure)
- **Blockchain**: Creditcoin 3.0 (CC3) Testnet
- **Database**: Turso (libSQL) / Drizzle ORM
- **AI Engine**: Google Gemini 2.0 Flash
- **Frontend**: Remix (React Router v7) / Vercel Edge Runtime
- **Oracle**: Creditcoin Universal Oracle (Audit System)

### 11.3 실시간 맥락 파악 (Status Tracking)
- 본 문서는 규칙(Rule)에 집중하므로, 현재 진행 단계는 **Rule 4**에 의거하여 항상 `docs/roadmap/`과 `docs/reports/`의 최신 파일을 참조하여 스스로 파악하고 작업을 시작한다.
