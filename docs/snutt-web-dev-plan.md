# snutt-web 개발 플랜

> 기준 문서: [기획 스펙](./snutt-web-planning.md), [디자인 스펙](./snutt-web-design.md)
> 작성일: 2026-09-23

---

## 0. 전제 및 리스크

### API: v2 기준으로 개발

dev 서버 OpenAPI 명세(`https://snutt-api-dev.wafflestudio.com/v3/api-docs`)는 현재 **OpenAPI 3.1 + `/v2/...` 경로만** 노출한다.
기획 스펙의 API 목록은 v1 기준이라 실제와 다르므로 참고용으로만 본다.

`@sf/snutt-api` 현재 상태:

| 파일 | 내용 | 관리 방식 |
|---|---|---|
| `specs/v1.json`, `specs/v2.json` | 받아온 v1(v1compat) / v2 명세 원본. 재생성 시 diff 로 API 변경 확인 | `yarn generate:snutt-timetable` |
| `src/apis/snutt-timetable/v1/schemas.ts` | 명세에서 생성한 v1 타입 (**아직 사용 안 함**, 아래 명세 버그 참고) | 자동 생성 |
| `src/apis/snutt-timetable/v1/legacySchemas.ts` | v1 타입. v1 엔드포인트와 snutt-webclient 가 사용 | 수동 관리 |
| `src/apis/snutt-timetable/v1/index.ts` | v1 엔드포인트 정의 | 수동 |
| `src/apis/snutt-timetable/v2/schemas.ts` | 명세에서 생성한 v2 타입 | 자동 생성 |
| `src/apis/snutt-timetable/v2/index.ts` | v2 엔드포인트 정의 | 수동 |

- snutt-web 은 **v2 엔드포인트만** 사용한다. 필요한 엔드포인트를 `@sf/snutt-api`에 v2 스키마 기반으로 추가해 나간다.
- v1 은 snutt-webclient 교체 시점에 `legacySchemas.ts`와 함께 제거한다.
- v1 은 새 백엔드(snutt-v2)의 호환 계층(`v1compat`)으로 동작 중이다. (2026-09 dev 서버에서 확인)
- **v1 / v2 인증 헤더가 다르다.** (백엔드 소스 `PlatformKeyInterceptor`, `UserAuthInterceptor` 확인)

  | | v1 | v2 |
  |---|---|---|
  | 앱 식별 | `x-access-apikey` | `x-os-type` + `x-client-key` (플랫폼별 key) |
  | 사용자 토큰 | `x-access-token` | `Authorization: Bearer <accessToken>` |

  v2 의 `userId` 는 서버가 토큰에서 채운다. 클라이언트가 보내지 않는다.
- **백엔드 명세 버그 2가지** (백엔드에 수정 요청 필요)
  1. 그룹 명세(`/v3/api-docs/v1compat`, `/v3/api-docs/v2`)에 `components.schemas` 가 없다. `OpenApiConfig` 의 `it.components(...)` 가 components 를 securitySchemes 만으로 덮어쓰기 때문. 생성 스크립트는 전체 명세(`/v3/api-docs`)에서 스키마를 가져와 우회한다.
  2. `is` 로 시작하는 boolean 필드가 명세에 `is` 없이 기록된다. (실제 응답 `isAdmin`, `isPrimary` → 명세 `admin`, `primary`) 그래서 생성한 v1 타입은 아직 쓰지 않는다. v2 타입의 `primary`, `admin`, `emailVerified` 등도 같은 문제일 가능성이 높다.
- 명세 대부분에 `required` 가 없어서, 생성 스크립트는 "응답 스키마의 null 불가 필드는 항상 온다"로 본다. (required 가 있는 21개 스키마로 검증: 어긋난 경우 없음)

기획 스펙 대비 v2 매핑 (전체):

