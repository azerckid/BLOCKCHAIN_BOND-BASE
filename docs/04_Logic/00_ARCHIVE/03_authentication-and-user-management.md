# 03_Authentication and User Management

## 1. 작업 개요 (Task Overview)
본 작업은 BuildCTC 서비스의 접근 권한 관리와 투자자 식별을 위한 인증 시스템을 구축하는 단계입니다. Better Auth를 사용하여 보안이 강화된 세션 관리 및 사용자 프로필 시스템을 구현하며, 최종적으로 지갑 주소 기반의 인증 환경을 준비합니다.

- **작업 번호**: 03
- **작업명**: Authentication and User Management
- **일자**: 2026-01-15
- **상태**: 완료 (Completed)

## 2. 주요 목표 (Key Objectives)
- [x] **Better Auth Setup**: `better-auth` 및 `@paralleldrive/cuid2` 기반 설정 완료.
- [x] **Auth Schema**: `user`, `session`, `account`, `verification` 테이블 정의 및 `investors` 연동 완료.
- [x] **Auth Client/Server**: `app/lib/auth.ts`, `auth-client.ts`, `app/routes/auth.ts` 구현 완료.
- [x] **Investor Mapping**: `investors` 테이블에 `userId` 컬럼을 추가하여 투자자와 사용자 연동 구조 확립.

## 3. 상세 단계 (Implementation Steps)

### Step 1: 패키지 설치 및 환경 설정
- `better-auth` 및 데이터베이스 어댑터 설치.
- `.env.development`에 `BETTER_AUTH_SECRET` 및 관련 환경 변수 설정.

### Step 2: Auth 스키마 정의 (`app/db/schema.ts`)
- Better Auth가 요구하는 기본 테이블 스키마 추가.
- `user` 테이블과 기존 `investors` 테이블 간의 관계 설정.

### Step 3: 서버 핸들러 구현 (`app/lib/auth.ts`)
- Drizzle 어댑터를 사용한 Better Auth 인스턴스 생성.
- API 라우트 핸들러 설정 (React Router v7 Loader/Action 연동).

### Step 4: 클라이언트 사이드 연동
- UI에서 로그인 상태를 확인할 수 있는 Hook 또는 Context 설정.
- 보호된 라우트(Protected Routes) 설정 예시 구현.

## 4. 체크리스트 (Checklist)
- [ ] 인증 테이블이 DB에 정상적으로 생성되었는가?
- [ ] 세션 쿠키가 보안 규칙에 따라 올바르게 생성되는가?
- [ ] 로그인된 사용자의 지갑 주소가 `investors` 데이터와 연동되는가?
- [ ] `MANDATORY BACKUP PROCEDURE`를 준수하였는가?

## 5. 결과 및 비고 (Results & Notes)
- Better Auth 및 Drizzle 어댑터를 사용하여 SQLite 기반 인증 시스템을 성공적으로 구축함.
- `app/routes/auth.ts` 핸들러를 통해 `api/auth/*` 경로로 들어오는 모든 인증 요청을 처리할 수 있도록 설정함.
- `authClient`를 통해 프론트엔드 React 컴포넌트에서 인증 기능을 즉시 사용할 수 있는 환경을 마련함.
- `local.db`에 인증 관련 테이블을 생성하기 위한 0001 마이그레이션 파일 생성을 완료함.
- 다음 작업(04)에서는 투자자 대시보드 UI 및 기본 컴포넌트 구성을 진행할 예정임.
