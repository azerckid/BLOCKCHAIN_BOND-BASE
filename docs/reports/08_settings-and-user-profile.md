# 08_Settings & User Profile UI

## 1. 작업 개요 (Task Overview)
본 작업은 사용자의 개인 정보, 지갑 연결 상태, 애플리케이션 설정을 관리할 수 있는 'Settings' 페이지를 구현하는 단계입니다. 단순한 설정 목록을 넘어, 사용자가 자신의 계정 상태를 명확히 인지하고 제어할 수 있는 직관적인 UI를 제공합니다.

- **작업 번호**: 08
- **작업명**: Settings & User Profile UI
- **일자**: 2026-01-15
- **상태**: 진행 전 (To Do)

## 2. 주요 목표 (Key Objectives)
- [ ] **Tabbed Layout**: 프로필, 계정, 외관(Appearance) 등 설정을 카테고리화하여 탭 레이아웃으로 구현.
- [ ] **Profile Management**: 사용자 아바타, 이름, 이메일 주소를 확인하고 편집할 수 있는 폼 구현.
- [ ] **Wallet Connection Status**: 현재 연결된 지갑 주소와 네트워크 상태를 표시하고 관리하는 섹션 추가.
- [ ] **Appearance Settings**: 다크 모드/라이트 모드 전환 등 UI 테마 설정 기능 구현.
- [ ] **Notification Preferences**: 이메일 및 푸시 알림 수신 여부를 토글할 수 있는 UI 구현.

## 3. 상세 단계 (Implementation Steps)

### Step 1: 레이아웃 및 탭 구조 설계 (`app/routes/settings.tsx`)
- `Tabs` 컴포넌트(shadcn/ui)를 활용하여 `General`, `Wallet`, `Security` 등으로 섹션을 나눕니다.
- 페이지 헤더에 적절한 타이틀과 설명을 배치합니다.

### Step 2: 프로필 설정 섹션 구현 (`app/components/settings/profile-form.tsx`)
- 사용자 정보를 보여주고 수정할 수 있는 입력 폼을 만듭니다.
- 아바타 이미지 업로드(UI mock) 및 닉네임 변경 필드를 포함합니다.

### Step 3: 지갑 관리 섹션 구현 (`app/components/settings/wallet-section.tsx`)
- 연결된 지갑 주소를 보여주고, 연결 해제(Disconnect) 버튼을 배치합니다.
- 현재 네트워크(Creditcoin Testnet/Mainnet) 상태를 배지로 표시합니다.

### Step 4: 설정 페이지 통합
- 각 컴포넌트를 `settings.tsx`에 조립하고 반응형 디자인을 적용합니다.

## 4. 체크리스트 (Checklist)
- [ ] 탭 간 전환이 부드럽게 이루어지는가?
- [ ] 입력 폼의 유효성 검사(Validation) UI가 적용되었는가? (Zod 활용 예정)
- [ ] 모바일 환경에서 탭 메뉴가 적절히 표시되는가?

## 5. 결과 및 비고 (Results & Notes)
- (작업 완료 후 기록 예정)
