# 07_Smart Contract Foundation

## 1. 작업 개요 (Task Overview)
본 작업은 BuildCTC의 핵심 비즈니스 로직을 온체인에서 처리하기 위한 스마트 컨트랙트 개발 환경을 구축하고, 첫 번째 핵심 컨트랙트인 `BondToken`을 구현하는 단계입니다. 실물 자산인 대출 채권을 ERC-1155 표준을 사용하여 토너화(Fractionalization)할 수 있는 기반을 마련합니다.

- **작업 번호**: 07
- **작업명**: Smart Contract Foundation
- **일자**: 2026-01-15
- **상태**: 완료 (Completed)

## 2. 주요 목표 (Key Objectives)
- [x] **Environment Setup**: Hardhat 개발 환경을 정리하고 Creditcoin 테스트넷 설정을 완료.
- [x] **Contract Refinement**: `BondToken.sol` (ERC-1155) 구현 및 채권 메타데이터 구조 설계.
- [x] **Unit Testing**: 컨트랙트의 발행(Mint), 전송, 권한 제어 등에 대한 단위 테스트 작성 (성공).
- [x] **Deployment Script**: 테스트넷 또는 로컬 환경에 컨트랙트를 배포하기 위한 스크립트 작성 준비.

## 3. 상세 단계 (Implementation Steps)

### Step 1: 디렉토리 구조 정리
- `/contracts` 하위에 흩어져 있는 `scripts`, `test`, `contracts` 폴더를 Hardhat 표준 구조로 재배치하여 유지보수성을 높입니다.

### Step 2: `BondToken.sol` 고도화
- 기본 ERC-1155 기능을 넘어, 각 개별 채권(ID)에 대한 메타데이터 URI를 동적으로 관리할 수 있는 로직을 추가합니다.
- `BondToken`은 플랫폼에서 승인된 관리자만 발행할 수 있도록 `Ownable` 적용을 확인합니다.

### Step 3: 단위 테스트 환경 구축
- `test/BondToken.ts`를 생성하여 다음 시나리오를 검증합니다:
  - 관리자가 채권 토큰을 발행할 수 있는가?
  - 일반 유저가 권한 없이 발행을 시도할 때 차단되는가?
  - 토큰 전송 시 공급량(Supply) 추적이 정확히 이루어지는가?

### Step 4: 배포 스크립트 작성
- `scripts/deploy.ts`를 작성하여 Creditcoin 테스트넷 네트워크에 컨트랙트를 배포할 수 있는 명령 체계를 구축합니다.

## 4. 체크리스트 (Checklist)
- [ ] Solidity 컴파일러 버전이 `0.8.20` 이상인가? (OpenZeppelin v5 호환)
- [ ] 가스 최적화를 고려한 발행 로직이 적용되었는가?
- [ ] 모든 테스트가 에러 없이 통과하는가?
- [ ] `MANDATORY BACKUP PROCEDURE`를 준수하였는가? (데이터 변경 시)

## 5. 결과 및 비고 (Results & Notes)
- (작업 완료 후 기록 예정)
