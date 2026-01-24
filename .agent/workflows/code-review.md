---
description: Automated Code Review Workflow using Specialized Skills and TestSprite
---
# Automated Code Review Workflow

이 워크플로우는 Antigravity의 전문 Skill과 TestSprite를 결합하여 코드의 보안, 성능, 안정성을 자동으로 검토하는 프로세스를 정의합니다.

## 실행 단계

### 1단계: 리뷰 대상 식별
- 새로 작성되거나 수정된 파일을 식별합니다.
- 변경 사항이 있는 경우 `git diff --staged`를 통해 범위를 확정합니다.

### 2단계: 전문 Skill 기반 정적 분석

#### Solidity 스마트 컨트랙트 (.sol)
- `solidity-security-auditor` Skill을 활성화합니다.
- `SKILL.md`에 정의된 'Security Audit Checklist'에 따라 보안 취약점(Reentrancy, Access Control 등)을 진단합니다.
- 가스 최적화 전략(Storage vs Memory, Variable Packing 등)을 적용합니다.

#### React/Next.js 프론트엔드 (.tsx, .ts)
- `vercel-react-best-practices` Skill을 활성화합니다.
- Vercel 엔지니어링 표준(Waterfall 제거, Bundle Optimization, Re-render 최적화 등) 준수 여부를 검토합니다.
- Zod를 이용한 스키마 검증 및 타입 안전성이 확보되었는지 확인합니다.

### 3단계: TestSprite 기반 동적 로직 검증
- `testsprite_bootstrap` 도구를 사용하여 테스트 환경을 설정합니다.
- 프로젝트 타입에 맞는 테스트 플랜을 생성합니다 (`frontend` 또는 `backend`).
- `testsprite_generate_code_and_execute`를 실행하여 엣지 케이스 및 런타임 오류를 자동으로 점검합니다.

### 4단계: 통합 리뷰 결과 리포트 작성
- 다음 구조에 따라 최종 리포트를 작성합니다:
    1. **요약**: 전체적인 코드 품질 및 위험도 요약.
    2. **보안/성능 이슈**: 식별된 취약점 및 개선 권장 사항 (우선순위 포함).
    3. **테스트 결과**: TestSprite를 통한 로직 검증 통과 여부.
    4. **최종 승인 의견**: 변경 사항의 병합(Merge) 적합성 판단.

## 주위 사항
- 모든 리뷰 과정은 `AGENTS.md` 및 `user_rules`의 지침을 엄격히 준수해야 합니다.
- 데이터베이스나 환경 변수의 변경이 포함된 경우 백업 및 보안 규칙을 재확인합니다.