| 기능 | v2 엔드포인트 | 비고 |
|---|---|---|
| 시간표 목록/생성 | `GET, POST /v2/timetables` | |
| 최근 시간표 | `GET /v2/timetables/recent` | |
| 시간표 상세/수정/삭제 | `GET, PATCH, DELETE /v2/timetables/{timetableId}` | |
| 학기별 시간표 목록 | `GET /v2/timetables/{year}/{semester}` | |
| 기본 시간표 지정/해제 | `PUT, DELETE /v2/timetables/{timetableId}/primary` | |
| 시간표 복사 | `POST /v2/timetables/{timetableId}/copy` | |
| 시간표 테마 변경 | `PUT /v2/timetables/{timetableId}/theme` | |
| 강의 추가 | `POST /v2/timetables/{timetableId}/lectures` | |
| 직접 추가 | `POST /v2/timetables/{timetableId}/lectures/custom` | |
| 강의 수정/삭제 (색상 포함) | `PATCH, DELETE /v2/timetables/{timetableId}/lectures/{timetableLectureId}` | v2 는 `paletteIndex` + `customColor` (hex) |
| 강의 원래대로 (reset) | `POST .../lectures/{timetableLectureId}/reset` | |
| 강의 검색 | `POST /v2/lectures/search` | cursor 기반 페이지네이션, `evaluationSummary` 포함 |
| 검색 필터 태그 | `GET /v2/tags/{year}/{semester}` | 학과·분류·학점·정렬 기준 등 |
| 코스 태그 | `GET /v2/tags/courses` | |
| 관심강좌 | `GET /v2/bookmarks`, `POST, DELETE /v2/bookmarks/lectures/{lectureId}` | |
| 관심강좌 담기 여부 | `GET /v2/bookmarks/lectures/{lectureId}/state` | |
| 빈자리 알림 (관심 목록 후보) | `GET /v2/vacancy-notifications/lectures`, `POST, DELETE .../{lectureId}` | |
| 빈자리 알림 등록 여부 | `GET /v2/vacancy-notifications/lectures/{lectureId}/state` | |
| 로그인/회원가입 | `POST /v2/auth/login`, `/v2/auth/login/{provider}`, `/v2/auth/register` | |
| 내 정보 | `GET, PATCH, DELETE /v2/users/me` | |
| 소셜 연동/해제 | `POST, DELETE /v2/users/me/social/{provider}` | |
| 비밀번호 | `POST, PATCH /v2/users/me/password` | |
| 알림 | `GET /v2/notifications`, `GET /v2/notifications/count` | cursor 기반 |
| 학기 상태 (현재/다음) | `GET /v2/semesters/status` | 현재 수강신청 학기 판단에 사용 |
| 수강편람 (학기 목록) | `GET /v2/coursebooks`, `GET /v2/coursebooks/recent` | |
| 테마 (강의 색상 팔레트) | `GET, POST /v2/themes`, `GET, PATCH, DELETE /v2/themes/{themeId}` | |
| 테마 복사/기본 지정 | `POST /v2/themes/{themeId}/copy`, `POST, DELETE /v2/themes/{themeId}/default` | |
| 건물 정보 | `GET /v2/buildings` | 강의실 위치 지도 표시 (선택 구현) |
| 친구 목록/요청 | `GET, POST /v2/friends`, `DELETE /v2/friends/{friendId}` | `v2.ts` 미구현 (Phase 8 에서 추가) |
| 친구 수락/거절 | `POST /v2/friends/{friendId}/accept`, `.../decline` | 〃 |
| 친구 닉네임 | `PATCH /v2/friends/{friendId}/display-name` | 〃 |
| 카카오 링크 친구 추가 | `GET /v2/friends/generate-link`, `POST /v2/friends/accept-link/{requestToken}` | 〃 |
| 친구 시간표 / 학기 | `GET /v2/friends/{friendId}/primary-table`, `.../coursebooks` | 〃 |

