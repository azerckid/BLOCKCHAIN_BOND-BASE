# V3 배포 완료 항목 및 잔여 작업 (V3 Deployment Status & Checklist)
> Created: 2026-01-23
> Last Updated: 2026-01-23 (Choice B 및 Pausable ABI 반영)

본 문서는 Creditcoin Testnet 기준 **V3 스마트 컨트랙트 배포** 이후 완료된 설정과, 선택·잔여 작업을 명시합니다. 문서 계층 규칙(AGENTS.md 5-Layer Structure)에 따라 **03_Specs**에 배치하며, 인프라 명세(01_INFRASTRUCTURE.md)와 함께 참조합니다.

---

## 1. 완료된 내용 (Completed)

### 1.1 V3 컨트랙트 배포
- **MockUSDC (V3)**: `0x03E7d375e76A105784BFF5867f608541e89D311B`
- **BondToken (V3)**: `0x01607c3Ff57e3234702f55156E4356e3036f8D4E`
- **YieldDistributor (V3)**: `0x0D38d19dA1dC7F018d9B31963860A39329bf6974`
- **LiquidityPool (V3)**: `0xC86F94d895331855C9ac7E43a9d96cf285512B31`
- 배포 스크립트: `contracts/scripts/redeploy_v3.ts` (setBondToken 등 Creditcoin testnet calldata 이슈 대응 반영)

### 1.2 OracleAdapter (선택 B 적용 완료)
- **V3 전용 OracleAdapter**: `0xDaD165Ba828bD90f0e4897D92005bb1660f4785f` 신규 배포
- 생성자: V3 YieldDistributor + V3 MockUSDC 사용. 프론트·릴레이어·YD가 동일한 V3 MockUSDC 기준으로 동작함.
- `YieldDistributor.grantRole(DISTRIBUTOR_ROLE, 신규 OracleAdapter)` 실행 완료.
- `OracleAdapter.grantRole(ORACLE_ROLE, deployer)` 실행 완료.
- 배포 스크립트: `contracts/scripts/deploy-oracle-adapter-v3.ts`

### 1.3 YieldDistributor 사후 설정
- `YieldDistributor.grantRole(DISTRIBUTOR_ROLE, OracleAdapter)` 실행 완료 (기존 OA 후, 선택 B로 신규 OA에도 부여 완료)
- `YieldDistributor.registerBond(101)` 실행 완료 (Choonsim Bond ID 101)
- `YieldDistributor.setAuditRequirement(101, true)` 실행 완료
- 실행 스크립트: `contracts/scripts/setup-v3-post-deploy.ts` (Creditcoin testnet에서 calldata 유지를 위해 `ethers.Wallet` + `signTransaction` / `broadcastTransaction` 사용)

### 1.4 프론트엔드·릴레이어·문서 주소 갱신
- **frontend/app/config/contracts.ts**: MockUSDC, BondToken, LiquidityPool, YieldDistributor, **OracleAdapter(V3)** 주소 반영. LiquidityPool·YieldDistributor ABI에 **pause, unpause, paused** 추가 완료.
- **relayer/src/config.ts**: `MOCK_USDC_ADDRESS` V3, `ORACLE_ADAPTER_ADDRESS` 신규 V3 OracleAdapter(`0xDaD165...`) 반영
- **docs/03_Specs/01_INFRASTRUCTURE.md**: V3 계약 주소 표 갱신

---

## 2. 해야 할 내용 (Remaining / Optional)

- **OracleAdapter**: 선택 B 적용 완료. 신규 V3 OracleAdapter 배포 및 주소 갱신 완료.
- **USDC 정합성**: 선택 B로 V3 MockUSDC 일원화 완료. 별도 조치 없음.
- **ABI (Pausable)**: `frontend/app/config/contracts.ts`에 LiquidityPool·YieldDistributor용 **pause**, **unpause**, **paused** 추가 완료.
- 현재 컨트랙트 관련 잔여 작업 없음.

<!-- 이전 선택 A/B 표 및 권장 순서는 Choice B 적용으로 위 요약으로 대체함 -->

