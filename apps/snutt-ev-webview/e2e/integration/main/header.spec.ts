import { test as Scenario } from '@playwright/test';

import { mainPageTest } from './_specs';

Scenario('헤더바의 검색 버튼을 클릭하면 검색 페이지로 이동한다', async ({ browser }) =>
  mainPageTest({ browser }, async ({ Given, When, Then }, { PATH }) => {
    await Given['이메일 인증된 유저']();
    await When['화면을 방문한다'](PATH['메인']());
    await When['헤더바의 검색 버튼을 클릭한다']();
    await Then['화면으로 이동한다'](PATH['검색']());
  }),
);