> 친구 API 가 core(snutt-api) v2 명세에 모두 들어 있다. 기획 스펙은 별도 friends-api 서버를 가정했으므로, 별도 서버가 여전히 필요한지 백엔드에 확인한다. 필요 없다면 Phase 1-3 의 friends-api 클라이언트는 `@sf/snutt-api` v2 엔드포인트 추가로 대체된다.

**v2 에 없는 기능 (여전히 v1 전용 또는 서버 미지원)**:

| 기능 | 상태 |
|---|---|
| 시간표 이미지 내보내기 / 링크 공유 | 클라이언트 렌더링(이미지) + 서버 미지원(링크). v2 명세에 없음 |
| 공식 수강편람 강의 조회 | `GET /v2/coursebooks/official` 존재하나 웹 클라이언트 직접 사용 불필요 (검색 API가 대체) |

→ **기획 스펙의 모든 핵심 기능이 v2에 존재한다.** 강의 색상 모델만 v1(colorIndex 0–9) → v2(paletteIndex + customColor hex)로 변경됐으므로 entities 설계 시 주의.

### 기술 리스크

- **React 19 hoisting**: ✅ 0-1 에서 확인. snutt-web 만 React 19 가 nested 로 설치되고 나머지 앱은 React 18 그대로다. 대신 Yarn 1 이 peer 의존성을 설치하지 않아 vitest 가 루트의 vite 5 를 잡는 문제가 있어 `vite` 를 직접 명시했다.
- **TypeScript 7 미사용**: TS 7 은 기존 컴파일러 API 를 제공하지 않아 typescript-eslint, Next 빌드 타입 검사와 호환되지 않는다. 6.0 을 쓴다.
- **이미지 내보내기**: html2canvas 는 Tailwind v4 기본 색상 포맷인 `oklch()`를 파싱하지 못한다. `html-to-image` 또는 `modern-screenshot` 사용.
- **localStorage 토큰**: 서버에서 인증 상태를 알 수 없으므로 사실상 전부 클라이언트 렌더링이다. SSR 을 억지로 쓰지 않고 라우트 단위 `'use client'`. 배포가 정적 호스팅이면 `output: 'export'` 검토.
- **timetable-picker 는 1280px 예외**: RN WebView/iframe 안에서 동작하므로 모바일 폭 대응 필요. #235/#238 의 origin 검사 로직 이식.
- 기획 스펙의 개발 순서에 **알림(8번)이 빠져 있음** → Phase 9 에 포함.

---

## 1. 디렉토리 구조

**Feature 중심 + 얇은 API 층 + 순수 도메인** 구조를 쓴다.

이 앱의 복잡도는 (1) 시간표 도메인 계산(충돌, 학점, time mask, 그리드 배치)과 (2) 메인 화면 UI 상태에 몰려 있고, API 호출은 대부분 CRUD 전달이다.
그래서 계층은 도메인과 UI 상태에 두고, API 경로는 짧게 유지한다.

```
apps/snutt-web/src/
├── app/                          # 라우팅·레이아웃만 (얇게)
│   ├── providers.tsx             # QueryClient, 환경 의존 context
│   ├── (auth)/login | register | password-reset
│   ├── (main)/layout.tsx         # AuthGuard + Header + IconBar
│   ├── (main)/page.tsx           # 메인 시간표
│   ├── (main)/friends/ | mypage/
│   └── timetable-picker/         # 위젯 (별도 레이아웃, 모바일 대응)
├── domain/                       # 순수 TS. React / API 를 모름. 테스트 집중 구역
│   ├── time.ts  lecture.ts  timetable.ts  grid-layout.ts …
├── api/                          # 서버와의 경계
│   ├── client.ts                 # @sf/snutt-api 인스턴스, 토큰, 에러 변환
│   ├── mappers/                  # v2 응답 → domain 타입
│   └── timetable.ts  search.ts … # queryOptions 팩토리 + mutation hook
├── features/
│   ├── timetable/                # 탭, 학기 선택, 그리드 연결
│   ├── search/                   # 검색 패널, 필터 모달, 시간 필터
│   ├── lecture-detail/
│   ├── custom-lecture/
│   ├── bookmark/
│   ├── friends/  auth/  mypage/  export/  notification/
│   └── (각 feature: components/, hooks, 필요 시 store.ts)
└── shared/
    ├── ui/                       # Button, Input, Dialog, Tabs, Dropdown, ColorPalette …
    ├── timetable-grid/           # 가장 많이 재사용되는 컴포넌트, 별도 관리
    └── lib/
```

