# BondBase 팀 전달: 춘심톡 Revenue Bridge 연동 완료 안내
> Created: 2026-02-26
> 대상: BondBase 개발팀

본 문서는 춘심톡(AI-CHOONSIM-TALK) 측 BondBase Revenue Bridge 구현이 완료됨에 따라, BondBase 팀에서 처리해야 할 사항을 정리한 인수인계 문서입니다.

---

## 1. 연동 방식 요약

춘심톡에서 발생하는 **CHOCO 소비를 캐릭터별로 집계**하여, 매시간 BondBase `POST /api/revenue`로 전송합니다.

- **소비 이벤트 출처**: 채팅 크레딧 소비 + 선물 증정
- **캐릭터 → bondId 매핑**: 현재 춘심(chunsim) = bondId 101
- **전송 주기**: Vercel Cron, 1시간마다 (매시 정각)
- **전송 단위**: CHOCO 합산액을 USDC로 환산 (1 CHOCO = $0.001 고정)

---

## 2. BondBase 팀에서 처리할 사항

### 2-1. API Key 환경변수 설정 (필수)

`CHOONSIM_API_KEY`는 **춘심톡이 발급하는 키**입니다. 춘심톡이 BondBase로 요청을 보낼 때 `Authorization: Bearer {키}` 헤더에 담아 전송하며, BondBase는 이 키를 저장해두고 요청의 진위를 검증합니다.

**춘심톡에서 발급한 Production 키 (아래 값을 BondBase `.env.production`에 설정):**
```
CHOONSIM_API_KEY=46d1006afdbf7549c8c13a0528791852893dc5b25e18b3cbb4e6770db1bf6b04
```

> 보안 주의: 이 키는 Git에 절대 커밋하지 말 것. Vercel 대시보드 Environment Variables에 직접 등록할 것.

**참고 — 춘심톡 측에는 이미 설정 완료:**
```
BONDBASE_API_URL=https://blockchain-bond-base.vercel.app/api/revenue
CHOONSIM_API_KEY=46d1006afdbf7549c8c13a0528791852893dc5b25e18b3cbb4e6770db1bf6b04
```

### 2-2. `source` 필드 허용 값 합의 (필수)

현재 춘심톡은 `source: "SUBSCRIPTION"` 하드코딩으로 전송 중입니다.  
CHOCO 소비 집계는 구독료가 아니므로 정확한 분류를 위해 신규 값 추가를 요청드립니다.

**요청 사항**: `02_REVENUE_BRIDGE_SPEC.md` source 허용 목록에 다음 추가

| 값 | 의미 |
|---|---|
| `"CHOCO_CONSUMPTION"` | 춘심톡 내 CHOCO 소비(채팅 + 선물) 집계 |

> 만약 기존 `"SUBSCRIPTION"` 그대로 유지하는 것이 BondBase 처리 로직에 영향 없다면 현행 유지도 가능합니다. 의사 결정 후 알려주시면 춘심톡 `client.server.ts`에 반영하겠습니다.

### 2-3. 신규 캐릭터 bondId 배정 (필요 시)

현재 춘심톡에는 다음 캐릭터가 존재하며, 춘심만 bondId가 설정되어 있습니다:

| characterId | 이름 | bondBaseId (현재) |
|---|---|---|
| chunsim | 춘심 | **101** |
| mina | Mina | null (미연동) |
| yuna | Yuna | null (미연동) |
| sora | Sora | null (미연동) |
| rina | Rina | **102** (BondBase 배정 완료) |
| hana | Hana | null (미연동) |

- `bondBaseId = null`인 캐릭터의 CHOCO 소비는 BondBase로 전송되지 않습니다.
- 추가 캐릭터 연동 시 BondBase에서 해당 캐릭터의 bondId를 배정한 후 춘심톡 팀에 알려주시면, DB에 값을 입력하겠습니다.

#### Rina(bondId 102) 연동 절차
- **BondBase**: Rina bond 102 생성·등록 완료. API·Relayer에서 102 수신 및 온체인 배당 처리 가능.
- **춘심톡**: Character 테이블에서 `rina.bondBaseId = 102` 설정 후, Cron이 리나의 채팅·선물 소비를 자동으로 BondBase로 전송.

---

## 3. 예상 전송 페이로드 예시

```json
{
  "bondId": 101,
  "type": "REVENUE",
  "data": {
    "amount": "0.125000",
    "source": "SUBSCRIPTION",
    "description": "chunsim CHOCO consumption (2026-02-26)"
  }
}
```

```json
{
  "bondId": 101,
  "type": "METRICS",
  "data": {
    "followers": 4200,
    "subscribers": 380
  }
}
```

---

## 4. 스펙 참조 문서

- [Revenue Bridge Spec](./02_REVENUE_BRIDGE_SPEC.md) - API 호출 규격
- [Multi-Character Bond Spec](./07_MULTI_CHARACTER_BOND_SPEC.md) - bondId 다중 캐릭터 확장 규격

---

## 5. 연동 테스트 절차

춘심톡 측 키 설정 완료 + BondBase 측 키 등록 완료 후:

1. 로컬에서 채팅 1회 → DB `ChocoConsumptionLog` 행 생성 확인
2. Cron 수동 트리거 (춘심톡 로컬에서 실행):
   ```bash
   curl -X GET http://localhost:5173/api/cron/bondbase-sync \
     -H "Authorization: Bearer {CRON_SECRET}"
   ```
3. BondBase 대시보드에서 bondId=101 REVENUE 레코드 생성 확인
4. BondBase 로그에서 `Authorization: Bearer` 인증 성공 확인

---

## X. Related Documents
- **Specs**: [Revenue Bridge Spec](./02_REVENUE_BRIDGE_SPEC.md)
- **Specs**: [Multi-Character Bond Spec](./07_MULTI_CHARACTER_BOND_SPEC.md)
