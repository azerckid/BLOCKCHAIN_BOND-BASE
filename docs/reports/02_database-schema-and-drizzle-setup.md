# 02_Database Schema and Drizzle Setup

## 1. 작업 개요 (Task Overview)
본 작업은 BuildCTC 프로젝트의 데이터 계층을 구축하는 단계입니다. Turso(SQLite)를 데이터베이스로 사용하고 Drizzle ORM을 통해 타입 안정성이 보장된 스키마 설계 및 서버 측 데이터 연동 환경을 설정합니다.

- **작업 번호**: 02
- **작업명**: Database Schema and Drizzle Setup
- **일자**: 2026-01-15
- **상태**: 진행 중 (In Progress)

## 2. 주요 목표 (Key Objectives)
- [ ] **Schema Definition**: RWA 토큰화 및 수익 배분 로직에 필요한 핵심 테이블 정의 (`bonds`, `investors`, `yields` 등).
- [ ] **Drizzle Configuration**: `drizzle.config.ts` 및 `db/index.ts` 설정 완료.
- [ ] **Type Safety**: Zod를 활용한 데이터 검증 스키마 통합.
- [ ] **Environment Setup**: `.env.development`에 Turso 연결 정보 설정 및 검증.

## 3. 상세 단계 (Implementation Steps)

### Step 1: Drizzle 환경 설정
- `frontend/drizzle.config.ts` 파일 생성.
- `frontend/app/db/index.ts`에서 LibSQL 클라이언트 초기화.

### Step 2: 테이블 스키마 설계 (`app/db/schema.ts`)
- `IMPLEMENTATION_PLAN.md`의 설계를 기반으로 Drizzle 스타일의 테이블 정의.
- `bonds`: 채권 정보 및 상태 관리.
- `investors`: 투자자 프로필 및 지갑 주소.
- `investments`: 투자 내역.
- `yield_distributions`: 수익 배분 이력.
- `repayments`: 상환 내역.

### Step 3: 마이그레이션 실행 및 검증
- `npx drizzle-kit push`를 사용하여 로컬/개발용 Turso DB에 스키마 적용.
- Drizzle Studio를 통해 테이블 구조 확인.

## 4. 체크리스트 (Checklist)
- [ ] `drizzle-kit` 명령어가 정상 동작하는가?
- [ ] 모든 테이블 간 외래키(FK) 관계가 올바르게 설정되었는가?
- [ ] `DATABASE INTEGRITY RULE`에 따라 변경 전 체크포인트가 생성되었는가?
- [ ] Zod 스키마와 Drizzle 스키마가 동기화되었는가?

## 5. 결과 및 비고 (Results & Notes)
- (작업 완료 후 기록 예정)