데이터 흐름: `컴포넌트 → useQuery(timetableQueries.detail(id)) → api/ → @sf/snutt-api → mappers → domain 타입`

### 검토한 다른 구조

| 구조 | 채택하지 않은 이유 |
|---|---|
| snutt-webclient 식 레이어 (entities / repositories / usecases / infrastructure + DI context) | API 하나에 파일 4~5개. service 대부분이 전달만 하고, 결과 래퍼(`RepositoryResponse`)가 TanStack Query 의 throw 기반 에러 처리와 겹친다 |
| Feature-Sliced Design | 이 규모에선 무겁고, feature / widget 분류 논쟁이 생기며 Next 의 `app/` 과 이름이 겹친다 |
| 라우트 옆에 두기 (`app/**/_components`) | 메인은 라우트 하나에 상태 5개, 그리드는 여러 라우트에서 공유해서 효과가 적다. 한 라우트 전용 화면에만 부분 적용 가능 |
| domain 을 `packages/` 로 분리 | 아직 이르다. `domain/` 이 아무것도 import 하지 않게 지켜 두면 나중에 그대로 옮길 수 있다 |

### BFF (Next 서버 경유) 여부: 보류

브라우저 → Next 서버(httpOnly 쿠키) → snutt-api 구조로 가면 토큰이 XSS 로부터 안전하고 API key 가 노출되지 않으며, 서버에서 인증 분기가 가능하다.
대신 Node 서버 운영이 필요하고(theme-market 처럼 컨테이너 배포), iframe / RN WebView 로 열리는 timetable-picker 에서는 쿠키 인증이 제한될 수 있다.

- v2 인증 방식(토큰 헤더, refresh 흐름) 확인 후 **Phase 3(인증) 전에 결정**한다. Phase 1~2 는 영향 없음.
- 어느 쪽이든 전환 비용을 줄이기 위해 **토큰 처리는 `api/client.ts` 한 곳에만** 둔다.

### 설계 포인트

**1. `TimetableGrid`는 처음부터 모드를 분리해 설계**

같은 그리드를 메인(편집), 친구(읽기 전용), 비교(2개 나란히), 시간 필터(블록 선택), 검색 hover(미리보기), picker 에서 쓴다.
`readonly` / `editable` / `selectable` / `preview` 레이어로 나눈다. 나중에 기능을 붙이면 props 가 끝없이 늘어난다.

**2. 메인 레이아웃 상태는 하나의 discriminated union**

```ts
type MainView =
  | { type: 'default' }
  | { type: 'panel'; tab: 'search' | 'watchlist' | 'bookmark' }
  | { type: 'detail'; lectureId: string; from: 'search' | 'bookmark' | 'timetable' }
  | { type: 'custom-form'; editingId?: string }
  | { type: 'compare'; left: string; right: string };
```

- URL search params 와 동기화 → 뒤로가기/새로고침 자연스럽게 동작
- hover 미리보기처럼 패널↔그리드 간 휘발성 공유 상태만 작은 Zustand store 로

**3. 상태 관리**

- 서버 상태: TanStack Query v5 (`api/` 의 `queryOptions` 팩토리로 query key / fn 을 한 곳에서 관리)
- UI 상태: `useState` / `useReducer`
- 전역: Zustand (필요할 때만)

---

## 2. 개발 단위

