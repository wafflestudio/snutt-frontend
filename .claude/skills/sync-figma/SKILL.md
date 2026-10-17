---
name: sync-figma
description: Figma `SNUTT_web(171016~)` 의 완료 영역(`home` 섹션, `Web 컴포넌트` 섹션)에서 마지막 반영 이후 바뀐 디자인을 찾아 snutt-web 코드와 문서(개발 플랜, 디자인 문의)에 반영한다. "피그마 업데이트 반영", "완료 탭 바뀐 거 반영", "디자인 바뀌었대" 같은 요청에 쓴다.
---

# Figma 완료 영역 반영

Figma 는 Chrome 확장(claude-in-chrome)으로 Dev Mode 로 본다. 레이어 복사 · Code 탭 · 내보내기는 막혀 있어 화면과 Inspect 패널의 값을 읽는다.

## 1. 작업 공간

진행 중인 브랜치와 섞이지 않게 별도 워크트리에서 한다.

```sh
git fetch origin
git worktree add ../snutt-frontend-figma -b snutt-web/figma-sync origin/main
cp apps/snutt-web/.env.local ../snutt-frontend-figma/apps/snutt-web/.env.local
cd ../snutt-frontend-figma && yarn install --frozen-lockfile   # 몇 분 걸린다. 백그라운드로 돌려 둔다
```

## 2. 마지막 반영 날짜

`docs/snutt-web-dev-plan.md` 맨 위 "디자인 반영 / 컴포넌트 반영" 줄과 `docs/snutt-web-design-questions.md` 맨 위 "기준" 줄에 날짜가 있다. 그 날짜 이후의 변경을 찾는다.

## 3. 바뀐 것 찾기

1. 섹션을 연다: `home` 은 `?node-id=3177-70222&m=dev`, `Web 컴포넌트` 는 `?node-id=3214-8621&m=dev`. 렌더링이 느려 10초 이상 기다린다.
2. 오른쪽 Inspect 의 **Compare with previous versions** → 왼쪽 History 에서 마지막 반영 날짜 **직전** 버전을 고른다. 아래 Layers 에 `Added` / `Edited` / `Removed` 가 나온다.
   - `Web 컴포넌트` 는 컴포넌트 · 변형 단위로 나와 쓸 만하다. 항목을 누르면 오른쪽에 속성 변경(크기, 여백 등)이 보인다.
   - `home` 은 디자이너가 프레임을 새로 만들어 바꾸는 일이 많아 대부분 `Added` 로만 나온다. 이때는 프레임을 하나씩 열어 지금 앱과 직접 비교한다.
3. 프레임 보기:
   - 섹션 화면에서 프레임 이름을 누르고 `Shift+2` 로 확대, `Cmd+\` 로 UI 를 숨기고 스크린샷. 다음 프레임은 URL 로 섹션을 다시 열어 이름을 누른다.
   - `Tab` / `Shift+Tab` 은 형제 레이어로 넘어가지만 레이어 순서가 캔버스 배치와 달라 빠뜨리기 쉽다.
   - 값 읽기: `Cmd+클릭` 으로 가장 안쪽 레이어, `Shift+Enter` 로 부모. Inspect 에 크기 · 여백 · 색 토큰 이름(`Background/deem` 등)이 나온다. 색이 토큰이 아니면 hex 가 나온다.
4. 지금 앱과 비교한다: 개발 서버(`localhost:3000`)에서 같은 상태를 띄워 나란히 본다. 로그인 토큰은 origin 별로 저장되므로 워크트리 코드를 볼 때도 3000 번 포트를 쓴다 (기존 서버를 잠시 멈추고 워크트리에서 `yarn dev`, 끝나면 되돌린다).

## 4. 나누기

| 바뀐 것                                     | 할 일                                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| 이미 만든 화면(플랜에 ✅ 인 단위)           | 워크트리에서 코드를 고친다                                             |
| 아직 만들지 않은 단위                       | 플랜의 그 단위 설명만 고친다 (예: 막혀 있던 단위가 완료 영역에 들어옴) |
| 디자인 문의에 물어 둔 것이 Figma 로 답이 됨 | 문의 항목에 `✅ 해소 (날짜)` 와 결과를 적고 코드를 맞춘다              |
| 정해지지 않은 것 · 프레임끼리 다른 것       | 디자인 문의에 새 `4-x` 절로 적는다                                     |

## 5. 문서

- `docs/snutt-web-dev-plan.md`: 맨 위 반영 날짜, "디자인 변경" 표, "Figma 컴포넌트" 표(새 컴포넌트는 날짜와 함께 추가), 개발 단위 표의 설명. **prettier 를 돌리지 않고 해당 줄만 고친다.**
- `docs/snutt-web-design-questions.md`: 맨 위 기준 날짜, 해소된 항목, 새 질문, "5. 개발에서 임시로 정한 것" 표. prettier 를 돌려도 된다.
- 같은 제목의 항목(예: `**시간이 겹칠 때**`)이 여러 절에 있으니 고칠 때 절을 확인한다.

## 6. 확인 · PR

1. `apps/snutt-web` 에서 `yarn tsc && yarn lint && yarn test`. 바꾼 동작은 테스트를 고치거나 더한다.
2. 브라우저에서 바뀐 화면을 Figma 와 다시 비교한다.
3. 커밋 `[snutt-web] Figma <날짜> 수정분 반영`, PR 을 올리고 CI 가 통과하면 스쿼시 머지한다.
4. 워크트리 정리: 기존 개발 서버를 되돌리고 `git worktree remove ../snutt-frontend-figma`.
5. 사용자에게 한국어로 보고한다: 코드로 바꾼 것, 문서만 고친 것(새로 시작할 수 있게 된 단위 등), 디자이너에게 물을 것.
