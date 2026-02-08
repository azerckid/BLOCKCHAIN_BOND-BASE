# 플랫폼 정규화 및 춘심 전용 브랜딩 계획
> Created: 2026-01-25 14:07
> Last Updated: 2026-02-09 03:52

## 1. 정규화(Normalization) 배경 및 목적
BondBase 플랫폼은 초기 태국 소상공인 대출(MSME Loan) 모델을 기반으로 설계되었으나, 현재 **춘심 AI-Talk IP** 기반의 RWA로 핵심 사업 모델이 피벗되었습니다. 기존의 태출 대출 관련 명칭, 시각적 자산, 데이터 구조는 투자자에게 혼란을 주며 프로젝트의 전문성을 저해하고 있습니다. 

본 계획은 Phase 4 진입 전, 플랫폼의 모든 요소를 춘심 AI-Talk 전용으로 최적화하여 **브랜드 일관성(Brand Consistency)**을 확보하는 데 목적이 있습니다.

## 2. 정규화 대상 및 수정 계획

### 2.1 UI/UX 인터페이스 (Rebranding)
- **메뉴 명칭 고도화**:
    - `Impact Map` → `Fandom Impact Map` (태국 지역 지도에서 글로벌 팬덤 분포도로 전환)
    - `Bond Market` → `Growth Market` 또는 `IP Bond Market`
- **시각적 자산 교체**:
    - 기존 태국 농민/소상공인 관련 더미 이미지 전면 제거.
    - `generate_image` 도구를 활용하여 춘심이의 글로벌 활동(일본, 남미, 메타버스 등)을 상징하는 프리미엄 아트워크로 대체.
- **용어 정제(Terminology)**:
    - 'Loan', 'Borrower', 'Repayment' → 'Subscription', 'IP Owner', 'Revenue Share'로 전면 교체.

### 2.2 데이터베이스 및 컨텐츠 (Data Archiving & Filtering)
- **Legacy 데이터 격리**:
    - 기존 태국 대출 데이터(Bond ID 1~10)를 삭제하지 않고 `status`를 `LEGACY`로 변경.
    - 프론트엔드 API 호출 시 `status = 'ACTIVE'` 필터를 적용하여 춘심 관련 데이터만 기본 노출.
- **컨텐츠 리모델링**:
    - `Impact Map`의 소스 데이터를 태국 지도에서 글로벌 팬덤 분포로 전환 (인프라는 재사용, 컨텐츠만 교체).
    - `AI Guide`의 텍스트를 IP RWA 투자 가이드라인으로 전면 개편.

### 2.3 시스템 로직 (System Logic)
- **Primary Alpha 고정**:
    - 채권 리스트(`/bonds`) 진입 시, 춘심 채권(ID: 101)을 최상단 Primary Alpha로 고정하고 기존 Legacy 채권은 노출 제외 처리.

## 3. 상세 이행 로드맵

| 단계 | 작업 항목 | 기대 결과 |
| :--- | :--- | :--- |
| **Step 1** | 사이드바 및 헤더 용어/아이콘 정규화 | 브랜드 정체성 확립 |
| **Step 2** | DB 내 더미/Legacy 데이터 청소 | 데이터 무결성 확보 |
| **Step 3** | Impact Map/AI Guide 컨텐츠 교체 | 유저 혼란 제거 |
| **Step 4** | 최종 통합 테스트 및 시각적 검수 | Phase 4 진입 준비 완료 |

## 4. 향후 영향도 분석
- 본 작업은 기존 기능의 로직 변경이 아닌, **표현 계층(Presentation Layer)과 데이터 정규화**에 집중하므로 스마트 컨트랙트의 잔액이나 수익금 계산에는 영향을 미치지 않습니다.
- 투자자에게는 "춘심 전용 전문 투자 플랫폼"이라는 강력한 인상을 심어주어 유입률을 높일 것으로 기대됩니다.

---

## X. Related Documents
- **Foundation**: [Project Overview](./00_PROJECT_OVERVIEW.md) - 전체 프로젝트 비전 및 기술 스택
- **Foundation**: [Roadmap](./03_ROADMAP.md) - 정규화 일정이 포함된 전체 로드맵
- **Logic**: [Backlog](../04_Logic/00_BACKLOG.md) - 정규화 관련 상세 작업 현황
