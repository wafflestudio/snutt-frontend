import test, { expect } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

test('로그인되지 않았을 경우 랜딩 화면이 보인다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await expect(page.getByTestId('landing')).toHaveCount(1);
});

test('로그인되었을 경우 랜딩 화면이 안 보인다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true });
  await expect(page.getByTestId('landing')).toHaveCount(0);
});
