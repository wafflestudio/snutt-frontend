import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

test('local_id 가 없으면 facebook 관련 버튼이 노출되지 않는다.', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true, type: 'fb' });
  await expect(page.getByTestId('facebook-row')).toHaveCount(0);
});

test('facebook 연동을 해지하면 페이스북 연동하기 버튼이 노출된다.', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true, type: 'local_fb' });
  const detachButton = page.getByTestId('facebook-detach-button');
  await Promise.all([
    page.waitForRequest((req) => req.method() === 'DELETE' && req.url().includes('/v1/user/facebook')),
    detachButton.click(),
  ]);
  await expect(page.getByTestId('facebook-attach-button')).toHaveCount(1);
});
