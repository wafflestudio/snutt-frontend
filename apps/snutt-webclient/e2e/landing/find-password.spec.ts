import test, { expect } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

const testIds = {
  '비밀번호 재설정 버튼': 'login-reset-password',
  상태바: 'progress-inner',

  설명: 'login-reset-password-info',
  인풋: 'login-reset-password-input',
  오류: 'login-reset-password-error',
  버튼: 'login-reset-password-cta',
};

/* -------------------------- */
/*           STEP 1           */
/* -------------------------- */

test('Step 1: 아이디로 이메일이 잘 찾아진다 (기본)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId(testIds['비밀번호 재설정 버튼']).click();

  // test
  await expect(page.getByTestId(testIds['설명'])).toHaveText('아래에 아이디를 입력해 주세요.');
  await expect(page.getByTestId(testIds['버튼'])).toBeDisabled();
  await page.getByTestId(testIds['인풋']).type('hey');
  await expect(page.getByTestId(testIds['버튼'])).toBeEnabled();
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'POST' &&
        req.url().includes('/v1/auth/password/reset/email/check') &&
        req.postDataJSON().user_id === 'hey',
    ),
    page.getByTestId(testIds['버튼']).click(),
  ]);
});

test('Step 1: 아이디로 이메일이 잘 찾아진다 (오류: 존재하지 않는 아이디)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId(testIds['비밀번호 재설정 버튼']).click();

  // test
  await page.getByTestId(testIds['인풋']).type('hey');
  await page.getByTestId(testIds['버튼']).click();
  await expect(page.getByTestId(testIds['오류'])).toHaveText('유저를 찾을 수 없습니다');
});

test('Step 1: 아이디로 이메일이 잘 찾아진다 (오류: 이메일 없는 유저)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId(testIds['비밀번호 재설정 버튼']).click();

  // test
  await page.getByTestId(testIds['인풋']).type('noemail');
  await page.getByTestId(testIds['버튼']).click();
  await expect(page.getByTestId(testIds['오류'])).toHaveText('등록된 이메일이 없습니다');
});

/* -------------------------- */
/*           STEP 2           */
/* -------------------------- */

test('Step 2: 아이디로 이메일이 잘 찾아진다 (기본)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId(testIds['비밀번호 재설정 버튼']).click();
  await page.getByTestId(testIds['인풋']).type('woohm402');
  await page.getByTestId(testIds['버튼']).click();

  // test
  await expect(page.getByTestId(testIds['설명'])).toHaveText('아래 이메일로 인증코드를 전송합니다.');
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'POST' &&
        req.url().includes('/v1/auth/password/reset/email/send') &&
        req.postDataJSON().user_email === 'woohm402@snu.ac.kr',
    ),
    page.getByTestId(testIds['버튼']).click(),
  ]);
});

/* -------------------------- */
/*           STEP 3           */
/* -------------------------- */

test('Step 3: 코드 입력이 잘 된다 (기본)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId(testIds['비밀번호 재설정 버튼']).click();
  await page.getByTestId(testIds['인풋']).type('woohm402');
  await page.getByTestId(testIds['버튼']).click();
  await page.getByTestId(testIds['버튼']).click();

  // test
  await expect(page.getByTestId(testIds['설명'])).toHaveText('인증코드를 입력해주세요.');
  await expect(page.getByTestId(testIds['버튼'])).toBeDisabled();
  await page.getByTestId(testIds['인풋']).type('코드');
  await expect(page.getByTestId(testIds['버튼'])).toBeEnabled();
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'POST' &&
        req.url().includes('/v1/auth/password/reset/verification/code') &&
        req.postDataJSON().code === '코드' &&
        req.postDataJSON().user_id === 'woohm402',
    ),
    page.getByTestId(testIds['버튼']).click(),
  ]);
});

