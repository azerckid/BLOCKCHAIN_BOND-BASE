# Relayer 운영 가이드 (Operation Specs)

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

## 6. 배포 체크리스트
- [ ] `.env` 파일의 `PRIVATE_KEY`가 운영용 지갑인지 확인.
- [ ] `ORACLE_ADAPTER_ADDRESS`가 최신 배포된 컨트랙트인지 확인.
- [ ] `NODE_ENV=production` 설정 확인.
- [ ] 프로세스 관리 도구(PM2, Docker 등) 설정 여부. (추후 도입 예정)
