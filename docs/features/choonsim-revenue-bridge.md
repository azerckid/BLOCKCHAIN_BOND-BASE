# [연동 스펙] 춘심톡 → BondBase Revenue Bridge

**대상**: 춘심톡 백엔드 개발팀
**목적**: 춘심톡에서 BondBase `api/revenue`를 호출할 때 준수해야 할 규칙과, 양측이 공의로 결정해야 할 사항을 정리한 문서입니다.
**작성일**: 2026-02-01

---

## 1. 연동 개요

춘심톡에서 구독·결제·마일스톤 이벤트가 발생하면, BondBase의 API에 데이터를 전송합니다.
BondBase 측은 데이터를 기록한 후 오라클 봇을 통해 온체인으로 반영합니다.

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

춘심톡은 **API 호출까지만** 책임합니다. 온체인 처리는 BondBase 내부가 자동으로 수행합니다.

---

## 2. 준수 사항 (Must Follow)

아래 항목은 춘심톡 측에서 반드시 따라야 합니다.

---

### 2.1 기본 호출 형식

| 항목 | 값 |
|------|-----|
| Method | `POST` |
| URL | `{BONDBASE_ORIGIN}/api/revenue` |
| Content-Type | `application/json` |
| Authorization | `Bearer {CHOONSIM_API_KEY}` |

- `CHOONSIM_API_KEY`는 양측 환경변수로 동일한 값이어야 합니다.
- 키가 일치하지 않거나 빠지면 **401 Unauthorized**가 반환됩니다.
- `BONDBASE_ORIGIN`은 배포 환경에 따라 다릅니다. 환경변수로 관리하세요.

---

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

| 필드 | 타입 | 필수 | 규칙 |
|------|------|------|------|
| `type` | `string` | Y | `"REVENUE"` 고정 |
| `data.amount` | `string \| number` | Y | **USDC 달러 단위**. wei가 아닙니다. 예: `"11.27"` 또는 `11.27` |
| `data.source` | `string` | Y | `"SUBSCRIPTION"` 사용 시 구독자 카운터가 증가합니다. 다른 값은 수익으로만 기록됩니다. |
| `data.description` | `string` | Y | 자유형식 설명 |

**응답**: `{ "success": true, "onChainHash": null }`

> **주의**: 응답의 `onChainHash`는 항상 `null`입니다. 온체인 처리는 BondBase 오라클 봇이 **비동기적으로** 수행합니다. 춘심톡 측에서 온체인 결과를 대기할 필요가 없습니다.

---

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

| 필드 | 타입 | 필수 | 규칙 |
|------|------|------|------|
| `type` | `string` | Y | `"MILESTONE"` 고정 |
| `data.key` | `string` | Y | 고유 식별자. **중복 전송 시 DB에 중복 기록됩니다.** 춘심톡 측에서 같은 `key`를 두 번 이상 보내지 않아야 합니다. |
| `data.description` | `string` | Y | 마일스톤 내용 |
| `data.achievedAt` | `number` | N | 달성 시각 (밀리초 타임스탬프). 미포함 시 현재 시각 자동 적용 |
| `data.bonusAmount` | `string` | N | USDC 단위 보너스 금액. **포함 시 즉시 온체인 relay됩니다** (REVENUE와 다른 흐름). |

> **주의**: `bonusAmount`가 포함되면 오라클 봇을 거치지 않고 BondBase relayer가 **즉시** 온체인 트랜잭션을 실행합니다. 이는 REVENUE의 비동기 처리와 다른 흐름입니다.

---

### 2.4 METRICS — 팬덤 지표 갱신 시

```json
{
  "type": "METRICS",
  "data": {
    "followers": 65000,
    "subscribers": 1300,
    "shares": {
      "southAmerica": 75,
      "japan": 20,
      "other": 5
    }
  }
}
```

| 필드 | 타입 | 필수 | 규칙 |
|------|------|------|------|
| `type` | `string` | Y | `"METRICS"` 고정 |
| `data.followers` | `number` | Y | 현재 팔로워 총수 |
| `data.subscribers` | `number` | Y | 현재 구독자 총수 |
| `data.shares` | `object` | N | 지역별 비율 (`southAmerica`, `japan`, `other`). 미포함 시 기본값 `70 / 30 / 0` 적용 |

> **주의**: METRICS는 **현재값 덮어쓰기**입니다. 증분값이 아닙니다. 매번 최신 총합을 전송해야 합니다. 주기적으로 호출하여 지표를 갱신하세요.

---

### 2.5 오라클 검증을 위한 결제 조건

BondBase는 춘심톡이 전송한 수익 데이터를 **제3의 독립 시스템**과 교차 검증합니다 (Zero-Trust 모델).
오라클이 검증할 수 있도록, 춘심톡 측에서 다음을 준수해야 합니다.

