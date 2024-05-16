import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

test('홈으로 버튼이 잘 동작한다', async ({ page }) => {
  await page.goto('/this-utl-does-not-exist');
  await givenUser(page);

  await page.getByTestId(testIds['홈으로 버튼']).click();
  await expect(page).toHaveURL('/');
});

const testIds = {
  '홈으로 버튼': '404-return-home',
};
