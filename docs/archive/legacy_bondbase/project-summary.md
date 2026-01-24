# Project Summary: BuildCTC (RWA Yield Protocol)

## 1. 프로젝트 개요
**BuildCTC (Build Creditcoin Tokenized Credit)**는 Creditcoin 2.0 네트워크를 기반으로 하는 실물 자산(Real World Assets, RWA) 수익률 프로토콜입니다. 신흥 시장(초기 태국 중심)의 소상공인 대출 채권을 온체인 토큰화하여, DeFi 투자자들에게 암호화폐 시장 변동성과 무관한 안정적인 실물 경제 수익을 제공합니다.

## 2. 핵심 가치 제안 (Core Value Proposition)
- **자산 토큰화 (Asset Tokenization)**: ERC-1155 표준을 활용하여 대출 채권을 분할 가능한 단위로 발행, 투자 접근성 및 유동성 확보.
- **데이터 투명성 (Transparency)**: Creditcoin 네트워크의 대출/상환 이력 데이터를 통해 실물 자산의 가치를 온체인에서 실시간 검증.
- **소셜 임팩트 (Social Impact)**: 신흥 시장 소상공인에게 금융 기회를 제공하고, 투자자에게는 시각화된 ESG 지표를 제공.
- **크로스체인 연동 (Cross-Chain)**: Creditcoin Gateway를 통해 이더리움, 폴리곤 등 다양한 체인의 투자자 참여 유도.

## 3. 기술 아키텍처 (Technical Architecture)
### 3.1 스마트 컨트랙트 (Solidity)
- **BondToken (ERC-1155)**: 채권 발행 및 소유권 관리.
- **LiquidityPool**: 투자자의 안정적인 자산(USDC) 예치 및 채권 매입 자금 관리.
- **YieldDistributor**: 상환 데이터에 기반한 자동 수익 계산 및 배분.
- **ReservePool**: 디폴트 리스크를 대비한 안전망(Reserve Fund) 관리.
- **OracleAdapter**: Creditcoin Universal Oracle을 통한 실물 데이터 연동.

### 3.2 백엔드 & 프론트엔드
- **Backend**: Node.js/Python 기반 API, PostgreSQL(Supabase), Zod/Pydantic 스키마 검증.
- **Frontend**: Next.js, Tailwind CSS, shadcn/ui 기반의 직관적인 투자 및 임팩트 대시보드.

## 4. 리스크 관리 체계
- **리저브 풀 (Reserve Pool)**: 수익의 일정 비율(5-10%)을 적립하여 손실 발생 시 우선 보전.
- **손실 분산 (Loss Distribution)**: 여러 채권으로 포트폴리오를 구성하여 특정 채권의 디폴트 영향을 최소화.
- **신용 평가**: Creditcoin의 온체인 데이터를 활용한 신용 점수 시스템 구축.

## 5. 로드맵 (Phase별 요약)
1. **Phase 1 (기초)**: 인프라 설정, 스마트 컨트랙트 기본 구조 설계 및 단위 테스트.
2. **Phase 2 (핵심)**: 유동성 풀 및 수익 배분 시스템 완성, 오라클 데이터 연동.
3. **Phase 3 (리스크/UI)**: 리저브 풀 구현, 투자자 대시보드 및 ESG 지도 시각화.
4. **Phase 4 (확장)**: Creditcoin Gateway 통합 및 기관 투자자 유치, 타 국가(동남아/아프리카) 확장.

---
*본 문서는 `docs/PLAN.md` 및 `docs/IMPLEMENTATION_PLAN.md`를 기반으로 요약되었습니다.*
