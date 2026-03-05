# Relayer 운영 가이드 (Operation Specs)
> Created: 2026-02-13
> Last Updated: 2026-01-23 (테스트넷 CTC·MockUSDC 자원 섹션 추가)

BondBase Relayer 배포, 모니터링, 장애 대응을 위한 기술 명세입니다. 문서 계층 규칙(AGENTS.md 5-Layer)에 따라 **03_Specs**에 배치합니다.

## 1. 개요
BondBase Relayer는 오프체인(핀테크 수익 데이터)과 온체인(스마트 컨트랙트) 간의 데이터를 동기화하는 핵심 인프라입니다.
주기적으로 `MockFintechAPI`를 조회하여 수익이 발생하면 `OracleAdapter` 컨트랙트를 통해 온체인 상태를 업데이트합니다.

## 2. 실행 환경
- **Runtime**: Node.js v18+
- **Package Manager**: npm (v7+ workspaces)
- **Framework**: TypeScript (tsx execution)

### 2.1 실행 방법
루트 디렉토리에서 다음 명령어를 실행합니다.

```bash
# 개발 모드 (Pretty Logs)
npm run start --workspace=relayer

# 프로덕션 모드 (JSON Logs)
NODE_ENV=production npm run start --workspace=relayer
```

## 3. 환경 변수 (.env)
Relayer 실행을 위해 `relayer/.env` 파일이 필요합니다.

| 변수명 | 필수 | 설명 | 예시 |
| :--- | :---: | :--- | :--- |
| `PRIVATE_KEY` | O | Relayer 지갑의 개인키 (0x 제외) | `abcdef...` |
| `RPC_URL` | O | Creditcoin Testnet RPC URL | `https://rpc.cc3-testnet...` |
| `ORACLE_ADAPTER_ADDRESS` | O | OracleAdapter 컨트랙트 주소 | `0x123...` |
| `MOCK_USDC_ADDRESS` | O | MockUSDC 컨트랙트 주소 | `0x456...` |
| `SYNC_INTERVAL_MS` | X | 동기화 주기 (밀리초, 기본값: 60000) | `30000` |
| `LOG_LEVEL` | X | 로그 레벨 (debug, info, warn, error) | `info` |

## 4. 모니터링 및 로깅
Relayer는 `pino` 로거를 사용하여 구조화된 로그를 출력합니다.

### 4.1 로그 포맷
- **Development**: 사람이 읽기 쉬운 컬러 포맷 (`pino-pretty`)
- **Production**: 기계가 파싱하기 쉬운 JSON 라인 포맷 (ELK 스택, CloudWatch 연동 용이)

### 4.2 주요 로그 이벤트
| 레벨 | 메시지 예시 | 설명 |
| :--- | :--- | :--- |
| `INFO` | `[Bond #101] Delta detected: 250.0 USDC` | 오프체인 수익 증가 감지 |
| `INFO` | `[Bond #101] Sync OK. Tx: 0x...` | 온체인 업데이트 성공 |
| `WARN` | `[Recovery] Consecutive failures: 3` | 연속 실패 발생 (백오프 진입) |
| `ERROR` | `[FATAL] PRIVATE_KEY not found` | 치명적 오류 (프로세스 종료) |

## 5. 장애 대응 (Troubleshooting)

### 5.1 연속 실패 (Consecutive Failures)
Relayer는 RPC 연결 실패나 트랜잭션 오류 시 **Exponential Backoff** (지수 백오프) 전략을 사용하여 재시도합니다.
- 3회 연속 실패 시 RPC Provider를 자동으로 재연결합니다.
- 최대 8배수까지 대기 시간이 늘어납니다.

**조치 방법:**
1. 로그에서 `[Recovery]` 메시지 확인.
2. `RPC_URL` 상태 점검 (네트워크 장애 여부).
3. Relayer 지갑의 가스비(CTC) 잔액 확인.

### 5.2 트랜잭션 지연 (Stuck Transaction)
Nonce가 꼬이거나 가스비 급등으로 트랜잭션이 펜딩될 수 있습니다. (현재는 자동 Gas Price 조정 로직 미포함)

**조치 방법:**
1. Explorer에서 해당 지갑의 Pending 트랜잭션 확인.
2. Relayer 재시작 (메모리 상태 초기화).
3. 필요 시 동일 Nonce로 더 높은 가스비를 설정한 빈 트랜잭션 전송 (수동).

## 6. 테스트넷 자원 (CTC · MockUSDC)

테스트/데모가 끊기지 않으려면 **Relayer 지갑**에 CTC(가스비)와 MockUSDC(지급·예치용)가 충분히 있어야 합니다.

### 6.1 CTC (네이티브 가스 토큰)

| 소비처 | 설명 |
|--------|------|
| **Relayer** | Faucet 호출 시 Relayer가 `transfer` 트랜잭션 전송 → 1회당 CTC 소모. `relayDepositYield`(api/revenue 연동) 시 approve + depositYield 트랜잭션 → 1~2회당 CTC 소모. |
| **사용자(투자자)** | 사용자가 직접 서명하는 트랜잭션(USDC Approval, Bond 구매, Yield Claim 등)은 **사용자 지갑**에서 CTC로 가스비 지불. 테스트 유저 20명 각각도 CTC가 필요함. |

