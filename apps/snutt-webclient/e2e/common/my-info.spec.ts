import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

test('로그인했으면 내 정보가 보여진다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true });
  const myInfoLink = page.getByTestId('layout-my-info');
  await expect(myInfoLink).toHaveText('woohm402님');
  await myInfoLink.click();
  await expect(page).toHaveURL('/mypage');
});

test('페북 유저로 로그인했으면 페북 이름 정보가 보여진다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true, type: 'fb' });
  const myInfoLink = page.getByTestId('layout-my-info');
  await expect(myInfoLink).toHaveText('김기완님');
  await myInfoLink.click();
  await expect(page).toHaveURL('/mypage');
});

test('임시 유저로 로그인했으면 로그인 정보가 보여진다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true, type: 'temp' });
  const myInfoLink = page.getByTestId('layout-my-info');
  await expect(myInfoLink).toHaveText('로그인');
  await myInfoLink.click();
  await expect(page).toHaveURL('/login');
});
