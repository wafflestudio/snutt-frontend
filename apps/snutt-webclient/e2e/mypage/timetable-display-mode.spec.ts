import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenTimetableDisplayMode } from '../utils/timetable.ts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

test('꽉 찬 시간표 -> 실제시간 시간표 변경이 잘 동작한다', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true });
  await givenTimetableDisplayMode(page, { type: 'full' });
  await expect(page.getByTestId('display-mode-toggle')).toHaveText('실제 시간으로 보기');
  await page.getByTestId('display-mode-toggle').click();
  await expect(page.getByTestId('display-mode-toggle')).toHaveText('꽉 찬 시간표로 보기');

  // TODO: 스토리지 비워진거 테스트.. 어떻게하냐
});

test('실제시간 시간표 -> 꽉 찬 시간표 변경이 잘 동작한다', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true });
  await givenTimetableDisplayMode(page, { type: 'real' });
  await expect(page.getByTestId('display-mode-toggle')).toHaveText('꽉 찬 시간표로 보기');
  await page.getByTestId('display-mode-toggle').click();
  await expect(page.getByTestId('display-mode-toggle')).toHaveText('실제 시간으로 보기');

  // TODO: 스토리지 비워진거 테스트.. 어떻게하냐
});
