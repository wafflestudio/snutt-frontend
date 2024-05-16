import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

test('버튼을 클릭하면 알림 목록을 보여준다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true });
  await expect(page.getByTestId('layout-notification-listitem')).toHaveCount(0);
  await page.getByTestId('layout-notification').click();
  await expect(page.getByTestId('layout-notification-listitem')).toHaveCount(10);
  await expect(
    page.getByTestId('layout-notification-listitem').filter({ hasText: '2022년도 1학기 수강편람' }),
  ).toContainText('2022년 01월 03일');
});