test('Step 3: 코드 입력이 잘 된다 (만료)', async ({ browser }) => {
  // Given
  const context = await browser.newContext();
  await context.addCookies([cookie('TEST_AUTH_PASSWORD_RESET_STATUS', 'expired')]);

  // When
  const page = await context.newPage();
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId(testIds['비밀번호 재설정 버튼']).click();
  await page.getByTestId(testIds['인풋']).type('woohm402');
  await page.getByTestId(testIds['버튼']).click();
  await page.getByTestId(testIds['버튼']).click();

  // test
  await page.getByTestId(testIds['인풋']).type('코드');
  await page.getByTestId(testIds['버튼']).click();
  await expect(page.getByTestId(testIds['오류'])).toHaveText('만료된 인증코드입니다.');
});

test('Step 3: 코드 입력이 잘 된다 (인증한적 없음)', async ({ browser }) => {
  // Given
  const context = await browser.newContext();
  await context.addCookies([cookie('TEST_AUTH_PASSWORD_RESET_STATUS', 'no')]);

  // When
  const page = await context.newPage();
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId(testIds['비밀번호 재설정 버튼']).click();
  await page.getByTestId(testIds['인풋']).type('woohm402');
  await page.getByTestId(testIds['버튼']).click();
  await page.getByTestId(testIds['버튼']).click();

  // test
  await page.getByTestId(testIds['인풋']).type('코드');
  await page.getByTestId(testIds['버튼']).click();
  await expect(page.getByTestId(testIds['오류'])).toHaveText('비밀번호 재설정을 다시 시도해주세요.');
});

test('Step 3: 코드 입력이 잘 된다 (틀림)', async ({ browser }) => {
  // Given
  const context = await browser.newContext();
  await context.addCookies([cookie('TEST_AUTH_PASSWORD_RESET_STATUS', 'wrong')]);

  // When
  const page = await context.newPage();
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId(testIds['비밀번호 재설정 버튼']).click();
  await page.getByTestId(testIds['인풋']).type('woohm402');
  await page.getByTestId(testIds['버튼']).click();
  await page.getByTestId(testIds['버튼']).click();

  // test
  await page.getByTestId(testIds['인풋']).type('코드');
  await page.getByTestId(testIds['버튼']).click();
  await expect(page.getByTestId(testIds['오류'])).toHaveText('잘못된 인증코드입니다.');
});

/* -------------------------- */
/*           STEP 4           */
/* -------------------------- */

test('Step 4: 비밀번호 변경이 잘 된다 (기본)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId(testIds['비밀번호 재설정 버튼']).click();
  await page.getByTestId(testIds['인풋']).type('woohm402');
  await page.getByTestId(testIds['버튼']).click();
  await page.getByTestId(testIds['버튼']).click();
  await page.getByTestId(testIds['인풋']).type('코드');
  await page.getByTestId(testIds['버튼']).click();

  // test
  await expect(page.getByTestId(testIds['설명'])).toHaveText('새 비밀번호를 입력해주세요.');
  await expect(page.getByTestId(testIds['버튼'])).toBeDisabled();
  await page.getByTestId(testIds['인풋']).type('qwerqwer');
  await expect(page.getByTestId(testIds['버튼'])).toBeEnabled();
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'POST' &&
        req.url().includes('/v1/auth/password/reset') &&
        req.postDataJSON().password === 'qwerqwer' &&
        req.postDataJSON().user_id === 'woohm402',
    ),
    page.getByTestId(testIds['버튼']).click(),
  ]);
});

/* -------------------------- */
/*           STEP 5           */
/* -------------------------- */

test('Step 5: 비밀번호 변경이 잘 된다 (기본)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId(testIds['비밀번호 재설정 버튼']).click();
  await page.getByTestId(testIds['인풋']).fill('woohm402');
  await page.getByTestId(testIds['버튼']).click();
  await page.getByTestId(testIds['버튼']).click();
  await page.getByTestId(testIds['인풋']).fill('코드');
  await page.getByTestId(testIds['버튼']).click();
  await page.getByTestId(testIds['인풋']).fill('qwerqwer');
  await page.getByTestId(testIds['버튼']).click();

  // test
  await expect(page.getByTestId(testIds['설명'])).toHaveText('비밀번호가 재설정되었습니다.');
  await page.getByTestId(testIds['버튼']).click();
  // TODO: 모달 닫히는거 테스트
});

const cookie = (name: string, value: string) => ({ name, value, domain: 'localhost', path: '/' });
