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
| `src/apis/snutt-timetable/schemas.ts` | v2 스키마 | `yarn generate:snutt-timetable` 자동 생성 |
| `src/apis/snutt-timetable/legacySchemas.ts` | v1 스키마 (snutt-webclient 용) | 수동 관리 |
| `src/apis/snutt-timetable/index.ts` | v1 엔드포인트 정의 | 수동 |

- snutt-web 은 **v2 엔드포인트만** 사용한다. 필요한 엔드포인트를 `@sf/snutt-api`에 v2 스키마 기반으로 추가해 나간다.
- v1 은 snutt-webclient 교체 시점에 `legacySchemas.ts`와 함께 제거한다.
- 확인 필요: v1 경로가 서버에서 여전히 살아있는지 (명세에서만 빠진 것인지). 토큰 없이는 404/403 구분 불가.

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
| 친구 시간표 보기 | `GET /v2/friends/{friendId}/primary-table` | Phase 8 |

**v2 에 없는 기능 (여전히 v1 전용 또는 서버 미지원)**:

| 기능 | 상태 |
|---|---|
| 시간표 이미지 내보내기 / 링크 공유 | 클라이언트 렌더링(이미지) + 서버 미지원(링크). v2 명세에 없음 |
| 공식 수강편람 강의 조회 | `GET /v2/coursebooks/official` 존재하나 웹 클라이언트 직접 사용 불필요 (검색 API가 대체) |

→ **기획 스펙의 모든 핵심 기능이 v2에 존재한다.** 강의 색상 모델만 v1(colorIndex 0–9) → v2(paletteIndex + customColor hex)로 변경됐으므로 entities 설계 시 주의.

### 기술 리스크

- **React 19 hoisting**: Next 15 는 React 19, 다른 워크스페이스는 React 18 이고 Yarn 1.22(classic) hoisting 을 쓴다. 0-1 에서 설치/빌드부터 검증한다.
- **이미지 내보내기**: html2canvas 는 Tailwind v4 기본 색상 포맷인 `oklch()`를 파싱하지 못한다. `html-to-image` 또는 `modern-screenshot` 사용.
- **localStorage 토큰**: 서버에서 인증 상태를 알 수 없으므로 사실상 전부 클라이언트 렌더링이다. SSR 을 억지로 쓰지 않고 라우트 단위 `'use client'`. 배포가 정적 호스팅이면 `output: 'export'` 검토.
- **timetable-picker 는 1280px 예외**: RN WebView/iframe 안에서 동작하므로 모바일 폭 대응 필요. #235/#238 의 origin 검사 로직 이식.
- 기획 스펙의 개발 순서에 **알림(8번)이 빠져 있음** → Phase 9 에 포함.

---

## 1. 디렉토리 구조

기획 스펙의 레이어 구조를 따르되 두 가지를 바꾼다.

- `components/` 단일 폴더 → **`features/`(기능별) + `shared/ui/`(공용)**. 메인 페이지 상태가 5가지라 평면 구조로는 감당이 안 된다.
- **`repositories/`(인터페이스)와 `infrastructure/`(구현) 분리**. 기존 snutt-webclient / friends-react-native 와 같은 패턴이라 이식이 쉽고 테스트 mock 교체가 쉽다.

```
apps/snutt-web/src/
├── app/                          # 라우팅·레이아웃만 (얇게)
│   ├── providers.tsx             # QueryClient + ServiceContext
│   ├── (auth)/login | register | password-reset
│   ├── (main)/layout.tsx         # AuthGuard + Header + IconBar
│   ├── (main)/page.tsx           # 메인 시간표
│   ├── (main)/friends/ | mypage/
│   └── timetable-picker/         # 위젯 (별도 레이아웃, 모바일 대응)
├── entities/                     # 순수 타입 + 순수 함수 (시간 충돌, 학점 합, timeMask)
├── repositories/                 # Repository 인터페이스
├── usecases/                     # 비즈니스 로직 (React 없음, vitest 대상)
├── infrastructure/               # impl*Repository: snutt-api / friends-api / ev-api / storage
├── features/
│   ├── timetable/                # 탭, 학기 선택, 그리드 연결
│   ├── search/                   # 검색 패널, 필터 모달, 시간 필터
│   ├── lecture-detail/
│   ├── custom-lecture/
│   ├── bookmark/
│   ├── friends/  auth/  mypage/  export/  notification/
│   └── (각 feature: components/, queries.ts, 필요 시 store.ts)
└── shared/
    ├── ui/                       # Button, Input, Dialog, Tabs, Dropdown, ColorPalette …
    └── timetable-grid/           # 가장 많이 재사용되는 컴포넌트, 별도 관리
```

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

- 서버 상태: TanStack Query v5 (feature 별 `queries.ts`에 query key / hook 모음)
- UI 상태: `useState` / `useReducer`
- 전역: Zustand (필요할 때만)

---

## 2. 개발 단위

PR 단위로 나눴다. 기획 스펙 순서에서 바꾼 점:
- **디자인 토큰을 인증보다 먼저** (로그인 페이지부터 공용 컴포넌트 필요)
- **그리드를 뼈대 단계에서 제대로** 구현
- **알림 추가**

