# 한두푼

카테고리별 월 예산을 **남은 일수로 나눠 "오늘 쓸 수 있는 금액"**을 보여주고, 지출을 기록할 때마다 차감·재계산해주는 로컬 기반 소비 관리 PWA.

## 스택
- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 (`@tailwindcss/vite`)
- 저장소: IndexedDB (`idb`) — **데이터는 기기 로컬에만 저장**, 서버 없음
- 차트: Recharts
- PWA: `vite-plugin-pwa` (홈화면 설치 / 오프라인 / autoUpdate)
- 패키지 매니저: **pnpm** (Vite 8 rolldown 네이티브 바이너리 이슈 회피)

## 명령어
- 개발: `pnpm dev`
- 빌드: `pnpm build`
- 미리보기: `pnpm preview`
- 린트: `pnpm lint`

## 핵심 로직 (`src/lib/budget.ts`)
```
오늘의 일 한도 = max(0, 카테고리 예산 − 오늘 이전 사용액) ÷ (오늘 포함 남은 일수)
오늘 남은 금액 = 일 한도 − 오늘 사용액
```
- 오늘 덜 쓰면 남은 예산이 남아 내일 한도가 오르고, 초과하면 내일 한도가 깎인다.
- 예산 기간은 `settings.monthStartDay`(1~28, 급여일 등) 기준. 경계 계산은 `src/lib/date.ts`의 `periodBounds`.

## 구조
- `src/db.ts` — IndexedDB CRUD (categories / expenses / settings)
- `src/store.tsx` — 전역 상태(Context) + 뮤테이션, 리마인더 스케줄
- `src/lib/` — `budget`(계산), `date`(기간/ISO), `format`(원화/날짜), `backup`(JSON 내보내기·복원), `notify`(로컬 알림), `id`(UUID·팔레트)
- `src/screens/` — `Home`(오늘 현황·기록), `Stats`(차트), `Settings`(카테고리/기간/리마인더/백업)
- `src/components/` — `CategoryCard`, `ExpenseForm`, `CategoryForm`, `Modal`, `BottomNav`

## 데이터 모델
- `Category { id, name, color, monthlyBudget, archived, createdAt }`
- `Expense { id, categoryId, amount, memo, date('YYYY-MM-DD'), createdAt }`
- `Settings { id:'app', currency, monthStartDay, reminderTime }`

## 알려진 제약
- **리마인더 알림**: 백엔드 없이 앱(탭/PWA)이 실행 중일 때만 발화. 완전 종료 시 정시 알림 보장 불가 → 필요 시 웹푸시 백엔드 추가가 로드맵.

## 빌드 단계 (체크리스트)
- [x] 단계 0: 스캐폴딩 + CLAUDE.md
- [x] 단계 1: 데이터 계층(IndexedDB) + 예산 계산 로직 + 상태
- [x] 단계 2: 화면(홈/통계/설정) + 지출·카테고리 기록 UI
- [x] 단계 3: PWA(매니페스트/SW) + JSON 백업·복원 + 리마인더
- [ ] 단계 4: (선택) 카테고리 보관, 반복 지출, 웹푸시 알림

## 컨벤션
- 커밋 메시지: 한국어, 의미 단위. 배포는 `ship` 스킬 사용.
- 브랜치(하이브리드): 작은 수정은 `main` 직접, 기능 단위·실험은 `feat/xxx` → PR.
- 데이터 모델 / 폴더 구조가 바뀌면 이 문서를 갱신한다.
