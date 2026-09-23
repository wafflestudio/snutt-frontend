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
```

루트에서 전체 워크스페이스: `npx turbo run tsc lint test`

작업을 마치면 `yarn tsc && yarn lint && yarn test` 를 통과시킨다.

## 스택

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TanStack Query v5 · TypeScript 6 · vitest

## 아키텍처

### 레이어와 의존 방향

```
app/ , features/ , shared/   (React)
        │  ServiceContext 로 주입받은 service 사용
        ▼
usecases/        비즈니스 로직. React 금지
        │  repository 인터페이스에만 의존
        ▼
repositories/    Repository 인터페이스 (타입만)
        ▲
        │  구현
infrastructure/  API / storage 구현체. @sf/snutt-api 는 여기서만 import

entities/        순수 타입 + 순수 함수. 모든 레이어가 import 가능, 자신은 아무것도 import 하지 않음
```

- `usecases/` 와 `entities/` 에서 React, Next, `@sf/snutt-api` 를 import 하지 않는다.
- 컴포넌트에서 `infrastructure/` 나 `@sf/snutt-api` 를 직접 import 하지 않는다. service 를 거친다.
- API 응답 타입을 그대로 UI 까지 흘리지 않는다. `infrastructure/` 에서 `entities/` 타입으로 변환한다.

### 네이밍 (snutt-webclient 관례를 따름)

| 레이어 | 파일 | export |
|---|---|---|
| repositories | `timetableRepository.ts` | `type TimetableRepository` |
| usecases | `timetableService.ts` | `type TimetableService`, `getTimetableService({ timetableRepository })` |
| infrastructure | `implTimetableSnuttApiRepository.ts` | `implTimetableSnuttApiRepository({ snuttApi }): TimetableRepository` |

- repository 반환: `RepositoryResponse<T>` (`{ type: 'success', data } | { type: 'error', errcode }`)
- service 반환: `UsecaseResponse<T>` (`{ type: 'success', data } | { type: 'error', message }`)
- 인스턴스 조립은 `app/providers.tsx` 한 곳에서 하고 `ServiceContext` 로 내려준다. 테스트에서는 repository 를 mock 으로 바꿔 끼운다.

### 폴더

```
src/
├── app/            라우팅·레이아웃만. 로직을 두지 않는다
├── entities/
├── repositories/
├── usecases/
├── infrastructure/
├── features/<기능>/ components/, queries.ts (TanStack Query hook), 필요 시 store.ts
└── shared/
    ├── ui/             Button, Dialog 같은 기능 무관 공용 컴포넌트
    └── timetable-grid/ 시간표 그리드
```

- 한 feature 에서만 쓰는 컴포넌트는 그 feature 안에 둔다. 두 곳 이상에서 쓰일 때 `shared/` 로 옮긴다.
- feature 끼리 서로의 내부(`features/a/components/...`)를 import 하지 않는다.

## 상태 관리

- 서버 상태: TanStack Query. query key 와 hook 은 feature 의 `queries.ts` 에 모은다.
- UI 상태: `useState` / `useReducer`.
- 전역 상태: Zustand. 패널↔그리드 hover 미리보기처럼 멀리 떨어진 컴포넌트가 공유하는 휘발성 상태에만 쓴다.
- 메인 페이지 레이아웃(패널/상세/직접 추가/비교)은 하나의 discriminated union(`MainView`)으로 관리하고 URL search params 와 동기화한다. 불리언 플래그를 여러 개 두지 않는다.

## 컴포넌트 원칙

- **TimetableGrid** 는 메인(편집), 친구(읽기 전용), 비교, 시간 필터(블록 선택), 검색 hover(미리보기), timetable-picker 에서 모두 쓴다. 용도별 분기를 props 로 늘리지 말고 모드(`readonly` / `editable` / `selectable` / `preview` 레이어)로 조합한다.
- 강의 상세는 모달이 아니라 인라인 패널이다.
- 데스크톱 전용(최소 1280px). 단 `timetable-picker` 는 RN WebView/iframe 에서 열리므로 모바일 폭 대응이 필요하다.

## 렌더링

- 인증 토큰이 localStorage 에 있어 서버는 로그인 상태를 모른다. 인증이 필요한 화면은 클라이언트 컴포넌트로 만든다. SSR 로 데이터를 가져오려 하지 않는다.
- Next 16 기준: `next lint` 는 없다(`eslint .` 사용), `middleware` 는 `proxy` 로 이름이 바뀌었다, 라우트 `params` / `searchParams` 는 Promise 다.

## 스타일

- Tailwind v4. 디자인 토큰은 `src/app/globals.css` 의 `@theme` 에 정의하고 임의 값(`bg-[#00b8b0]`)을 쓰지 않는다.
- 클래스 순서는 `prettier-plugin-tailwindcss` 가 정렬한다.
- 이미지 내보내기에 html2canvas 를 쓰지 않는다. Tailwind v4 기본 색상 포맷인 `oklch()` 를 지원하지 않는다. `html-to-image` 계열을 쓴다.

## API

- 백엔드 3개: snutt-core (`@sf/snutt-api`), friends-api, snutt-ev-api.
- snutt-core 는 **v2 엔드포인트만** 쓴다. v1(`legacySchemas.ts`, `snutt-timetable/index.ts`)은 snutt-webclient 용이다.
- 필요한 엔드포인트가 `@sf/snutt-api` 에 없으면 앱에서 fetch 하지 말고 패키지에 추가한다. 스키마는 `packages/snutt-api` 에서 `yarn generate:snutt-timetable` 로 갱신한다.

## 주의사항

- **TypeScript 7 로 올리지 않는다.** TS 7 은 기존 컴파일러 API 를 제공하지 않아 typescript-eslint 와 Next 빌드 타입 검사가 동작하지 않는다.
- **`vite` devDependency 를 지우지 않는다.** Yarn 1 은 peer 의존성을 설치하지 않아서, 없으면 vitest 가 루트에 hoist 된 snutt-webclient 용 vite 5 를 잡고 실패한다.
- `@sf/snutt-api` 는 빌드 없이 TS 소스를 export 하므로 `next.config.ts` 의 `transpilePackages` 에서 빼지 않는다.
- 이 앱만 React 19 이고 나머지 앱은 React 18 이다. 루트에 React 관련 의존성을 추가하지 않는다.

## 커밋 / PR

- 커밋 메시지는 한국어, `[snutt-web]` 접두사. 패키지 수정은 `[snutt-api]`.
- PR 은 `docs/snutt-web-dev-plan.md` 의 개발 단위 하나를 기준으로 나눈다.
