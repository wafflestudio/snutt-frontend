# snutt-web

SNUTT(서울대 시간표) 웹 클라이언트. `apps/snutt-webclient`(React 18 + Vite)를 대체하는 신규 앱으로, 완성 전까지 병렬 운영한다.

- 기획: `docs/snutt-web-planning.md`
- 디자인: `docs/snutt-web-design.md`
- 개발 플랜 / 진행 단위 / v2 API 매핑: `docs/snutt-web-dev-plan.md`

## 명령어

`apps/snutt-web` 에서:

```sh
yarn dev      # 개발 서버
yarn build    # 프로덕션 빌드 (타입 검사 포함)
yarn tsc      # 타입 검사
yarn lint     # ESLint
yarn test     # vitest
yarn generate:tokens  # design-tokens/*.tokens.json → src/app/tokens.css, src/shared/lib/design-tokens.ts
yarn generate:icons   # scripts/generate-icons.mts 의 목록 → src/shared/ui/icons.tsx
```

루트에서 전체 워크스페이스: `npx turbo run tsc lint test`

작업을 마치면 `yarn tsc && yarn lint && yarn test` 를 통과시킨다.

## 스택

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TanStack Query v5 · TypeScript 6 · vitest

## 아키텍처

Feature 중심 + 얇은 API 층 + 순수 도메인. 복잡도가 있는 곳(시간표 계산, 메인 화면 UI 상태)에만 구조를 두고, API 경로는 짧게 유지한다.
snutt-webclient 의 repository / usecase / DI 레이어는 쓰지 않는다. (이유: `docs/snutt-web-dev-plan.md` "검토한 다른 구조")

```
src/
├── app/            라우팅·레이아웃만. 로직을 두지 않는다
├── domain/         순수 TS: 타입 + 계산 (시간, 강의, 충돌, 학점, 그리드 배치)
├── api/            서버와의 경계
│   ├── client.ts   @sf/snutt-api 인스턴스, 토큰, 에러 변환
│   ├── mappers/    v2 응답 → domain 타입
│   └── <리소스>.ts queryOptions 팩토리 + mutation hook
├── features/<기능>/ components/, hooks, 필요 시 store.ts
└── shared/
    ├── ui/             Button, Dialog 같은 기능 무관 공용 컴포넌트
    ├── timetable-grid/ 시간표 그리드
    └── lib/
```

데이터 흐름: `컴포넌트 → useQuery(timetableQueries.detail(id)) → api/ → @sf/snutt-api → mappers → domain 타입`

### 경계 규칙

| 폴더            | import 가능                                | import 금지                                                  |
| --------------- | ------------------------------------------ | ------------------------------------------------------------ |
| `domain/`       | `domain/` 만                               | React, Next, `api/`, `@sf/snutt-api`, `features/`, `shared/` |
| `api/`          | `domain/`, `@sf/snutt-api`, TanStack Query | `features/`, `shared/ui`                                     |
| `features/<a>/` | `domain/`, `api/`, `shared/`, 자기 자신    | 다른 feature 의 내부                                         |
| `shared/`       | `domain/`, `shared/`                       | `api/`, `features/`                                          |
| `app/`          | 전부                                       |                                                              |

- `@sf/snutt-api` 는 `api/` 에서만 import 한다. 컴포넌트에서 직접 부르지 않는다.
- API 응답 타입을 `api/` 밖으로 내보내지 않는다. `mappers/` 에서 domain 타입으로 바꾼다. 응답 형태가 바뀌어도 고칠 곳이 mappers 하나가 되도록.
- `domain/` 은 나중에 `packages/` 로 옮길 수 있게 외부 의존 없이 유지한다.
- 두 feature 가 같은 것을 필요로 하면 `shared/` 나 `domain/` 으로 올린다.

### API 층

```ts
// api/timetable.ts
export const timetableQueries = {
  all: () => ['timetables'] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...timetableQueries.all(), id],
      queryFn: async () => toTimetable(await call('GET /v2/timetables/:timetableId', { params: { timetableId: id } })),
    }),
};
```

- query key 와 queryFn 은 `queryOptions` 팩토리로 리소스별 파일 한 곳에 모은다. 컴포넌트에서 query key 를 직접 쓰지 않는다.
- 에러는 **throw** 로 통일한다. 결과 래퍼(`{ type: 'success' | 'error' }`)를 만들지 않는다. errcode → 사용자 메시지 변환은 `client.ts` 에서 한 번만 한다.
- **토큰 처리는 `api/client.ts` 한 곳에만** 둔다. 저장 위치, 헤더, 401 / refresh 처리를 다른 곳에 흩지 않는다. (BFF 전환 가능성 대비)
- DI context 는 환경마다 달라지는 것(토큰 저장소, timetable-picker 의 RN WebView 브리지 등)에만 쓴다.
- 수정 요청(PATCH)은 사용자가 바꾼 필드만 보낸다.
- **값이 없는 필드는 domain 에서도 `null` 로 둔다.** `''` / `0` 으로 바꾸지 않는다. 서버 값과 같게 유지해야 그대로 되돌려 보내도 데이터가 바뀌지 않는다.
  - 문자열이 필요한 곳(폼 input 등)에서 `?? ''` 로 바꾼다.
  - 폼 제출 시 빈 입력은 `trim() || null` 로 되돌린다. 이 변환은 폼 경계 한 곳에서만 한다.
  - 템플릿 문자열에 nullable 값을 바로 넣지 않는다. `` `강사: ${instructor}` `` 는 `'강사: null'` 이 되고 TS 가 잡지 못한다. JSX(`{instructor}`)는 `null` 이면 아무것도 그리지 않는다.

