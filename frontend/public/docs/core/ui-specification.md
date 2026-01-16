# UI & Design Specification

## 1. 기반 시스템 (Foundation)
BuildCTC의 UI는 **shadcn/ui**의 최신 프리셋 시스템을 기반으로 구축됩니다. 이를 통해 프로젝트 전반에 걸쳐 일관된 디자인 언어와 고품질의 컴포넌트를 유지합니다.

### 1.1 초기화 명령어 (Initialization Command)
프로젝트 UI 환경 구축 시 다음 명령어를 사용하여 지정된 프리셋을 적용합니다:
```bash
npx shadcn@latest create --preset "https://ui.shadcn.com/init?base=base&style=nova&baseColor=neutral&theme=neutral&iconLibrary=hugeicons&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=vite" --template vite
```

## 2. 디자인 토큰 및 설정 (Design Tokens)
위 프리셋에 포함된 핵심 디자인 설정은 다음과 같습니다:

- **Style**: `Nova` (현대적이고 정교한 비주얼 스타일)
- **Colors**:
  - Base Color: `Neutral`
  - Theme Color: `Neutral` (신뢰감을 주는 무채색 톤 기반)
- **Typography**: `Inter` (가독성이 뛰어난 산세리프 폰트)
- **Icon Library**: `Hugeicons` (세련된 선형 아이콘 시스템)
- **Menu Style**: `Subtle` 액센트 및 `Default` 컬러 적용
- **Border Radius**: `Default`

## 3. UI 구현 원칙
- **일관성**: 모든 컴포넌트는 커스텀 인라인 스타일 대신 지정된 디자인 토큰과 Tailwind 유틸리티 클래스를 사용합니다.
- **반응형**: 모바일 우선(Mobile-first) 접근 방식을 따르며, 모든 화면은 다양한 해상도에 대응해야 합니다.
- **접근성(A11y)**: shadcn/ui와 Radix UI가 제공하는 접근성 표준을 준수합니다.

## 4. 참조 리소스
- **디자인 샘플(Stitch)**: [Stitch Project URL](https://stitch.withgoogle.com/projects/17193233867447468760)
- **아이콘 참조**: Hugeicons 라이브러리 공식 문서 참조.

---
*본 문서는 프로젝트의 시각적 일관성을 위해 작성되었으며, UI 관련 모든 개발 작업의 기준이 됩니다.*
