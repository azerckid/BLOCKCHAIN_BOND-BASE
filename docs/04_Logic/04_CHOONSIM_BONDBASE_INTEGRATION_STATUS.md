# 춘심톡 → BondBase 연동 현황 (전달용)

> 작성: 2026-01-23  
> 대상: 연동 담당자 / 인수인계

## 1. 춘심톡 측 정리 (전달 문구)

- **전송 구조**: 배포 환경에서 bondbase-sync가 매시간 실행되며, ChocoConsumptionLog를 characterId별로 합산해 BondBase API(BONDBASE_API_URL)로 REVENUE/METRICS를 POST하고 있습니다.
- **데이터 생성**: 배포 DB에 Mock 유저 50명을 두었고, 매시간 mock-activity로 초코 소비를 시뮬레이션해 ChocoConsumptionLog가 쌓이도록 했습니다. 따라서 보낼 데이터는 있습니다.
- **현재 이슈**: REVENUE/METRICS 요청 시 BondBase API에서 500 Internal Server Error가 반환되고 있어, 춘심톡에서는 전송을 시도하지만 BondBase 쪽에 CHOCO_CONSUMPTION이 0건으로 보이는 상태입니다.
- **요청 사항**: BondBase에서 위 API를 수신·처리할 수 있도록 준비가 되면, 500 대신 2xx를 반환해 주시면 됩니다. 그때부터 동일 호출로 CHOCO_CONSUMPTION 데이터가 정상 반영될 것입니다. (필요하면: 수신 스펙·엔드포인트·인증 방식이 맞는지 한 번만 확인해 주시면 좋겠습니다.)

**한 줄 요약**  
"춘심톡 쪽 전송·데이터 생성은 준비돼 있습니다. 현재 BondBase API가 500을 반환해서 데이터가 쌓이지 않는 상태이니, 수신 가능해지면 2xx로 응답해 주시면 연동이 됩니다."

---

## 2. BondBase 측 조치 (2026-01-23)

- **원인**: `POST /api/revenue` 처리 시 REVENUE/MILESTONE 타입에서 `relayDepositYield`(온체인 배당) 호출이 실패하면 예외가 발생하고, 이때 500을 반환하고 있었음. 배포 환경에서 Relayer 키·RPC 등으로 인해 relay가 실패하면 수신·DB 저장까지 성공했어도 500이 나가 연동이 끊긴 상태였음.
- **수정 내용**:  
  - REVENUE: DB에 revenue 저장 후 relay를 시도하고, **relay 실패 시에도 DB 기록은 유지한 채 2xx를 반환**하도록 변경. 온체인 전송 실패는 로그만 남김.  
  - MILESTONE: bonusAmount relay 실패 시에도 예외를 던지지 않고 로그만 남기고 2xx 반환.
- **결과**: 수신·검증·DB 저장이 성공하면 항상 **2xx**를 반환합니다. 춘심톡 bondbase-sync가 동일 호출을 유지하면 CHOCO_CONSUMPTION 데이터가 BondBase DB(`choonsim_revenue`)에 적재됩니다.

---

## 3. 수신 스펙·엔드포인트·인증 (확인용)

| 항목 | 값 |
|------|-----|
| Method | `POST` |
| URL | `https://{BONDBASE_DOMAIN}/api/revenue` |
| Content-Type | `application/json` |
| Authorization | `Bearer {CHOONSIM_API_KEY}` |
| 상세 스펙 | [02_REVENUE_BRIDGE_SPEC.md](../03_Specs/02_REVENUE_BRIDGE_SPEC.md) |
| 인수인계·키 설정 | [08_CHOONSIM_INTEGRATION_HANDOVER.md](../03_Specs/08_CHOONSIM_INTEGRATION_HANDOVER.md) |