### 네이밍

| 대상          | 예                                               |
| ------------- | ------------------------------------------------ |
| domain 파일   | `timetable.ts`, `grid-layout.ts` (kebab-case)    |
| domain 함수   | `getTotalCredits`, `findConflicts` (동사로 시작) |
| query 팩토리  | `timetableQueries`, `searchQueries`              |
| mutation hook | `useAddLecture`, `useDeleteTimetable`            |
| mapper        | `toTimetable`, `toLecture`                       |
| 컴포넌트 파일 | `TimetableTabs.tsx` (PascalCase)                 |

## 상태 관리

- 서버 상태: TanStack Query (`api/` 의 queryOptions).
- UI 상태: `useState` / `useReducer`.
- 전역 상태: Zustand. 패널↔그리드 hover 미리보기처럼 멀리 떨어진 컴포넌트가 공유하는 휘발성 상태에만 쓴다.
- 메인 페이지 레이아웃은 하나의 `MainView` 로 관리하고 URL search params 와 동기화한다. 패널(탭/상세/직접 추가, 접힘은 `null`)과 비교는 동시에 열리므로 독립된 두 필드로 두고, 각 필드는 discriminated union 으로 만든다. 불리언 플래그를 여러 개 두지 않는다. (`docs/snutt-web-dev-plan.md` 설계 포인트 2)

## 테스트

- `domain/`: vitest 단위 테스트. 시간 계산, 충돌, 그리드 배치는 경계값까지 테스트한다.
- `api/` 와 화면: 인터페이스 mock 대신 MSW 로 네트워크를 mock 한다. mapper 까지 포함해서 검증된다.
- 테스트는 `tests/` 에 `src/` 와 같은 폴더 구조로 둔다. (`src/domain/time.ts` → `tests/domain/time.test.ts`)
- 테스트에서 대상은 `@/` 경로로 import 한다.
- 컴포넌트 테스트는 Testing Library 로 하고, 파일 첫 줄에 `// @vitest-environment jsdom` 을 둔다. 역할과 이름(`getByRole('button', { name: '닫기' })`)으로 찾는다.

## 컴포넌트 원칙

- **TimetableGrid** 는 메인(편집), 친구(읽기 전용), 비교, 시간 필터(블록 선택), 검색 hover(미리보기), timetable-picker 에서 모두 쓴다. 용도별 분기를 props 로 늘리지 말고 모드(`readonly` / `editable` / `selectable` / `preview` 레이어)로 조합한다.
- 강의 상세는 모달이 아니라 인라인 패널이다.
- 공용 컴포넌트는 `shared/ui/` 에 있다. 개발 서버의 `/ui` 페이지에서 모두 볼 수 있다. 새 화면을 만들 때 여기 있는 것을 먼저 쓴다.
- 컴포넌트의 색 · 크기는 `variant` / `size` prop 으로만 바꾼다. 바깥에서 받는 `className` 은 여백 · 너비 같은 배치에만 쓴다. (`tailwind-merge` 를 쓰지 않는다. 글자 색 `text-normal` 과 글자 크기 `text-body` 를 같은 종류로 보고 하나를 지운다)
- 포커스 · 키보드 · 바깥 클릭 처리가 필요한 것(탭, 모달, 드롭다운, 셀렉트)은 Base UI(`@base-ui/react`)로 만들고 모양만 토큰 클래스로 입힌다.
- 아이콘은 `shared/ui/icons.tsx` 의 컴포넌트를 쓴다. 없으면 `scripts/generate-icons.mts` 에 Material Symbols 이름을 추가하고 `yarn generate:icons` 로 만든다. 아이콘만 있는 버튼은 `IconButton` 에 `label` 을 준다.
- 데스크톱 전용(최소 1200px). 단 `timetable-picker` 는 RN WebView/iframe 에서 열리므로 모바일 폭 대응이 필요하다.

## 렌더링

- 인증 토큰이 브라우저에 있어 서버는 로그인 상태를 모른다. 인증이 필요한 화면은 클라이언트 컴포넌트로 만든다. SSR 로 데이터를 가져오려 하지 않는다.
- Next 16 기준: `next lint` 는 없다(`eslint .` 사용), `middleware` 는 `proxy` 로 이름이 바뀌었다, 라우트 `params` / `searchParams` 는 Promise 다.

## 스타일

