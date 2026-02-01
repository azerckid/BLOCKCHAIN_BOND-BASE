# UX Upgrade Plan: Gasless Transaction Implementation
**Target Version**: V3 or Later
**Purpose**: Reduce user onboarding friction by subsidizing gas fees (CTC) for bond interactions.

---

## 1. 개요 (Overview)
현재 사용자는 모든 트랜잭션(투자, 클레임 등)을 위해 테스트넷 코인(CTC)을 직접 확보해야 합니다. 이는 Web3에 익숙하지 않은 사용자에게 큰 진입 장벽입니다. 
본 문서는 서비스 제공자가 가스비를 대납(Paymaster)하여, 사용자는 서명만으로 기능을 이용할 수 있게 하는 **Gasless(Meta-Transaction)** 도입 계획을 정리합니다.

---

## 2. 기술 아키텍처 (Technical Architecture)

표준 **ERC-2771 (Trusted Forwarder)** 패턴을 도입하여 구현합니다.

### 2.1 구성 요소
1.  **User (Wallet)**: 트랜잭션을 직접 전송하지 않고, 의도(Intent)가 담긴 데이터에 서명(EIP-712)만 수행.
2.  **Relayer (Backend)**: 사용자의 서명을 받아 검증한 뒤, 자신의 가스비(CTC)를 사용하여 블록체인에 트랜잭션 전송.
3.  **Forwarder (Contract)**: Relayer로부터 요청을 받아 서명을 검증하고, 실제 타겟 컨트랙트(BondToken 등)를 호출.
4.  **Target Contracts**: `ERC2771Context`를 상속받아, 요청자가 Relayer가 아닌 '원래 사용자'임을 인식.

---

## 3. 구현 상세 (Implementation Steps)

### Step 1: 스마트 컨트랙트 업그레이드
기존 모든 컨트랙트에 `ERC2771Context` 적용이 필요합니다.

*   **BondToken.sol / YieldDistributorV2.sol**:
    *   상속: `is ERC2771Context`
    *   변경: `msg.sender` -> `_msgSender()` 로 전면 교체.
    *   생성자: Trusted Forwarder 주소를 주입받도록 수정.

```solidity
// 예시 코드
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract YieldDistributorV2 is ERC2771Context {
    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) { ... }

    function claimYield(uint256 bondId) external {
        address user = _msgSender(); // msg.sender 대신 사용
        ...
    }
}
```

### Step 2: Relayer 인프라 구축
다음 솔루션 중 하나를 선택하여 도입합니다.

*   **옵션 A: Saas (추천 - Gelato, Biconomy, OpenZeppelin Defender)**
    *   별도 서버 구축 없이 API 키만으로 사용 가능.
    *   통계 및 가스비 추적 대시보드 제공.
*   **옵션 B: 자체 구축 (OpenGSN)**
    *   자체 Relayer 서버 운영. 유지보수 비용 높음.

### Step 3: 프론트엔드 연동
`wagmi/viem` 로직을 다음과 같이 변경합니다.

*   **BEFORE**: `writeContract` (지갑 팝업 -> 가스비 승인)
*   **AFTER**: 
    1.  `signTypedData` (지갑 팝업 -> 서명만, 가스비 0)
    2.  서명 데이터를 우리 백엔드 API (`/api/relay`)로 전송.
    3.  백엔드가 블록체인 전송 후 TxHash 반환.

---

## 4. 보안 고려사항 (Security)

1.  **Trusted Forwarder 관리**: Forwarder 주소는 절대적으로 신뢰할 수 있어야 하며, 변경 불가능하거나 Timelock이 걸려야 함.
2.  **DoS 방지 (Rate Limiting)**: 한 사용자가 무한정 트랜잭션을 보내 가스비를 고갈시키지 않도록 API 레벨에서 요청 횟수 제한 필요.
3.  **화이트리스트**: 우리가 허용한 함수(`purchase`, `reinvest` 등)만 대납하도록 Forwarder 설정.

---

## 5. 마이그레이션 전략
기존 배포된 V2 컨트랙트는 `ERC2771`을 지원하지 않으므로, 도입 시 **전체 재배포(Redeploy) 및 데이터 마이그레이션**이 필수입니다. 따라서 주요 버전 업그레이드(V3) 시점에 적용하는 것이 적절합니다.
