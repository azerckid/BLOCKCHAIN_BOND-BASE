# 춘심톡 → BondBase Revenue Bridge 연동 스펙
> Created: 2026-02-01 16:33
> Last Updated: 2026-02-09 03:58

**대상**: 춘심톡 백엔드 개발팀
**목적**: 춘심톡에서 BondBase `api/revenue`를 호출할 때 준수해야 할 규칙과, 양측이 합의해야 할 기술적 사양을 정의합니다.

## 1. 연동 개요

춘심톡에서 구독·결제·마일스톤 이벤트가 발생하면, BondBase의 API에 데이터를 전송합니다. BondBase 측은 데이터를 기록한 후 오라클 봇을 통해 온체인으로 반영합니다.

```
춘심톡 백엔드
    │
    │  POST /api/revenue  (Bearer Token 인증)
    ▼
BondBase API (Vercel)
    │
    ├─ DB (Turso) 기록
    │
    └─ Oracle Bot (폴링) ──→ Creditcoin Testnet (스마트 컨트랑트)
```

춘심톡은 **API 호출까지만** 책임집니다. 온체인 처리는 BondBase 내부 시스템이 자동으로 수행합니다.

## 2. 준수 사항 (Must Follow)

### 2.1 기본 호출 형식
| 항목 | 값 |
|------|-----|
| Method | `POST` |
| URL | `{BONDBASE_ORIGIN}/api/revenue` |
| Content-Type | `application/json` |
| Authorization | `Bearer {CHOONSIM_API_KEY}` |

### 2.2 REVENUE — 구독·매출 발생 시
```json
{
  "type": "REVENUE",
  "data": {
    "amount": "11.27",
    "source": "SUBSCRIPTION",
    "description": "월 구독료 수입 - 2026년 2월"
  }
}
```
- `data.amount`: **USDC 달러 단위** (예: "11.27").
- `data.source`: `"SUBSCRIPTION"` 사용 시 구독자 카운터가 증가합니다.

### 2.3 MILESTONE — 마일스톤 달성 시
```json
{
  "type": "MILESTONE",
  "data": {
    "key": "FANS_65K",
    "description": "글로벌 팬 6만5천명 달성",
    "achievedAt": 1738000000000,
    "bonusAmount": "5.00"
  }
}
```
- `data.key`: 고유 식별자. 중복 전송 방지를 위해 춘심톡 측에서 관리 필수.

## 3. 오라클 검증을 위한 결제 조건 (Audit)

BondBase는 춘심톡이 전송한 수익 데이터를 **제3의 독립 시스템(PG사 로그 등)**과 교차 검증합니다.
- 실제 결제는 Stripe, PayPal 등 검증 가능한 Gateway를 통해 처리되어야 함.
- 전송된 `amount`는 Gateway의 실제 수취 금액과 정확히 일치해야 함.

---

## X. Related Documents
- **Foundation**: [Integration Plan](../01_Foundation/01_INTEGRATION_PLAN.md) - 춘심 연동 기획 원칙
- **Foundation**: [Roadmap](../01_Foundation/03_ROADMAP.md) - 연동 단계 로드맵
- **Specs**: [Infrastructure Specs](./01_INFRASTRUCTURE.md) - 네트워크 및 환경 설정
- **Logic**: [Audit Logic](../04_Logic/01_AUDIT_LOGIC.md) - 오라클 데이터 검증 로직 상세
