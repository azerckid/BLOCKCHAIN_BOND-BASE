# 다중 캐릭터(채권) 연동 스펙 — API bondId 확장 및 DB 스키마
> Created: 2026-01-23
> Last Updated: 2026-01-23

**대상**: BondBase 개발팀, 춘심톡 백엔드 개발팀
**목적**: 춘심톡 내 여러 캐릭터별로 채권(bondId)을 구분하여 수익·지표를 기록하고 온체인 배당을 지원하기 위한 API 확장 및 DB 변경 포인트를 정의합니다. 기존 [Revenue Bridge Spec](./02_REVENUE_BRIDGE_SPEC.md)을 확장합니다.

---

## 1. 연동 개요

- **현재**: 단일 캐릭터(춘심) = 단일 bondId(101). `POST /api/revenue`는 bondId 없이 호출되며, 모든 수익이 bond 101에 연결됩니다.
- **목표**: 캐릭터 1명 = 온체인 bondId 1개. API 요청에 `bondId`(또는 `characterId`)를 포함하여, 캐릭터별로 수익·마일스톤·메트릭스를 구분 저장 및 배당합니다.

```
춘심톡 백엔드 (캐릭터 A, B, C …)
    │
    │  POST /api/revenue  { "bondId": 101 | 102 | 103, "type": "REVENUE", "data": { … } }
    ▼
BondBase API (Vercel)
    │
    ├─ DB (Turso) — 캐릭터(project)별 revenue / milestone / metrics
    │
    └─ Relayer — bondId별 depositYield(bondId, amount) → Creditcoin Testnet
```

---

## 2. API 확장 사양

### 2.1 공통: Payload에 bondId 추가

모든 `POST /api/revenue` 요청 본문에 **최상위 필드**로 다음 중 하나를 사용합니다.

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `bondId` | number (정수) | 권장 | 온체인 채권 ID. 101, 102, 103 … |
| `characterId` | string | 선택 | 캐릭터 식별자. 서버에서 bondId와 매핑 테이블로 연결 가능. |

- **권장**: 온체인과 1:1 대응이 명확하므로 **`bondId`** 사용.
- **호환**: 구현 1단계에서 `bondId` 생략 시 기존과 동일하게 **101**로 처리(하위 호환).

### 2.2 REVENUE 페이로드 예시 (bondId 포함)

```json
{
  "bondId": 102,
  "type": "REVENUE",
  "data": {
    "amount": "150.50",
    "source": "SUBSCRIPTION",
    "description": "캐릭터 B 2026-02 월간 구독료"
  }
}
```

- 동일하게 **MILESTONE**, **METRICS** 타입에도 최상위에 `bondId`(또는 `characterId`)를 둡니다.

### 2.3 검증 규칙 (Zod 등)

- `bondId`: `z.number().int().positive()` (또는 허용 목록에 있는지 화이트리스트 검증 권장).
- `characterId`: `z.string().min(1).optional()`. 사용 시 서버에서 `characterId → bondId` 매핑 테이블/설정으로 변환.
- **생략 시**: `bondId` 없음 → 기본값 101 적용(기존 단일 캐릭터 동작).

### 2.4 응답 및 에러

- **400**: `bondId`가 허용 목록에 없거나, 타입/범위 오류.
- **404**: 해당 `bondId`에 대한 프로젝트가 DB에 없고, 자동 생성도 하지 않는 정책인 경우(선택 사항).
- 성공 시 응답 형식은 기존과 동일: `{ "success": true }`.

---

## 3. DB 스키마 변경 포인트

현재 Choonsim 연동용 테이블: `choonsim_projects`, `choonsim_revenue`, `choonsim_milestones`, `choonsim_metrics_history`.  
캐릭터(채권) 구분을 위해 아래만 변경하면 됩니다.

### 3.1 `choonsim_projects`

