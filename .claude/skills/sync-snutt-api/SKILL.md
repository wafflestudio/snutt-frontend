---
name: sync-snutt-api
description: snutt 백엔드 swagger(OpenAPI) 명세를 다시 받아 @sf/snutt-api 의 생성 타입과 손으로 쓴 v2 엔드포인트를 명세에 맞추고, 바뀐 점을 정리한다. "스웨거 싱크", "API 명세 동기화", "백엔드 API 바뀌었대" 같은 요청에 쓴다.
---

# snutt API 명세 동기화

`packages/snutt-api` 를 dev 서버 명세(`https://snutt-api-dev.wafflestudio.com/v3/api-docs/{v1compat,v2}`)에 맞춘다.

| 파일                                                       | 관리                                      |
| ---------------------------------------------------------- | ----------------------------------------- |
| `specs/v1.json`, `specs/v2.json`                           | 받아온 명세 원본. git diff 로 변경을 본다 |
| `src/apis/snutt-timetable/{v1,v2}/schemas.ts`              | 명세에서 생성. 직접 고치지 않는다         |
| `src/apis/snutt-timetable/v2/index.ts`                     | v2 엔드포인트. **손으로 쓴다**            |
| `src/apis/snutt-timetable/v1/index.ts`, `legacySchemas.ts` | v1(snutt-webclient 용). 손으로 쓴다       |

## 순서

명령은 모두 `packages/snutt-api` 에서 실행한다.

1. **브랜치**: 작업 중인 브랜치와 섞지 않는다. `git fetch origin && git switch -c snutt-web/api_sync_<날짜> origin/main`
2. **명세 받기 · 타입 생성**: `yarn generate:snutt-timetable`
   - 경로 수, 스키마 수가 출력된다. `git status` 로 `specs/`, `schemas.ts` 가 바뀌었는지 본다. 안 바뀌었으면 여기서 끝.
3. **바뀐 점 보기**: `yarn diff:snutt-timetable` (기본은 HEAD 대비, 인자로 ref 를 줄 수 있다)
   - 엔드포인트 추가 · 삭제(`+`/`-`), 파라미터 · body · 응답 · 인증(`security`) 변경(`~`), 스키마의 필드 추가 · 삭제 · 타입 · 필수 여부 변경을 보여 준다.
   - 출력이 길면 파일로 받아 v2 부분(`== v2`)부터 본다. snutt-web 은 v2 만 쓴다.
4. **v2 엔드포인트 맞추기**: `yarn check:snutt-timetable`
   - `v2/index.ts` 의 엔드포인트마다 경로 · 메서드 존재, 경로 파라미터 이름, query 이름, body 타입, 응답 타입, 토큰 필요 여부(`security` 의 `bearer`)를 명세와 대조한다.
   - 어긋난 곳을 고치고 "모두 명세와 맞습니다" 가 나올 때까지 반복한다.
   - 대조하지 않는 것은 직접 본다: 파라미터 **값의 타입** (enum 이 생겼는지, `integer` → `boolean` 처럼 바뀌었는지). 3 의 출력에서 `parameters` 변경을 확인한다. 경로 파라미터 enum 은 생성 타입에서 꺼내 쓴다 (예: `AuthProvidersResponse['authProviders'][number]`).
   - 명세에서 사라진 엔드포인트가 index.ts 에 있으면 지운다. 새 엔드포인트는 필요할 때 추가한다 (명세 전부를 옮기지 않는다).
5. **쓰는 곳 확인**: 루트에서 `npx turbo run tsc lint test --filter=@sf/snutt-api --filter=snutt-web --filter=snutt-webclient`
   - snutt-web 은 `src/api/mappers/` 가 v2 응답을 domain 타입으로 바꾼다. 필드 이름이 바뀌었으면 mapper 와 그 테스트를 고친다. domain 타입은 서버 이름을 따라가지 않아도 된다.
   - snutt-webclient 는 v1 `legacySchemas.ts` 를 쓴다. v1 변경은 그 앱에 영향이 있을 때만 손댄다.
6. **문서**: `docs/snutt-web-dev-plan.md` 의 "API: v2 기준으로 개발", v2 매핑표, "미결 사항" 중 이번 변경으로 달라진 것을 고친다. 이 문서에는 **prettier 를 돌리지 않는다**.
7. **보고**: 사용자에게 한국어로 정리한다.
   - snutt-web 에 영향 있는 변경 (필드 이름, 응답 형태, 인증 요구, 사라진 엔드포인트)
   - index.ts 에서 고친 것
   - 판단이 필요한 것 (명세가 이상해 보이는 곳, 백엔드에 물어볼 것)
8. **커밋 · PR**: 커밋 메시지는 `[snutt-api] 명세 동기화 (<날짜>)` 처럼 쓴다. push 와 PR 은 사용자에게 먼저 묻는다.

## 참고

- 생성 규칙 (`scripts/generate/utils/propertyToType.ts`): 스키마의 `required` 를 쓰고, `required` 가 없는 스키마는 응답이면 "null 불가 필드는 항상 온다", 요청이면 "모두 optional" 로 본다.
- v2 인증 헤더: `x-os-type: web`, `x-client-key: <web 용 key>`, 로그인이 필요한 API 는 `Authorization: Bearer <accessToken>`. 명세의 `securitySchemes` 이름은 `osType`, `clientKey`, `bearer`.
- 명세 자체를 받는 데는 인증이 필요 없다. dev 서버에는 읽기 요청만 보낸다.