| Phase | 단위 | 내용 | 완료 기준 |
|---|---|---|---|
| **0. 셋업** | 0-1 | Next 15 + Tailwind v4 + TS, turbo lint/tsc/test/build 연동 | 루트 `turbo run build` 통과, 다른 앱 영향 없음 |
| | 0-2 | `CLAUDE.md` (레이어 규칙, 네이밍, 폴더 규약) | |
| | 0-3 | v2 매핑표 완성 + 필요한 v2 엔드포인트를 `@sf/snutt-api`에 추가 | 기획 스펙 기능 전부 엔드포인트 확인 |
| **1. 기반** | 1-1 | entities 이식 (webclient 에서 가져와 v2 기준으로 정리) + 단위 테스트 | |
| | 1-2 | httpClient, storage, snutt-api repository 구현, ServiceContext, QueryClient provider | 테스트 페이지에서 `GET /v2/timetables` 성공 |
| | 1-3 | friends-api, ev-api 클라이언트 | |
| **2. 디자인 시스템** | 2-1 | 토큰 (primary teal, 텍스트, 강의 색상), 폰트 | |
| | 2-2 | 기본 UI: Button, Input, Dialog, Tabs, Dropdown, ColorPalette, Toast | |
| **3. 인증** | 3-1 | 로컬 로그인, 회원가입, AuthGuard, 토큰 관리 | |
| | 3-2 | 소셜 로그인 (Google / Facebook / Kakao) | |
| | 3-3 | 비밀번호 재설정 (이메일 인증) | |
| **4. 메인 뼈대** | 4-1 | AppShell: Header, IconBar, 패널 슬롯(push), `MainView` 상태 | 5개 상태가 빈 패널로 전환됨 |
| | 4-2 | **TimetableGrid** (7일, 시간 자동 범위, 모드 구조) | readonly 모드로 실데이터 렌더링 |
| | 4-3 | 시간표 탭 CRUD, 학점 표시, 기본 시간표 지정, 학기 선택 | |
| **5. 검색** | 5-1 | 검색 패널: 300ms debounce, 결과 목록(강의평 점수 포함), 담기, 시간 충돌 경고 | |
| | 5-2 | 결과 hover 시 그리드 미리보기 | |
| | 5-3 | 필터 모달: 카테고리 구조, 학과(즐겨찾기), 나머지 필터 | |
| | 5-4 | 시간 필터: 그리드 `selectable` 모드 + 음영 표시 | |
| **6. 강의 편집** | 6-1 | 강의 상세 인라인 패널 (3-panel), 색상 변경, 삭제 | |
| | 6-2 | 직접 추가/수정 폼 (시간·장소 여러 개) | |
| **7. 관심강좌** | 7-1 | 관심강좌(bookmark) 탭 | |
| | 7-2 | 관심 목록 탭 (빈자리 알림으로 확정되면) | |
| **8. 신규 서버** | 8-1 | `/friends` 목록, 3개 상태 탭, 수락/거절 | |
| | 8-2 | 친구 추가 (닉네임 / Kakao 링크), 닉네임 변경, 삭제 | |
| | 8-3 | 친구 시간표 뷰 (그리드 재사용, 학기 선택) | |
| | 8-4 | 강의 상세 패널의 강의평 요약 | |
| **9. 부가 기능** | 9-1 | 내보내기 (이미지 저장, 공유) | |
| | 9-2 | 두 시간표 비교 (Split View) | |
| | 9-3 | 마이페이지 (프로필, 소셜 연동/해제, 비밀번호, 탈퇴) | |
| | 9-4 | 알림 | |
| | 9-5 | timetable-picker 이식 (origin 검사 포함) | 기존 RN 앱에서 동작 확인 |
| **10. 마무리** | 10-1 | Playwright e2e (로그인 → 검색 → 담기 → 삭제), 배포 스크립트 | |

**의존 관계**: Phase 5~9 는 Phase 4 이후 서로 독립적이라 병렬 진행 가능. 단 Phase 4-2 그리드는 이후 전부가 의존하므로 먼저 끝낸다.

---

## 3. 미결 사항

| 항목 | 추천 / 현황 | 근거 |
|---|---|---|
| friends / ev API 위치 | `packages/`에 `@sf/snutt-api`와 같은 `implXxxApi` 패턴으로 생성 | friends-react-native, snutt-ev-webview 가 이미 같은 서버를 씀 |
| 시간표 공유 | 이미지는 클라이언트(`html-to-image`), **링크 공유는 백엔드 필요** | 링크는 서버 저장소 없이 불가. 이미지 먼저 출시 |
| 강의평 점수 (검색 결과) | ✅ 해결: v2 검색 응답 `LectureResponse.evaluationSummary`에 포함 | 강의별 N+1 호출 불필요 |
| 기본 시간표 지정 | ✅ 해결: `PUT /v2/timetables/{id}/primary` | |
| 관심 목록 vs 관심강좌 | 관심 목록 = 빈자리 알림(`/v2/vacancy-notifications`)일 가능성 높음 → 백엔드 확인 | |
| 로그인 라우트 | `/`에서 조건부 렌더링 대신 `/login` 분리 + redirect | localStorage 토큰이라 조건부 렌더링은 깜빡임 발생 |
| v1 서버 생존 여부 | 확인 필요 | snutt-webclient 운영 지속 기간에 영향 |
