import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

test('올바른 토큰이면 관련 모달이 안 보인다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true, type: 'local' });
  await expect(page.getByTestId('wrong-token-dialog-logout')).toHaveCount(0);
});

test('토큰이 없으면 관련 모달이 안 보인다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await expect(page.getByTestId('wrong-token-dialog-logout')).toHaveCount(0);
});

test('잘못된 토큰이면 관련 모달이 보인다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true, type: 'wrong' });
  await expect(page.getByTestId('wrong-token-dialog-logout')).toHaveCount(1);
});

test('잘못된 토큰일 때 모달을 통해 로그아웃이 잘 된다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true, type: 'wrong' });
  await page.getByTestId('wrong-token-dialog-logout').click();
  await expect(page.getByTestId('wrong-token-dialog-logout')).toHaveCount(0);
  await expect(page.getByTestId('landing')).toHaveCount(1);
});
