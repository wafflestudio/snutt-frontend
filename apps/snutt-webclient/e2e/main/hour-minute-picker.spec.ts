import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

test('강의 시간 수정 선택 기능이 엄청 잘 동작한다 (컴프)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  await page.getByTestId(testIds['강의']).filter({ hasText: '컴퓨터공학부, 2학년' }).click();

  const times = [0, 1, 2].map((i) => ({
    start: page.getByTestId(testIds['강의 시간 행']).nth(i).locator('input').nth(0),
    end: page.getByTestId(testIds['강의 시간 행']).nth(i).locator('input').nth(1),
  }));

  await expect(times[1].start).toHaveValue('18:30');

  const am = page.getByTestId(testIds['오전']);
  const pm = page.getByTestId(testIds['오후']);
  const hBox = page.getByTestId(testIds['시 박스']);
  const mBox = page.getByTestId(testIds['분 박스']);
  const hClock = page.getByTestId(testIds['시 시계']);
  const mClock = page.getByTestId(testIds['분 시계']);

  await times[1].end.click();
  await expect(am).toBeDisabled();
  await expect(pm).toHaveAttribute('aria-selected', 'true');
  await expect(hBox).toHaveValue('08');
  await expect(mBox).toHaveValue('20');
  await expect(hClock.getByText('5', { exact: true })).toBeDisabled();
  await expect(hClock.getByText('12', { exact: true })).toBeDisabled();
  await expect(hClock.getByText('8', { exact: true })).toHaveAttribute('aria-selected', 'true');
  await hClock.getByText('6', { exact: true }).click();
  await expect(hBox).toHaveValue('06');
  await expect(mClock.getByText('35', { exact: true })).toHaveAttribute('aria-selected', 'true');
  await mClock.getByText('45', { exact: true }).click();
  await page.getByTestId(testIds['시간 취소']).click();
  await expect(times[1].end).toHaveValue('20:20');

  await times[1].start.click();
  await expect(am).toBeEnabled();
  await expect(pm).toHaveAttribute('aria-selected', 'true');
  await hClock.getByText('9', { exact: true }).click();
  await expect(hBox).toHaveValue('09');
  await mClock.getByText('0', { exact: true }).click();
  await expect(mClock.getByText('0', { exact: true })).toHaveAttribute('aria-selected', 'true');
  await hBox.click();
  await expect(hClock.getByText('9', { exact: true })).toHaveAttribute('aria-selected', 'true');
  await hClock.getByText('10', { exact: true }).click();
  await page.getByTestId(testIds['시간 저장']).click();
  await expect(times[1].start).toHaveValue('22:00');
  await expect(times[1].end).toHaveValue('22:05');

  await times[0].start.click();
  await expect(am).toHaveAttribute('aria-selected', 'true');
  await pm.click();
  await expect(pm).toHaveAttribute('aria-selected', 'true');
  await expect(hBox).toHaveValue('11');
  await expect(mBox).toHaveValue('00');
  await hClock.getByText('3', { exact: true }).click();
  await am.click();
  await expect(hBox).toHaveValue('03');
  await expect(mBox).toHaveValue('00');
  await mClock.getByText('25', { exact: true }).click();
  await page.getByTestId(testIds['시간 저장']).click();
  await expect(times[0].start).toHaveValue('03:25');

  await times[0].end.click();
  await hClock.getByText('3', { exact: true }).click();
  await expect(hBox).toHaveValue('03');
  await expect(mBox).toHaveValue('15');
  await am.click();
  await expect(mBox).toHaveValue('30');
  await expect(mClock.getByText('25', { exact: true })).toBeDisabled();
  await hBox.click();
  await hClock.getByText('11', { exact: true }).click();
  await page.getByTestId(testIds['시간 저장']).click();
  await expect(times[0].end).toHaveValue('11:30');
});

const testIds = {
  강의: 'main-lecture-listitem',
  '강의 시간 행': 'main-lecture-edit-form-time',

  피커: 'hour-minute-pick-dialog',

  오전: 'a.m-box',
  오후: 'p.m-box',
  '시 박스': 'hour-box',
  '분 박스': 'minute-box',
  '시 시계': 'hour-clock',
  '분 시계': 'minute-clock',

  '시간 저장': 'time-pick-dialog-submit',
  '시간 취소': 'time-pick-dialog-cancel',
};
