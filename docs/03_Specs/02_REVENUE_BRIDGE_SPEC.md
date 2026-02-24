# 춘심톡 → BondBase Revenue Bridge 연동 스펙
> Created: 2026-02-01 16:33
> Last Updated: 2026-02-13 (Post-Phase 3 Stabilization)

**대상**: 춘심톡 백엔드 개발팀
**목적**: 춘심톡에서 BondBase `api/revenue`를 호출할 때 준수해야 할 규칙과 데이터 규격을 정의합니다.

## 1. 연동 개요

춘심톡에서 발생하는 매출(구독), 마일스톤 달성, 지표 변화(팔로워 등) 이벤트를 BondBase API에 전송합니다. 전송된 데이터는 BondBase 채권 투자자의 수익 배당 및 대시보드 시각화에 사용됩니다.

```
춘심톡 백엔드 (IP Owner)
    │
    │  POST /api/revenue (HTTPS, Bearer Token)
    ▼
BondBase API (Vercel)
    │
    ├─ DB (Turso) 기록 및 대시보드 반영
    │
    └─ Relayer (Batch Process) ──→ Creditcoin Testnet (온체인 배당)
```

## 2. 인터페이스 사양

### 2.1 공통 호출 규격
| 항목 | 값 |
|------|-----|
| Method | `POST` |
| URL | `https://{BONDBASE_DOMAIN}/api/revenue` |
| Content-Type | `application/json` |
| Authorization | `Bearer {CHOONSIM_API_KEY}` |

### 2.2 전송 데이터 타입 (Payload)

모든 요청은 `type` 필드로 구분되는 **Discriminated Union** 구조를 가집니다.

#### (A) REVENUE — 실제 매출 발생 시
실제 수익 배당의 근거가 되는 데이터입니다.
```json
{
  "type": "REVENUE",
  "data": {
    "amount": "150.50",
    "source": "SUBSCRIPTION",
    "description": "2026-02 월간 구독료 총액"
  }
}
```
*   **amount (필수)**: USDC 기준 금액 (숫자 형태의 문자열).
    *   범위: 0.01 ~ 1,000,000
    *   소수점 2자리 권장.
*   **source (필수)**: 매출 출처 (예: "SUBSCRIPTION", "SUPERCHAT", "MD_SALES").
    *   `"SUBSCRIPTION"`인 경우 시스템 내 활성 구독자 수가 자동으로 1 증가합니다.
*   **description (필수)**: 매출에 대한 설명.

#### (B) MILESTONE — 보너스 배당 이벤트 발생 시
특정 목표 달성 시 투자자에게 추가 보너스를 지급할 때 사용합니다.
```json
{
  "type": "MILESTONE",
  "data": {
    "key": "GLOBAL_65K",
    "description": "글로벌 팔로워 65,000명 돌파 기념 보너스",
    "achievedAt": 1739445000000,
    "bonusAmount": "50.00"
  }
}
```
*   **key (필수)**: 중복 처리 방지를 위한 고유 키.
*   **bonusAmount (선택)**: 해당 마일스톤 달성 시 투자자에게 즉시 배당할 보너스 금액(USDC).

#### (C) METRICS — 성장 지표 업데이트 (시각화용)
대시보드의 차트 및 지역별 파이 차트를 업데이트합니다.
```json
{
  "type": "METRICS",
  "data": {
    "followers": 65000,
    "subscribers": 1200,
    "shares": {
      "southAmerica": 75,
      "japan": 20,
      "other": 5
    }
  }
}
```
*   **followers/subscribers**: 정수형 (0 이상의 값).
*   **shares**: 지역별 비중 (합계 100 기준 권장).

## 3. 응답 규격

### 3.1 성공 (200 OK)
```json
{ "success": true }
```

### 3.2 요청 오류 (400 Bad Request)
유효성 검사 실패 시 상세 에러가 반환됩니다.
```json
{
  "success": false,
  "error": "Invalid request",
  "details": {
    "fieldErrors": {
      "data.amount": ["amount must be a non-negative number string"]
    }
  }
}
```

### 3.3 인증 오류 (401 Unauthorized)
`Authorization` 헤더가 잘못되었거나 API Key가 만료된 경우입니다.

## 4. 보안 및 오라클 검증 (Audit)

1.  **API Key 보안**: 발급된 `CHOONSIM_API_KEY`는 서버 간 통신에만 사용하며 클라이언트(App/Web) 코드에 노출되지 않도록 주의하십시오.
2.  **데이터 무결성**: 전송된 `amount`는 향후 오라클 노드에 의해 PG사(Stripe 등)의 수취 내역과 대조 검증될 수 있습니다. 실제 정산 시점의 수치와 일치해야 합니다.

---

## X. Related Documents
- **Foundation**: [Roadmap](../01_Foundation/03_ROADMAP.md) - 연동 단계 로드맵
- **Specs**: [Infrastructure Specs](./01_INFRASTRUCTURE.md) - 네트워크 및 환경 설정
- **Specs**: [Multi-Character Bond Spec](./07_MULTI_CHARACTER_BOND_SPEC.md) - 다중 캐릭터( bondId/characterId ) API 확장 및 DB 스키마
- **Logic**: [Audit Logic](../04_Logic/01_AUDIT_LOGIC.md) - 오라클 데이터 검증 로직 상세
- **Test**: [QA Checklist](../05_Test/02_QA_CHECKLIST.md) - 연동 후 테스트 항목
