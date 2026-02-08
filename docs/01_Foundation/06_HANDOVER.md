# 리뉴얼 전환 및 일단락 기준 (Handover)
> Created: 2026-01-29 10:00
> Last Updated: 2026-02-09

본 문서는 **작업이 새로 시작/리뉴얼**됨에 따라, 기존 작업을 일단락하고 새 시작의 기준이 되도록 작성된 전환(Handover) 문서입니다.

## 1. 완료된 항목 (안정성 확보)
| 항목 | 내용 |
|------|------|
| 수익 수집 API | `api/revenue` 수신 및 DB 기록 시스템 완착 |
| 오라클 봇 | `scripts/oracle-bot.js`를 통한 온체인 반영 로직 검증 완료 |
| 대시보드 UI | 춘심 전용 Growth Market 및 Impact Map UI 구현 완료 |
| AI 컨시어지 | Gemini 2.5 Flash 기반 RAG 및 페르소나 적용 완료 (OpenAI GPT-4O 폴백 지원) |

## 2. 미완·보류 항목 (차기 과제)
- **춘심톡 실연동**: 실제 춘심톡 백엔드에서의 API 호출 연동.
- **UI 용어 정제**: "Bond" 관련 잔존 용어의 "Growth Bond" 완전 전환.
- **기술 부채**: AI Tool Calling 기능의 안정화 및 재활성화. (Gemini API 스키마 호환성 이슈로 비활성화 상태)

## 3. 리뉴얼 이후 원칙
1. **문서 레이어 준수**: `manage-docs` 스킬에 따른 5단계 레이어 내 문서화 선행 후 개발.
2. **현행 기준 참조**: `docs/01_Foundation/00_PROJECT_OVERVIEW.md`를 기점으로 작업 확장.

---

## X. Related Documents
- **Foundation**: [Project Overview](./00_PROJECT_OVERVIEW.md) - 현재 기술 스택 및 비전
- **Foundation**: [Roadmap](./03_ROADMAP.md) - 리뉴얼 이후의 마일스톤
- **Logic**: [Backlog](../04_Logic/00_BACKLOG.md) - 현재 진행 중인 미완료 과제 트래킹