**공급 방법**: Creditcoin 공식 Discord `#testnet-faucet` 채널에서 `/faucet <지갑주소>` 등으로 수령. 앱 내 CTC 자동 지급 기능은 없음.

**리스크**: Relayer CTC가 부족하면 Faucet·Yield 예치가 실패하고, **투자자 CTC가 부족하면** 해당 투자자의 Approval·투자·클레임 등이 실패함. 테스트/데모 전에 Relayer뿐 아니라 **20명 테스트 투자자 지갑에도 CTC를 보충**해야 함.

### 6.2 MockUSDC (테스트용 스테이블코인)

| 소비처 | 설명 |
|--------|------|
| **Faucet** | `POST /api/faucet` 시 Relayer가 **자기 잔고에서** 500 MockUSDC를 `transfer`로 사용자에게 지급. 민팅이 아니라 Relayer 보유분 차감. 일일 전체 상한 10,000 USDC. |
| **Yield 예치** | `relayDepositYield` 시 Relayer가 보유한 MockUSDC를 YieldDistributor에 예치. Revenue Bridge로 들어온 금액만큼 Relayer가 보유하고 있어야 함. |

**공급 방법**: MockUSDC 컨트랙트의 `mint` 권한을 가진 계정이 Relayer 주소로 민팅. 예: `contracts/scripts/setup-relayer-usdc.ts` (배포/네트워크별 MockUSDC 주소·Relayer 주소 확인 후 실행).

**리스크**: Relayer MockUSDC 잔고가 부족하면 Faucet 요청이 실패하고, Yield 예치도 불가. 데모·테스트 전 Relayer MockUSDC 잔액 확인 및 필요 시 민팅으로 보충 권장.

### 6.3 테스트 유저 20명 × 500 USDC 지급

데모/테스트용으로 **20명의 테스트 유저에게 각 500 USDC**를 Faucet으로 지급하는 구성이면 된다.

| 항목 | 값 |
|------|-----|
| 인당 지급액 | 500 USDC (Faucet 1회당) |
| 20명 합계 | 20 × 500 = **10,000 USDC** |
| Faucet 일일 상한 | 10,000 USDC (동일) |

- 20명에게 각 1회씩 500 USDC를 주면 일일 상한을 정확히 사용하는 형태이다.
- **필수 조건**
  - **Relayer**: MockUSDC **최소 10,000** (20명 × 500), CTC **20회분 가스** (Faucet 트랜잭션용).
  - **20명 투자자**: 각자 지갑에 **CTC**가 있어야 Approval·Bond 구매·Yield Claim 등 본인이 서명하는 트랜잭션을 보낼 수 있음. 테스트 시 20명 전원에게 Discord Faucet 등으로 CTC를 지급할 것.
- 테스트 전 Relayer의 CTC·MockUSDC 잔액과, 가능하면 20명 투자자 지갑의 CTC 잔액도 확인하는 것을 권장함.

**MockUSDC 총 발행량 확인** (읽기 전용):  
`contracts/scripts/check-mock-usdc-supply.ts` 실행 → 총 발행량 출력. Relayer 잔액은 동 스크립트에서 `RELAYER_PRIVATE_KEY`가 설정된 환경일 때 함께 출력된다.

```bash
cd contracts && npx hardhat run scripts/check-mock-usdc-supply.ts --network creditcoin-testnet
```

### 6.4 점검 체크리스트 (테스트/데모 전)

- [ ] Relayer 지갑 CTC 잔액 확인 (Explorer 또는 `contracts/scripts/check-balance.ts`). 20명 Faucet 지급 시 20회분 가스 필요.
- [ ] Relayer 지갑 MockUSDC 잔액 확인: 20명에게 각 500 USDC 지급 시 **최소 10,000 USDC** 필요. (`check-mock-usdc-supply.ts` 또는 Explorer)
- [ ] **20명 투자자 지갑 CTC**: 각 투자자도 Approval·투자·Claim 시 가스비로 CTC 소모. Discord Faucet 등으로 20명 전원 CTC 보충.
- [ ] 필요 시 CTC: Discord Faucet으로 Relayer·**20명 테스트 투자자** 보충.
- [ ] 필요 시 MockUSDC: `setup-relayer-usdc.ts` 또는 동일 방식으로 Relayer에게 mint.

---

## 7. 배포 체크리스트
- [ ] `.env` 파일의 `PRIVATE_KEY`가 운영용 지갑인지 확인.
- [ ] `ORACLE_ADAPTER_ADDRESS`가 최신 배포된 컨트랙트인지 확인.
- [ ] `NODE_ENV=production` 설정 확인.
- [ ] 프로세스 관리 도구(PM2, Docker 등) 설정 여부. (추후 도입 예정)
- [ ] 테스트넷 사용 시: 위 6절(CTC·MockUSDC) 잔액 및 보충 경로 확인.

---

## X. Related Documents
- **Specs**: [인프라 및 개발 환경](./01_INFRASTRUCTURE.md) - RPC, V3 계약 주소
- **Specs**: [V3 배포 완료 항목 및 잔여 작업](./05_V3_DEPLOYMENT_STATUS.md) - OracleAdapter 주소 및 설정
- **Logic**: [프로젝트 작업 백로그](../04_Logic/00_BACKLOG.md) - 감사 이슈 처리 현황
- **Test**: [코드 품질 감사 보고서](../05_Test/04_CODE_QUALITY_AUDIT.md) - 감사 9.2
