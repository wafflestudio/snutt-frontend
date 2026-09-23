# snutt-web 기획 스펙

> 기존 `apps/snutt-webclient` (React 18 + Vite)를 대체하는 신규 앱
> 신규 앱 경로: `apps/snutt-web`

---

## 서비스 개요

SNUTT 서울대 시간표 앱 웹 버전. 강의 검색, 시간표 편집, 친구 기능, 강의평을 제공.

### 기술 스택
| 항목 | 선택 |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Server State | TanStack Query v5 |
| Language | TypeScript |
| Monorepo | Turborepo + Yarn Workspaces |
| 기존 앱 | 병렬 운영 후 완성 시 교체 |

---

## 백엔드 API 구조

3개의 독립 백엔드 서버.

| 서버 | 용도 | 공유 패키지 |
|---|---|---|
| snutt-core (snutt-api) | 시간표, 강의 검색, 인증, 색상 | `@sf/snutt-api` (있음) |
| friends-api | 친구 기능 | 없음 (신규 구현 필요) |
| snutt-ev-api | 강의평 | 없음 (신규 구현 필요) |

---

## 인증 방식

- `x-access-token`: JWT 토큰 (모든 인증 요청 헤더)
- `x-access-apikey`: API 키 (앱 식별)
- 소셜 로그인: Google, Facebook, Kakao

---

## 페이지 목록

### 인증 불필요
| 경로 | 페이지 | 비고 |
|---|---|---|
| `/` | 로그인 (미인증 시) | 소셜 + 로컬 로그인 |
| `/register` | 회원가입 | |
| `/password-reset` | 비밀번호 재설정 | |

### 인증 필요
| 경로 | 페이지 | 비고 |
|---|---|---|
| `/` | 메인 (시간표) | 가장 복잡한 페이지 |
| `/friends` | 친구 | 신규 |
| `/mypage` | 마이페이지 | 계정 관리 |

### 위젯
| 경로 | 페이지 | 비고 |
|---|---|---|
| `/timetable-picker` | iframe 시간표 선택기 | 기존 기능 유지 |

---

## 기능 명세

### 1. 시간표 기능

#### 1-1. 시간표 탭 관리
- 여러 시간표 생성 (이름 지정 가능)
- 탭 전환으로 시간표 교체
- 탭에 학점 수 표시
- 기본 시간표 지정
- 시간표 삭제/이름 변경

**API:**
```
GET    /v1/tables                              — 시간표 목록
POST   /v1/tables                              — 시간표 생성
GET    /v1/tables/{id}                         — 시간표 상세
PUT    /v1/tables/{id}/title                   — 이름 변경
DELETE /v1/tables/{id}                         — 삭제
PUT    /v1/tables/{id}/primary                 — 기본 지정
```

#### 1-2. 학기 선택
- 년도 + 학기 (1/S/2/W) 선택
- 학기 선택 시 해당 학기 시간표 목록 표시

**API:**
```
GET /v1/users/me/coursebooks                   — 수강한 학기 목록
GET /v1/coursebooks                            — 전체 학기 목록
```

#### 1-3. 강의 추가/삭제 (검색 결과에서)
- 검색 결과 강의를 현재 시간표에 추가
- 시간 충돌 시 경고
- 색상 선택 후 추가

**API:**
```
POST   /v1/tables/{id}/lecture/{lectureId}     — 강의 추가
DELETE /v1/tables/{id}/lecture/{lectureId}     — 강의 삭제
```

#### 1-4. 직접 추가 (커스텀 강의)
- 강좌번호, 강사, 색상, 비고 입력
- 시간 및 장소 (복수 추가 가능)

**API:**
```
POST   /v1/tables/{id}/lecture                 — 직접 추가
PUT    /v1/tables/{id}/lecture/{lectureId}     — 수정
```

#### 1-5. 강의 색상 변경
- 시간표에서 강의 클릭 후 색상 변경
- 8~10가지 파스텔 컬러