PR 단위로 나눴다. 기획 스펙 순서에서 바꾼 점:
- **디자인 토큰을 인증보다 먼저** (로그인 페이지부터 공용 컴포넌트 필요)
- **그리드를 뼈대 단계에서 제대로** 구현
- **알림 추가**

상태: ✅ 완료 (PR 번호) · 🚧 진행 중 · 빈칸 대기. PR 을 올릴 때 해당 단위의 상태를 함께 갱신한다.

| Phase | 단위 | 내용 | 완료 기준 | 상태 |
|---|---|---|---|---|
| **0. 셋업** | 0-1 | Next 16 + Tailwind v4 + TS 6, turbo lint/tsc/test/build 연동 | 루트 `turbo run build` 통과, 다른 앱 영향 없음 | ✅ #240 |
| | 0-2 | `CLAUDE.md` + 앱 구조 확정 (경계 규칙 ESLint 강제) | | ✅ #242 |
| | 0-3 | v2 매핑표 완성 + 필요한 v2 엔드포인트를 `@sf/snutt-api`에 추가 | 기획 스펙 기능 전부 엔드포인트 확인 | ✅ #241 |
| **1. 기반** | 1-1 | `domain/` 작성 (webclient entities 참고, v2 기준 정리) + 단위 테스트 | | ✅ #243 |
| | 1-2 | `api/client.ts`(토큰, 에러 변환), mappers, queryOptions, QueryClient provider, MSW 테스트 환경 | 테스트 페이지에서 `GET /v2/timetables` 성공 |  |
| | 1-3 | ev-api 클라이언트 (friends 는 core v2 에 있으면 `@sf/snutt-api` 에 추가) | |  |
| **2. 디자인 시스템** | 2-1 | 토큰 (primary teal, 텍스트, 강의 색상), 폰트 | |  |
| | 2-2 | 기본 UI: Button, Input, Dialog, Tabs, Dropdown, ColorPalette, Toast | |  |
| **3. 인증** | 3-1 | 로컬 로그인, 회원가입, AuthGuard, 토큰 관리 | |  |
| | 3-2 | 소셜 로그인 (Google / Facebook / Kakao) | |  |
| | 3-3 | 비밀번호 재설정 (이메일 인증) | |  |
| **4. 메인 뼈대** | 4-1 | AppShell: Header, IconBar, 패널 슬롯(push), `MainView` 상태 | 5개 상태가 빈 패널로 전환됨 |  |
| | 4-2 | **TimetableGrid** (7일, 시간 자동 범위, 모드 구조) | readonly 모드로 실데이터 렌더링 |  |
| | 4-3 | 시간표 탭 CRUD, 학점 표시, 기본 시간표 지정, 학기 선택 | |  |
| **5. 검색** | 5-1 | 검색 패널: 300ms debounce, 결과 목록(강의평 점수 포함), 담기, 시간 충돌 경고 | |  |
| | 5-2 | 결과 hover 시 그리드 미리보기 | |  |
| | 5-3 | 필터 모달: 카테고리 구조, 학과(즐겨찾기), 나머지 필터 | |  |
| | 5-4 | 시간 필터: 그리드 `selectable` 모드 + 음영 표시 | |  |
| **6. 강의 편집** | 6-1 | 강의 상세 인라인 패널 (3-panel), 색상 변경, 삭제 | |  |
| | 6-2 | 직접 추가/수정 폼 (시간·장소 여러 개) | |  |
| **7. 관심강좌** | 7-1 | 관심강좌(bookmark) 탭 | |  |
| | 7-2 | 관심 목록 탭 (빈자리 알림으로 확정되면) | |  |
| **8. 신규 서버** | 8-1 | `/friends` 목록, 3개 상태 탭, 수락/거절 | |  |
| | 8-2 | 친구 추가 (닉네임 / Kakao 링크), 닉네임 변경, 삭제 | |  |
| | 8-3 | 친구 시간표 뷰 (그리드 재사용, 학기 선택) | |  |
| | 8-4 | 강의 상세 패널의 강의평 요약 | |  |
| **9. 부가 기능** | 9-1 | 내보내기 (이미지 저장, 공유) | |  |
| | 9-2 | 두 시간표 비교 (Split View) | |  |
| | 9-3 | 마이페이지 (프로필, 소셜 연동/해제, 비밀번호, 탈퇴) | |  |
| | 9-4 | 알림 | |  |
| | 9-5 | timetable-picker 이식 (origin 검사 포함) | 기존 RN 앱에서 동작 확인 |  |
| **10. 마무리** | 10-1 | Playwright e2e (로그인 → 검색 → 담기 → 삭제), 배포 스크립트 | |  |

