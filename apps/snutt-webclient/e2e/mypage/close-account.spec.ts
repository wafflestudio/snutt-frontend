import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

const testIds = {
  '탈퇴하기 버튼': 'mypage-close-account',
  '탈퇴 입력창': 'mypage-close-account-input',
  '탈퇴 취소 버튼': 'mypage-close-account-cancel',
  '탈퇴 확인 버튼': 'mypage-close-account-submit',
};

test('탈퇴 기능이 정상 동작한다 (취소)', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true });
  await page.getByTestId(testIds['탈퇴하기 버튼']).click();
  await expect(page.getByTestId(testIds['탈퇴 확인 버튼'])).toBeDisabled();
  await page.getByTestId(testIds['탈퇴 입력창']).type('탈탈');
  await expect(page.getByTestId(testIds['탈퇴 확인 버튼'])).toBeDisabled();
  await page.getByTestId(testIds['탈퇴 취소 버튼']).click();
  await page.getByTestId(testIds['탈퇴하기 버튼']).click();
  await expect(page.getByTestId(testIds['탈퇴 입력창'])).toHaveValue('');
});

test('탈퇴 기능이 정상 동작한다 (성공)', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true });
  await page.getByTestId(testIds['탈퇴하기 버튼']).click();
  await expect(page.getByTestId(testIds['탈퇴 확인 버튼'])).toBeDisabled();
  await page.getByTestId(testIds['탈퇴 입력창']).type('탈퇴');
  await Promise.all([
    page.waitForRequest((req) => req.method() === 'DELETE' && req.url().includes('/v1/user/account')),
    page.getByTestId(testIds['탈퇴 확인 버튼']).click(),
  ]);
  await expect(page).toHaveURL('/');
});