| 변경 | 내용 |
|------|------|
| **추가 컬럼** | `bond_id` integer UNIQUE NULLABLE |
| **의미** | 온체인 bondId와 1:1 대응. 한 프로젝트 = 한 캐릭터 = 한 bondId. |
| **마이그레이션** | 기존 단일 행(예: id=`choonsim-main`)에 `bond_id = 101` 설정. |
| **신규 캐릭터** | 새 행 추가 시 `id`(예: `bond-102`), `bond_id = 102` 등으로 저장. |

- **조회**: API에서 `bondId` 수신 시 `bond_id = ?` 로 프로젝트 조회. 없으면 정책에 따라 생성 또는 404.

### 3.2 `choonsim_revenue`, `choonsim_milestones`, `choonsim_metrics_history`

| 테이블 | 변경 | 비고 |
|--------|------|------|
| `choonsim_revenue` | 변경 없음 | 기존 `project_id`로 캐릭터(프로젝트) 구분. 프로젝트를 bondId별로 나누면 자동으로 캐릭터별 수익 구분됨. |
| `choonsim_milestones` | 변경 없음 | 동일하게 `project_id`로 구분. |
| `choonsim_metrics_history` | 변경 없음 | 동일하게 `project_id`로 구분. |

- 즉, **프로젝트 = 캐릭터 = bondId** 로 두고, 기존 `project_id` FK만 유지하면 됨. 별도 테이블에 `bond_id`를 중복 저장할 필요는 없음(선택 사항).

### 3.3 (선택) characterId → bondId 매핑

춘심톡에서 `characterId`(문자열)만 보내고 bondId는 BondBase가 매핑하는 경우:

- **방안 A**: `choonsim_projects`에 `character_id` text 컬럼 추가. UNIQUE. API에서 `characterId`로 조회 후 해당 행의 `bond_id` 사용.
- **방안 B**: 설정 파일/환경변수로 `CHARACTER_BOND_MAP={"char-a":101,"char-b":102}` 형태 유지. DB 변경 없음.

---

## 4. Relayer·프론트 연동 요약

- **Relayer**: `BOND_IDS`를 `[101, 102, 103, …]` 로 확장. 캐릭터별 수익 데이터를 해당 bondId로 `updateAssetStatus(bondId, …)` 호출(이미 bondId 단위이므로 로직 확장만 필요).
- **프론트**: Growth Market 등에서 채권 목록을 bond 101, 102, 103 … 로 확장. 기존 bondId 기준 투자/수익 조회는 그대로 사용 가능.
- **온체인**: 새 캐릭터 추가 시 해당 bondId에 대해 `registerBond(bondId)` 실행 및 필요 시 BondToken URI 설정.

---

## 5. 구현 순서 제안

1. **DB**: `choonsim_projects`에 `bond_id` 추가 및 기존 행에 101 설정. (백업 후 마이그레이션.)
2. **API**: `api.revenue`에 `bondId`(선택) 파싱·검증 추가. 생략 시 101. `bondId`로 프로젝트 조회/생성 후 기존대로 revenue/milestone/metrics 저장 및 `relayDepositYield(bondId, amount)` 호출.
3. **Relayer**: `BOND_IDS` 및 캐릭터별 데이터 소스 확장.
4. **프론트**: 채권 목록에 다중 bondId 반영.
5. **(선택)** `characterId` 지원 시 매핑 테이블 또는 설정 도입.

---

## X. Related Documents

- **Specs**: [Revenue Bridge Spec](./02_REVENUE_BRIDGE_SPEC.md) - 단일 캐릭터 기준 API 규격 (본 문서가 확장)
- **Specs**: [Infrastructure](./01_INFRASTRUCTURE.md) - 네트워크 및 V3 계약 주소
- **Logic**: [Backlog](../04_Logic/00_BACKLOG.md) - 다중 채권 관리 기능 항목
- **Foundation**: [Roadmap](../01_Foundation/03_ROADMAP.md) - 연동 단계