- Tailwind v4. 색은 **디자인 토큰만** 쓴다. 임의 값(`bg-[#00b8b0]`)을 쓰지 않고, Tailwind 기본 색(`red-500` 등)은 꺼 두었다.
- 토큰은 Figma Variables(`Semantic` 컬렉션)를 내보낸 `design-tokens/*.tokens.json` 에서 `yarn generate:tokens` 로 만든다. 생성된 `src/app/tokens.css`, `src/shared/lib/design-tokens.ts` 는 직접 고치지 않는다. Figma 에서 색이 바뀌면 Variables 를 다시 내보내 JSON 을 바꾸고 생성한다.
- 토큰 클래스 (전체 매핑은 `scripts/generate-tokens.mts`, 목록은 개발 서버의 `/tokens` 페이지):

  | Figma        | 클래스 예                                           |
  | ------------ | --------------------------------------------------- |
  | Text/*       | `text-normal`, `text-plain`, `placeholder:text-med` |
  | Background/* | `bg-normal`, `bg-light`, `bg-light-field`           |
  | Line/*       | `border-line-divider`, `bg-line-light`              |
  | Icon/*       | `text-icon-normal`, `fill-icon-on-item`             |
  | SNUTT/*      | `bg-snutt-mint`, `text-snutt-dark-mint1`            |
  | special/*    | `text-warning`                                      |

- 다크 테마는 `<html data-theme="dark">` 에서 같은 토큰의 값이 바뀌는 방식이다. 컴포넌트에서 `dark:` 로 색을 따로 지정하지 않는다. 테마를 읽고 바꿀 때는 `useTheme` (`shared/lib/use-theme.ts`) 를 쓴다.
- 글꼴은 Pretendard (한글 dynamic subset, `layout.tsx` 에서 import).
- 글자 크기는 `globals.css` 의 글자 단계(`text-title1` ~ `text-caption2`)를 쓴다. 지금은 임시 값이다. (`docs/snutt-web-design-questions.md` A)
- 글자 색 토큰(`Text/*`)은 `text-*` 에만 쓸 수 있다. 테두리를 글자색과 맞추려면 `border-current` 를 쓴다.
- 클래스 순서는 `prettier-plugin-tailwindcss` 가 정렬한다.
- 이미지 내보내기에 html2canvas 를 쓰지 않는다. Tailwind v4 기본 색상 포맷인 `oklch()` 를 지원하지 않는다. `html-to-image` 계열을 쓴다.

## 백엔드

- snutt-core (`@sf/snutt-api`), snutt-ev-api. 친구 API 도 core v2 명세에 있다(별도 friends-api 필요 여부 확인 중).
- snutt-core 는 **v2 엔드포인트만** 쓴다(`snutt-timetable/v2/`). v1(`snutt-timetable/v1/`)은 snutt-webclient 용이다.
- v2 요청 헤더는 v1 과 다르다: `x-os-type` + `x-client-key`, 사용자 토큰은 `Authorization: Bearer`. (`docs/snutt-web-dev-plan.md` 참고)
- 생성된 v2 타입의 `is` boolean 필드 이름(`primary` 등)은 백엔드 명세 버그로 실제 응답과 다를 수 있다. mapper 에서 실제 응답으로 확인하기 전까지 믿지 않는다.
- 필요한 엔드포인트가 `@sf/snutt-api` 에 없으면 앱에서 fetch 하지 말고 패키지에 추가한다. 스키마는 `packages/snutt-api` 에서 `yarn generate:snutt-timetable` 로 갱신한다.

## 주의사항

- **TypeScript 7 로 올리지 않는다.** TS 7 은 기존 컴파일러 API 를 제공하지 않아 typescript-eslint 와 Next 빌드 타입 검사가 동작하지 않는다.
- **`vite` devDependency 를 지우지 않는다.** Yarn 1 은 peer 의존성을 설치하지 않아서, 없으면 vitest 가 루트에 hoist 된 snutt-webclient 용 vite 5 를 잡고 실패한다.
- `@sf/snutt-api` 는 빌드 없이 TS 소스를 export 하므로 `next.config.ts` 의 `transpilePackages` 에서 빼지 않는다.
- 이 앱만 React 19 이고 나머지 앱은 React 18 이다. 루트에 React 관련 의존성을 추가하지 않는다.
- **React 에 의존하는 새 패키지는 루트 `package.json` 의 `workspaces.nohoist` 에 추가한다.** Yarn 1 은 다른 앱에 없는 패키지를 루트로 올려 설치하는데, 그러면 루트의 React 18 을 잡는다. (`snutt-web/<패키지>`, `snutt-web/<패키지>/**` 두 줄을 넣고 `yarn install --check-files`) 설치 후 그 패키지가 snutt-web 의 React 19 를 잡는지 확인한다.

## 커밋 / PR

- 커밋 메시지는 한국어, `[snutt-web]` 접두사. 패키지 수정은 `[snutt-api]`.
- PR 은 `docs/snutt-web-dev-plan.md` 의 개발 단위 하나를 기준으로 나눈다.
- PR 을 올릴 때 개발 플랜의 "개발 단위" 표에서 해당 단위의 상태를 `✅ #PR번호` 로 갱신해 같은 PR 에 포함한다. 작업 중 알게 된 사실(API 차이, 결정 사항, 미결 사항 해소)도 플랜 문서에 반영한다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
