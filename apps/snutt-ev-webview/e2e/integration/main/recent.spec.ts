import { test as Scenario } from '@playwright/test';

import { mainPageTest } from './_specs';

Scenario('최근 섹션의 강의 목록 버튼을 클릭하면 최근 강의 목록 페이지로 이동한다', async ({ browser }) =>
  mainPageTest({ browser }, async ({ Given, When, Then }, { PATH }) => {
    await Given['이메일 인증된 유저']();
    await When['화면을 방문한다'](PATH['메인']());
    await When['지난 학기 강의평 섹션의 강의 목록 링크를 클릭한다']();
    await Then['화면으로 이동한다'](PATH['최근 강의 목록']());
  }),
);
