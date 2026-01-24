# Database Specification (DB 사양서)

## 1. 개요
BuildCTC 프로젝트는 RWA(Real World Asset) 토큰화 플랫폼으로서, 실물 자산인 대출 채권의 데이터와 블록체인 상의 트랜잭션을 연결하는 견고한 데이터 구조를 필요로 합니다. 본 문서는 Turso(SQLite)와 Drizzle ORM을 기반으로 한 데이터베이스 설계를 정의합니다.

## 2. 기술 스택
- **Engine**: SQLite (via Turso/LibSQL)
- **ORM**: Drizzle ORM
- **Validation**: Zod (Type-safe Schema Validation)
- **Migrations**: Drizzle Kit

## 3. 데이터 모델 (ERD 및 테이블 정의)

### 3.1 Bonds (채권)
채권의 상세 정보와 온체인 상태를 관리합니다.
- `id`: (text/uuid) PK
- `bond_id`: (integer) 온체인 토큰 ID (ERC-1155)
- `borrower_name`: (text) 차입자 명칭
- `region`: (text) 차입자 거주 지역 (예: Thailand, Bangkok)
- `loan_amount`: (integer) 대출 원금 (USDC 단위, 6 decimals 기준)
- `interest_rate`: (integer) 연 이자율 (Basis points, 예: 15% -> 1500)
- `maturity_date`: (integer) 만기일 (Unix timestamp)
- `status`: (text) 상태 (PENDING, ACTIVE, REPAID, DEFAULT)
- `created_at`: (integer) 생성일자
- `updated_at`: (integer) 수정일자

### 3.2 Investors (투자자)
플랫폼 사용자의 투자 정보 및 설정 정보를 관리합니다.
- `id`: (text/uuid) PK
- `wallet_address`: (text) 지갑 주소 (Unique)
- `kyc_status`: (text) KYC 인증 상태 (NOT_STARTED, PENDING, VERIFIED, REJECTED)
- `auto_reinvest`: (integer) 자동 재투자 여부 (0: false, 1: true)
- `created_at`: (integer) 가입일자

### 3.3 Investments (투자 내역)
투자자가 채권에 투자한 개별 내역입니다.
- `id`: (text/uuid) PK
- `investor_id`: (text) FK -> investors.id
- `bond_id`: (text) FK -> bonds.id
- `token_amount`: (integer) 배정된 토큰 수량
- `usdc_amount`: (integer) 투자된 USDC 금액
- `transaction_hash`: (text) 온체인 트랜잭션 해시
- `created_at`: (integer) 투자 실행 일시

### 3.4 Yield Distributions (수익 배분)
투자자에게 지급된 이자 수익 내역입니다.
- `id`: (text/uuid) PK
- `bond_id`: (text) FK -> bonds.id
- `investor_id`: (text) FK -> investors.id
- `yield_amount`: (integer) 지급된 수익 금액 (USDC)
- `transaction_hash`: (text) 지급 트랜잭션 해시 (오프체인 기록 포함)
- `distributed_at`: (integer) 지급 일시

### 3.5 Repayments (상환 내역)
차입자가 채권에 대해 상환한 원리금 내역입니다.
- `id`: (text/uuid) PK
- `bond_id`: (text) FK -> bonds.id
- `amount`: (integer) 상환 금액
- `repayment_date`: (integer) 상환 일시
- `oracle_request_id`: (text) Creditcoin Oracle 요청 ID

## 4. 무결성 및 보안 규칙
1. **[DATABASE INTEGRITY RULE]** 모든 DDL 작업 전 반드시 데이터 덤프를 수행하거나 Git 체크포인트를 생성합니다.
2. **Soft Deletes**: 주요 금융 데이터는 물리적 삭제 대신 `deleted_at` 컬럼을 통한 논리적 삭제를 권장합니다.
3. **Audit Traces**: 모든 상태 변경(Status Update)은 히스토리가 추적 가능해야 합니다.

## 5. Zod 통합 전략
- Drizzle 스키마로부터 `select` 및 `insert` 스키마를 자동 생성하여 API 엔드포인트에서 데이터 검증에 활용합니다.
- 예시: `createSelectSchema(bonds)`
