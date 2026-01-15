# 01_Initial Base Scaffolding

## 1. 작업 개요 (Task Overview)
본 작업은 BuildCTC 프로젝트의 실제 코드가 작성될 기초 환경을 구축하는 첫 번째 단계입니다. 설정된 기술 스택(React Router v7, Drizzle, Turso, shadcn, Solidity)을 기반으로 통합 프로젝트 구조를 생성합니다.

- **작업 번호**: 01
- **작업명**: Initial Base Scaffolding
- **일자**: 2026-01-15
- **상태**: 완료 (Completed)

## 2. 주요 목표 (Key Objectives)
- [x] **Frontend**: shadcn 프리셋(Vite) 프로젝트 초기화 및 React Router v7 프레임워크 전환 완료.
- [x] **Backend/Database**: Drizzle ORM 및 Turso 연동을 위한 패키지 설치 완료.
- [x] **Smart Contracts**: Hardhat(2.22.x) 환경 구축 및 BondToken.sol 컴파일 성공.
- [x] **Project Structure**: `frontend/`, `contracts/` 디렉토리 분리 및 기초 구조 확립.

## 3. 상세 단계 (Implementation Steps)

### Step 1: shadcn 프리셋 기반 프로젝트 생성
- `frontend` 폴더에 Nova 스타일 프리셋으로 프로젝트 초기화 완료.

### Step 2: React Router v7 전환 및 통합
- `src` 디렉토리를 `app`으로 변경하고, `vite.config.ts`, `tsconfig.json`을 RRv7 프레임워크 모드로 전환.
- `root.tsx`, `routes.ts`, `routes/home.tsx` 생성.

### Step 3: Drizzle & Turso 설정
- `drizzle-orm`, `@libsql/client` 설치 완료.

### Step 4: Better Auth 초기화
- `better-auth` 패키지 설치 완료.

### Step 5: Solidity 환경 구축
- `contracts` 폴더에 Hardhat 설치 및 `BondToken.sol` 작성.
- `npx hardhat compile`을 통해 컴파일 성공 확인.

## 4. 체크리스트 (Checklist)
- [x] shadcn 프리셋 명령 성공적으로 실행됨
- [x] React Router v7 기본 라우팅 구조(app/) 설정됨
- [x] Hardhat 컴파일 성공 (21개 아티팩트 생성)
- [x] `.env` 및 `.gitignore` 설정 준비됨

## 5. 결과 및 비고 (Results & Notes)
- Hardhat 설치 시 버전 충돌(v3.1.4 자동 설치 문제)이 있었으나 v2.22.x로 강제 지정하여 해결함.
- Frontend는 Vite SPA에서 React Router v7 Framework 모드로 성공적으로 전환됨.
- 다음 작업(02)에서는 데이터베이스 스키마 설계 및 Drizzle 설정을 구체화할 예정임.