**API:**
```
PUT /v1/tables/{id}/lecture/{lectureId}/color  — 색상 변경
GET /v1/colors                                 — 색상 목록
```

#### 1-6. 시간표 내보내기 (신규)
- 이미지로 저장 (PNG)
- 링크 공유
- 구현 방식: html2canvas (클라이언트 사이드) 또는 백엔드 신규 API
- **결정 필요**: 백엔드 API 신규 개발 여부

#### 1-7. 두 시간표 비교 (신규)
- 두 시간표 나란히 표시
- 한 화면에서 동시 비교

---

### 2. 강의 검색 기능

#### 2-1. 텍스트 검색
- 강의명, 교수명으로 검색
- 실시간 검색 (debounce 300ms)

#### 2-2. 필터
| 필터 | 설명 |
|---|---|
| 학과 | 학과 선택 (즐겨찾기 학과 지원) |
| 학점 | 1~4학점 |
| 교양영역 | 균형 교양 등 서브 카테고리 |
| 시간 | 시간표 그리드에서 블록 선택 (신규) |
| 논문 | 논문 강의 포함/제외 |
| 외국어 | 외국어 강의 필터 |
| 학위 | 학사/석사/박사 |
| 기타 | 없음/고유시 |

**API:**
```
GET /v1/search_query?year={year}&semester={sem}&title={q}&...
GET /v1/tags/semester/{year}/{sem}             — 필터 태그 목록 (학과 등)
```

#### 2-3. 검색 결과
- 강의명, 교수명, 학점, 시간
- 강의평 점수 표시 (snutt-ev 연동)
- + 담기 버튼

---

### 3. 관심강좌 / 관심 목록

Figma에서 패널에 두 개의 별도 탭으로 확인됨. 차이 확인 필요.

#### 3-1. 관심강좌 (Bookmark)
- 강의를 북마크
- 학기별 관리

**API:**
```
GET    /v1/bookmarks?year={year}&semester={sem}
POST   /v1/bookmarks                           — 추가
DELETE /v1/bookmarks/{lectureId}               — 삭제
```

#### 3-2. 관심 목록 (Watchlist) — 확인 필요
- Figma에 별도 탭으로 존재
- 관심강좌와의 정확한 차이 불명확 → 백엔드 API 확인 필요

---

### 4. 친구 기능 (신규)

#### 4-1. 친구 목록
- ACTIVE: 수락된 친구
- REQUESTED: 받은 친구 요청
- REQUESTING: 보낸 친구 요청

#### 4-2. 친구 추가
- 닉네임으로 검색/추가
- Kakao 링크 공유로 추가

#### 4-3. 친구 시간표 보기
- 친구의 현재 시간표 열람 (읽기 전용)
- 학기 선택 가능

#### 4-4. 친구 관리
- 커스텀 닉네임 지정
- 친구 삭제

**API (friends-api):**
```
GET    /v1/friends?state=ACTIVE|REQUESTED|REQUESTING
POST   /v1/friends                             — 닉네임으로 요청
POST   /v1/friends/{id}/accept                 — 수락
POST   /v1/friends/{id}/decline                — 거절
DELETE /v1/friends/{id}                        — 삭제
GET    /v1/friends/{id}/primary-table          — 친구 시간표
GET    /v1/friends/{id}/coursebooks            — 친구 학기 목록
PATCH  /v1/friends/{id}/display-name           — 커스텀 닉네임
GET    /v1/friends/generate-link               — Kakao 링크 토큰 생성
POST   /v1/friends/accept-link/{token}         — 토큰으로 친구 수락
```

---

### 5. 강의평 (신규)

- 검색 결과에 평점 표시 (예: 4.0/5.0)
- 강의 상세 패널에 요약 표시
- 별도 강의평 상세 페이지는 현재 미포함

**API (snutt-ev-api):**
```
GET /v1/evaluations/summary/{lectureId}        — 강의평 요약
```

---

### 6. 인증

#### 6-1. 로컬 로그인
- ID/PW 입력
- JWT 토큰 발급 후 로컬 스토리지 저장