### 2.1 (참고) OracleAdapter 선택 A/B
| 선택 | 설명 | 조치 |
|------|------|------|
| **A (현재)** | 기존 OracleAdapter 사용. YD만 V3로 연결, USDC는 Oracle 흐름에서 **구 MockUSDC** 사용 | 추가 조치 없음. Oracle이 depositYield 할 때 구 MockUSDC 사용 필요함을 문서·릴레이어에서 유지 |
| **B** | V3 체인과 완전 일치 | OracleAdapter를 **신규 배포**(신규 YD + 신규 MockUSDC) → relayer `ORACLE_ADAPTER_ADDRESS` 갱신 → 신규 YD에서 `grantRole(DISTRIBUTOR_ROLE, 신규 OracleAdapter)` 실행 |

### 2.2 선택 A 시 USDC 정합성
- OracleAdapter 내부 `usdcToken`은 구 MockUSDC이므로, Relayer가 yield 푸시 시 **구 MockUSDC**를 사용해야 depositYield가 정상 동작함.
- 현재 relayer `MOCK_USDC_ADDRESS`는 V3 주소로 되어 있음. 선택 A를 유지하면서 Oracle 전용으로 구 MockUSDC 주소가 필요하면, 설정 분리(예: `ORACLE_USDC_ADDRESS`) 또는 문서에 “Oracle용 USDC = 구 MockUSDC” 명시 권장.

### 2.3 ABI (선택)
- Admin UI에서 **LiquidityPool / YieldDistributor**의 일시정지·재개를 사용할 계획이면, `frontend/app/config/contracts.ts`의 해당 컨트랙트 ABI에 **pause**, **unpause**, **paused** 항목을 추가하는 것이 좋음.

---

## 3. (참고) 권장 순서 (Choice B 적용으로 위 2절 요약 참고)

1. **OracleAdapter 정책 확정**: 선택 A 유지 vs 선택 B(신규 배포 후 relayer·YD 설정)
2. **선택 A 유지 시**: Oracle depositYield 흐름용 USDC 주소(구 MockUSDC)를 relayer 또는 문서에 명시
3. **선택 B 진행 시**: OracleAdapter 신규 배포 → relayer `ORACLE_ADAPTER_ADDRESS` 갱신 → `setup-v3-post-deploy.ts`와 동일한 방식으로 신규 YD에 `grantRole(DISTRIBUTOR_ROLE, 신규 OracleAdapter)` 실행
4. **ABI**: Admin에서 pause/unpause 사용 예정이면 `contracts.ts`에 Pausable 함수 추가

---

## 4. 참고: 사후 설정 스크립트

### 4.1 기존 V3 연동·Bond 101 (이미 실행된 경우 스킵)
```bash
cd contracts
npx hardhat run scripts/setup-v3-post-deploy.ts --network creditcoin-testnet
```

- `PRIVATE_KEY` 환경 변수 필요 (YieldDistributor 트랜잭션 서명용)
- OracleAdapter setYieldDistributor, YD grantRole, registerBond(101), setAuditRequirement(101, true). 이미 완료된 항목은 스크립트 내에서 “Already set. Skip.” 등으로 스킵됨

### 4.2 V3 전용 OracleAdapter 신규 배포 (Choice B, 1회 실행 완료)
```bash
cd contracts
npx hardhat run scripts/deploy-oracle-adapter-v3.ts --network creditcoin-testnet
```
- 출력된 `NEW_ORACLE_ADAPTER_ADDRESS`를 frontend/relayer 설정에 반영 (본 배포에서 이미 반영됨: `0xDaD165Ba828bD90f0e4897D92005bb1660f4785f`)

---

## X. Related Documents
- **Specs**: [인프라 및 개발 환경](./01_INFRASTRUCTURE.md) - 네트워크, 배포 환경, V3 계약 주소 요약
- **Logic**: [코드 품질 개선 구현 계획](../04_Logic/02_QUALITY_IMPROVEMENT_PLAN.md) - Phase 3 컨트랙트 강화 및 배포 계획
- **Foundation**: [로드맵](../01_Foundation/03_ROADMAP.md) - 개발 단계 로드맵