**의존 관계**: Phase 5~9 는 Phase 4 이후 서로 독립적이라 병렬 진행 가능. 단 Phase 4-2 그리드는 이후 전부가 의존하므로 먼저 끝낸다.

---

## 3. 미결 사항

| 항목 | 추천 / 현황 | 근거 |
|---|---|---|
| friends / ev API 위치 | friends: core v2 명세에 있으므로 `@sf/snutt-api` 에 추가 (별도 서버 필요 여부 확인). ev: `packages/`에 `implXxxApi` 패턴으로 생성 | snutt-ev-webview 가 이미 같은 서버를 씀 |
| 시간표 공유 | 이미지는 클라이언트(`html-to-image`), **링크 공유는 백엔드 필요** | 링크는 서버 저장소 없이 불가. 이미지 먼저 출시 |
| 강의평 점수 (검색 결과) | ✅ 해결: v2 검색 응답 `LectureResponse.evaluationSummary`에 포함 | 강의별 N+1 호출 불필요 |
| 기본 시간표 지정 | ✅ 해결: `PUT /v2/timetables/{id}/primary` | |
| 관심 목록 vs 관심강좌 | 관심 목록 = 빈자리 알림(`/v2/vacancy-notifications`)일 가능성 높음 → 백엔드 확인 | |
| 로그인 라우트 | `/`에서 조건부 렌더링 대신 `/login` 분리 + redirect | localStorage 토큰이라 조건부 렌더링은 깜빡임 발생 |
| v1 서버 생존 여부 | ✅ 살아 있음 (새 백엔드의 v1compat 계층) | snutt-webclient 운영 지속 기간에 영향 |
| v2 인증 방식 | 일부 해결: 헤더는 위 표 참고, `userId` 는 서버가 채움. **남은 것: web 용 `x-client-key` / `x-os-type` 값 발급, refresh 흐름** | web key 가 없어 v2 호출 불가 |
| 백엔드 명세 버그 | 백엔드에 수정 요청: 그룹 명세 스키마 누락, `is` boolean 필드 이름 | 고쳐지면 v1 을 생성 타입으로 교체, v2 타입 재검증 |
| v2 `is` boolean 필드 이름 | 1-2 에서 확인: `primary` / `isPrimary` 등 실제 응답 이름 | v2 명세도 같은 버그일 가능성 |
| 친구 기능 서버 | 확인 필요: 별도 friends-api 가 필요한지, core v2 로 충분한지 | core v2 명세에 친구 API 전체가 있음 |
| v2 ID 크기 | 1-2 에서 확인: 2^53 초과 여부 (v1 로 본 dev ID 는 5자리) | v2 ID 는 `Int64`. domain 은 문자열로 다룸. 초과하면 JSON 파싱 단계에서 정확도가 깨지므로 별도 처리 필요 |
| `paletteIndex` 시작 번호 | 1-2 에서 확인: 0부터인지 | domain 은 0부터(팔레트 배열 인덱스)로 가정. v1 `colorIndex` 는 1~9 가 팔레트, 0 이 직접 고른 색이었음 |
| 검색 시간 조건의 끝 시각 | 1-2 에서 확인: 포함인지 제외인지 | domain 은 `[start, end)`. v1 웹클라이언트는 `endMinute` 에 -1 을 해서 보냈음 |
