import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

const testIds = {
  '오류 메세지': 'error-dialog-message',
  '기존 비밀번호': 'mypage-change-password-old',
};

test('비밀번호 변경 기능이 정상 동작한다 (비밀번호 확인 일치하지 않는 케이스)', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true });
  await page.getByTestId('mypage-change-password-old').type('asdf');
  await page.getByTestId('mypage-change-password-new').type('qwer');
  await page.getByTestId('mypage-change-password-confirm').type('zxcv');
  await page.getByTestId('mypage-change-password-submit').click();
  await expect(page.getByTestId(testIds['오류 메세지'])).toHaveText('비밀번호 확인이 일치하지 않습니다.');
});

test('비밀번호 변경 기능이 정상 동작한다 (비밀번호 포맷 일치하지 않는 케이스)', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true });
  await page.getByTestId('mypage-change-password-old').type('asdf');
  await page.getByTestId('mypage-change-password-new').type('qwer');
  await page.getByTestId('mypage-change-password-confirm').type('qwer');
  await page.getByTestId('mypage-change-password-submit').click();
  await expect(page.getByTestId(testIds['오류 메세지'])).toHaveText(
    '비밀번호는 영문자, 숫자가 조합된 6자리 이상 20자리 이하여야 합니다.',
  );
});

test('비밀번호 변경 기능이 정상 동작한다 (기존 비밀번호 틀린 케이스)', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true });
  await page.getByTestId(testIds['기존 비밀번호']).type('123');
  await page.getByTestId('mypage-change-password-new').type('snuttSNUTT1!');
  await page.getByTestId('mypage-change-password-confirm').type('snuttSNUTT1!');
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'PUT' &&
        req.url().includes('/v1/user/password') &&
        req.postDataJSON().old_password === '123' &&
        req.postDataJSON().new_password === 'snuttSNUTT1!',
    ),
    page.getByTestId('mypage-change-password-submit').click(),
  ]);
  await expect(page.getByTestId(testIds['오류 메세지'])).toHaveText('에러가 발생했습니다');
});

test('비밀번호 변경 기능이 정상 동작한다 (정상 케이스)', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true });
  await page.getByTestId(testIds['기존 비밀번호']).type('1234');
  await page.getByTestId('mypage-change-password-new').type('snuttSNUTT1!');
  await page.getByTestId('mypage-change-password-confirm').type('snuttSNUTT1!');
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'PUT' &&
        req.url().includes('/v1/user/password') &&
        req.postDataJSON().old_password === '1234' &&
        req.postDataJSON().new_password === 'snuttSNUTT1!',
    ),
    page.getByTestId('mypage-change-password-submit').click(),
  ]);
  await page.getByTestId(testIds['기존 비밀번호']).type('123');
  await expect(page.getByTestId('mypage-change-password-new')).toHaveValue('');
  await expect(page.getByTestId('mypage-change-password-confirm')).toHaveValue('');
});
