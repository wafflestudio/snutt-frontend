import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

test('로그아웃이 잘 동작한다', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true });
  await page.getByText('로그아웃하기').click();

  // TODO: 스토리지 비워진거 테스트.. 어떻게하냐
  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('landing')).toHaveCount(1);
});
