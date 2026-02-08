# Admin Portal Specification: Yield Distribution Management
> Created: 2026-01-16 10:48
> Last Updated: 2026-02-09

## 1. 개요 (Overview)
본 문서는 BondBase 프로젝트의 안전하고 효율적인 운영을 위한 **관리자 전용 포털(Admin Portal)**의 설계 사양을 정의합니다. 기존의 블록 익스플로러를 통한 수동 운영 방식에서 탈피하여, 웹 인터페이스 내에서 직관적이고 오류 없는 자산 운영 환경을 구축하는 것을 목적으로 합니다.

> **구현 현황**: Admin Portal은 별도 애플리케이션이 아닌, 메인 프론트엔드(`frontend/app/routes/admin.tsx`) 내 **통합 라우트(`/admin`)**로 구현되어 있습니다. `DISTRIBUTOR_ROLE` 기반 접근 제어를 통해 관리자만 접근 가능합니다.

## 2. 핵심 목표 (Goal)
- **보안성**: 브라우저 보안 경고 없이 신뢰할 수 있는 환경에서 트랜잭션 실행.
- **편의성**: 복잡한 소수점 변환 및 중복 트랜잭션(`Approve` → `Deposit`) 자동화.
- **정확성**: 실시간 잔액 조회를 통한 입금 실패 방지.

## 3. 핵심 기능 요구사항 (Core Requirements)

### 3.1 지갑 연결 및 권한 검증
- **Wallet Connection**: WalletConnect, MetaMask 연동.
- **Access Control**: `DISTRIBUTOR_ROLE` 보유 여부 검증 및 인터페이스 제어.

### 3.2 스마트 수익 배분 모듈 (Smart Yield Distribution)
- **Step-by-Step Flow**:
    1. 관리자가 달러 단위(USDC)로 금액 입력.
    2. `Allowance` 자동 조회 후 `Approve` 필요 여부 판단.
    3. 단일 UI 액션으로 `Approve` → `Deposit` 멀티 트랜잭션 가이드 제공.
- **Unit Conversion**: `parseUnits(amount, 18)` 내부 자동 처리.

### 3.3 대시보드 모니터링
- **관리자 잔액**: 보유 `MockUSDC` 수량 상시 노출.
- **글로벌 보상 상태**: `rewardPerTokenStored` 기반 총 배분 결과 현황 시각화.

## 4. 기술 스택
- **Frontend**: React Router v7 (Vite) - 메인 대시보드 내 `/admin` 라우트로 통합 구현
- **Styling**: Tailwind CSS v4, shadcn/ui
- **On-chain**: `wagmi` (v3), `viem` (v2)
- **주요 컴포넌트**: `yield-deposit-module.tsx`, `oracle-trigger-module.tsx`, `advanced-oracle-module.tsx`

---

## X. Related Documents
- **Foundation**: [Roadmap](../01_Foundation/03_ROADMAP.md) - 어드민 포털 개발 로드맵 포함
- **Specs**: [Infrastructure Specs](./01_INFRASTRUCTURE.md) - 스마트 컨트랙트 및 네트워크 정보
- **Logic**: [Audit Logic](../04_Logic/01_AUDIT_LOGIC.md) - 배분 대장 기록 로직
