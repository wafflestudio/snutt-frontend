import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

const testIds = {
  '오류 메세지': 'error-dialog-message',
  '아이디 입력': 'mypage-add-id-password-id',
  '비밀번호 입력': 'mypage-add-id-password-password',
  '비밀번호 확인': 'mypage-add-id-password-password-confirm',
  제출: 'mypage-add-id-password-submit',
};

test('아이디 만들기 기능이 정상 동작한다 (비밀번호 확인 일치하지 않는 케이스)', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true, type: 'fb' });
  await page.getByTestId(testIds['아이디 입력']).type('asdf');
  await page.getByTestId(testIds['비밀번호 입력']).type('qwer');
  await page.getByTestId(testIds['비밀번호 확인']).type('zxcv');
  await page.getByTestId(testIds['제출']).click();
  await expect(page.getByTestId(testIds['오류 메세지'])).toHaveText('비밀번호 확인이 일치하지 않습니다.');
});

test('아이디 만들기 기능이 정상 동작한다 (비밀번호 포맷 일치하지 않는 케이스)', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true, type: 'fb' });
  await page.getByTestId(testIds['아이디 입력']).type('asdf');
  await page.getByTestId(testIds['비밀번호 입력']).type('qwer');
  await page.getByTestId(testIds['비밀번호 확인']).type('qwer');
  await page.getByTestId(testIds['제출']).click();
  await expect(page.getByTestId(testIds['오류 메세지'])).toHaveText(
    '비밀번호는 영문자, 숫자가 조합된 6자리 이상 20자리 이하여야 합니다.',
  );
});

test('아이디 만들기 기능이 정상 동작한다 (이미 있는 id 케이스)', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true, type: 'fb' });
  await page.getByTestId(testIds['아이디 입력']).type('woohm402');
  await page.getByTestId(testIds['비밀번호 입력']).type('snuttSNUTT1!');
  await page.getByTestId(testIds['비밀번호 확인']).type('snuttSNUTT1!');
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'POST' &&
        req.url().includes('/v1/user/password') &&
        req.postDataJSON().id === 'woohm402' &&
        req.postDataJSON().password === 'snuttSNUTT1!',
    ),
    page.getByTestId(testIds['제출']).click(),
  ]);
  await expect(page.getByTestId(testIds['오류 메세지'])).toHaveText('이미 해당 ID가 존재합니다.');
});

test('아이디 만들기 기능이 정상 동작한다 (정상 케이스)', async ({ page }) => {
  await page.goto('/mypage');
  await givenUser(page, { login: true, type: 'fb' });
  await page.getByTestId(testIds['아이디 입력']).type('woohm403');
  await page.getByTestId(testIds['비밀번호 입력']).type('snuttSNUTT1!');
  await page.getByTestId(testIds['비밀번호 확인']).type('snuttSNUTT1!');
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'POST' &&
        req.url().includes('/v1/user/password') &&
        req.postDataJSON().id === 'woohm403' &&
        req.postDataJSON().password === 'snuttSNUTT1!',
    ),
    page.waitForRequest((req) => req.method() === 'GET' && req.url().includes('/v1/user/info')),
    page.getByTestId('mypage-add-id-password-submit').click(),
  ]);
});