| # | 조건 | 설명 |
|---|------|------|
| 1 | 실제 결제는 **검증 가능한 결제 Gateway**를 통해 처리 | PayPal, Stripe, Toss 등의 결제 API 로그가 오라클에 의해 직접 조회됩니다. |
| 2 | `amount` 값은 Gateway의 **실제 수취 금액과 정확히 일치** | 단 1원이라도 다르면 오라클 검증 실패. 해당 수익은 PENDING 상태로 유지되어 투자자에게 배분되지 않습니다. |
| 3 | App Store / Play Store 구독 수익은 **개발자 리포트 API**로 확인 가능해야 함 | 오라클이 Apple / Google의 공식 정산 API를 참조합니다. |

---

## 3. 공의로 결정해야 할 사항 (Must Decide Together)

아래 항목은 현재 미확정이며, 양측 간 협의가 필요합니다.
각 항목에 **춘심톡 측 현재 상황**을 추가해서 회신해주세요.

---

### 3.1 통화·단위 매핑

춘심톡 내부에서 사용하는 통화와 USDC 달러 단위 간의 변환 규칙을 정의해야 합니다.

| 질문 | 예시 |
|------|------|
| 춘심톡 내부 결제 통화는? | KRW / JPY / BRL / USD 등 |
| 환율 변환 시점은? | 결제 완료 시점 실시간 환율? 일정 기준환율? |
| 환율 소스는? | 특정 API (예: Upbit, CoinGecko) |

---

### 3.2 웹훅 보안 강화

현재 BondBase API는 Bearer 토큰만으로 인증합니다. 추가 보안 措施가 필요하지 않는지 판단해야 합니다.

| 옵션 | 내용 |
|------|------|
| **IP 화이트리스트** | 춘심톡 백엔드 서버 IP를 BondBase 측에 등록하여 해당 IP에서만 호출 허용 |
| **요청 서명 검증** | 춘심톡이 요청본문을 HMAC 등으로 서명하여 포함. BondBase가 서명을 검증 |
| **현행 유지** | Bearer 토큰만으로 충분하다고 판단하는 경우 |

---

### 3.3 중복 방지 전략

현재 BondBase API 측에 중복 검사 로직이 없습니다.
춘심톡이 재시도하거나 같은 이벤트를 두 번 전송하면 **중복 수익 기록**이 생깁니다.

| 질문 | 결정 필요 |
|------|-----------|
| 춘심톡 측에서 자체 dedup을 처리할 수 있는가? | 예: 내부 DB에 전송 여부 기록 후 재시도 시 스킵 |
| BondBase 측에 幂等 키(idempotency key) 지원을 추가해야 하는가? | 예: 춘심톡이 고유 키를 포함하여 전송 → BondBase가 중복 키 시 스킵 |

---

### 3.4 수익 source 분류체계

현재 BondBase API는 `source` 값에 대한 제약이 없습니다.
그러나 `"SUBSCRIPTION"`만이 구독자 카운터 증가를 트리거합니다.
춘심톡에서 사용할 source 종류를 정리해야 합니다.

| source 후보 | 의미 | 카운터 증가 여부 |
|-------------|------|------------------|
| `SUBSCRIPTION` | 월 구독료 | O |
| `ROYALTY` | IP 라이선스 로얼티 | X |
| `GOODS_SALES` | 굿즈 판매 매출 | X |
| `EVENT` | 이벤트 수익 | X |
| 기타? | 춘심톡 측에 추가 종류가 있으면 제안 | — |

---

### 3.5 앱–웹 연동 방식

춘심톡 앱 내에서 BondBase 기능(지갑 연결, 수익 조회 등)을 제공하려면 연동 방식을 확정해야 합니다.

| 옵션 | 내용 | 고려사항 |
|------|------|----------|
| **Deep Link** | 앱에서 BondBase 웹사이트로 외부 이동 | 간단하지만 앱 내 경험 단절 |
| **WebView** | 앱 내 WebView로 BondBase 페이지 렌더링 | 앱 내 경험 유지, 지갑 연결 복잡도 높음 |
| **미니앱** | BondBase의 핵심 기능을 춘심톡 앱 내 미니앱으로 구현 | 최고의 UX, 개발 공유가 가장 큼 |

---

## 4. 회신 요청사항

아래 항목에 춘심톡 측 답변을 채워서 회신해주세요.

| # | 질문 | 춘심톡 답변 |
|---|------|-------------|
| 1 | 내부 결제 통화와 환율 변환 방식 | |
| 2 | 웹훅 보안: IP 화이트리스트 / 서명 검증 / 현행 유지 중 선택 | |
| 3 | 중복 방지: 자체 dedup 가능 여부 | |
| 4 | 사용할 source 종류 목록 | |
| 5 | 앱–웹 연동 방식 선택 | |
| 6 | 춘심톡 백엔드 서버 IP (화이트리스트 필요 시) | |

---

**참조 문서** (BondBase 내부용):
- `docs/roadmap/07_IMPLEMENTATION_BASELINE.md` §2 (Part A 구현 계획)
- `docs/core/05_CHOONSIM_AUDIT_DATA_INTEGRITY_DESIGN.md` (오라클 검증 설계)
- `docs/core/01_BOND-BASE_CHOONSIM_INTEGRATION_PLAN.md` (연동 비전)
