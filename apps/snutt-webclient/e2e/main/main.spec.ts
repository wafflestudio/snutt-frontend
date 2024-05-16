import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.js';

test('로고가 잘 보여진다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  await expect(page.getByTestId('logo')).toHaveCount(1);
});

test('학기 목록 드롭다운이 정상 동작한다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const select = page.getByTestId('course-book-select');
  await expect(page).toHaveURL('/');
  await expect(select).toHaveValue('1001-1');
  await select.selectOption({ label: '2001년 여름학기' });
  await expect(page).toHaveURL('/?year=2001&semester=2');
  await expect(page.getByTestId('main-searchbar-input')).toHaveAttribute(
    'placeholder',
    '원하는 강의를 검색하세요. (수강편람 최근 업데이트: 2022. 12. 28)',
  );
});