#### 6-2. 소셜 로그인
- Google, Facebook, Kakao OAuth
- 연동/해제 기능 (마이페이지)

#### 6-3. 회원가입
- 로컬 계정 생성
- 닉네임, ID, PW

#### 6-4. 비밀번호 재설정
- 이메일 인증 방식

**API:**
```
POST /v1/auth/login/local                      — 로컬 로그인
POST /v1/auth/login/google                     — 소셜 로그인
POST /v1/auth/login/facebook
POST /v1/auth/login/kakao
POST /v1/auth/register/local                   — 회원가입
POST /v1/auth/password/reset                   — 비밀번호 재설정 요청
PUT  /v1/auth/password/reset                   — 비밀번호 변경
```

---

### 7. 마이페이지

- 프로필 정보 (닉네임, ID)
- 소셜 계정 연동/해제
- 비밀번호 변경 (로컬 계정)
- 로컬 ID 등록 (소셜 전용 계정에 로컬 추가)
- 계정 삭제

**API:**
```
GET    /v1/users/me                            — 내 정보
PUT    /v1/users/me/name                       — 닉네임 변경
POST   /v1/users/me/password                   — 비밀번호 변경
DELETE /v1/users/me                            — 계정 삭제
POST   /v1/users/me/social/google              — 소셜 연동
DELETE /v1/users/me/social/google              — 소셜 해제
```

---

### 8. 알림

- 알림 목록 (읽음/안읽음)
- 알림 클릭 시 해당 페이지 이동

**API:**
```
GET  /v1/notifications                         — 알림 목록
POST /v1/notifications/{id}/read               — 읽음 처리
```

---

## 아키텍처

### 레이어 구조

```
entities/         순수 도메인 타입 (React 없음)
usecases/         비즈니스 로직 (React 없음)
infrastructure/   API 클라이언트, 스토리지
app/              Next.js App Router (UI)
components/       UI 컴포넌트
```

### DI 패턴
- Repository 인스턴스를 `useMemo`로 생성
- `ServiceContext`를 통해 하위 컴포넌트에 주입
- 테스트 시 Repository mock으로 교체 가능

### 상태 관리
- 서버 상태: TanStack Query v5 (캐시, 동기화)
- UI 상태: React useState / useReducer
- 전역 상태: Zustand (필요한 경우만)
- 인증 토큰: localStorage

---

## 미결 사항

| 항목 | 옵션 A | 옵션 B | 상태 |
|---|---|---|---|
| 시간표 공유 구현 | html2canvas (클라이언트) | 백엔드 신규 API | 결정 필요 |
| friends/ev API | `packages/`에 공유 패키지 생성 | `apps/snutt-web` 내부 인라인 | 결정 필요 |
| 관심 목록 vs 관심강좌 | 두 탭 구분 구현 | 하나로 통합 | 백엔드 확인 필요 |
| 관심강좌 별도 페이지 | Figma에 존재, 메인과 역할 구분 필요 | — | 확인 필요 |

---

## 개발 순서

1. `apps/snutt-web` 프로젝트 초기 셋업 (Next.js 15, Tailwind v4, Turborepo 연동)
2. `CLAUDE.md` Harness 문서 작성
3. entities 타입 정의
4. infrastructure — snutt-api 연결 (기존 `@sf/snutt-api` 사용)
5. 인증 플로우 (로그인 페이지)
6. Tailwind 디자인 시스템 (토큰, 기본 컴포넌트)
7. 메인 페이지 뼈대 (헤더 + 아이콘 바 + 시간표 그리드)
8. 검색 패널 + 필터 모달
9. 강의 상세 인라인 패널
10. 직접 추가 폼
11. 시간표 내보내기/공유
12. 관심강좌 / 관심 목록
13. 친구 기능 (friends-api 연동)
14. 강의평 연동 (snutt-ev-api)
15. 마이페이지
16. timetable-picker 위젯
17. QA + Turborepo 빌드/배포 설정
