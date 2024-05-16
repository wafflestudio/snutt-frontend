import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

test('회원가입이 잘 실패된다 (비밀번호 확인 일치하지 않는 케이스)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId('login-signup-link').click();
  await page.getByTestId('signup-id').type('asdf');
  await page.getByTestId('signup-pw').type('qwer');
  await page.getByTestId('signup-pwc').type('zxcv');
  await page.getByTestId('signup-submit').click();
  await expect(page.getByTestId('error-dialog-message')).toHaveText('비밀번호 확인이 일치하지 않습니다.');
});

test('회원가입이 잘 실패한다 (비밀번호 포맷 잘못된 케이스)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId('login-signup-link').click();
  await page.getByTestId('signup-id').type('asdf');
  await page.getByTestId('signup-pw').type('qwer');
  await page.getByTestId('signup-pwc').type('qwer');
  await page.getByTestId('signup-submit').click();
  await expect(page.getByTestId('error-dialog-message')).toHaveText(
    '비밀번호는 영문자, 숫자가 조합된 6자리 이상 20자리 이하여야 합니다.',
  );
});

test('회원가입이 잘 실패한다 (동일 id 존재)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId('login-signup-link').click();
  await page.getByTestId('signup-id').type('woohm402');
  await page.getByTestId('signup-pw').type('snuttSNUTT1!');
  await page.getByTestId('signup-pwc').type('snuttSNUTT1!');
  await page.getByTestId('signup-submit').click();
  await expect(page.getByTestId('error-dialog-message')).toHaveText('이미 해당 ID가 존재합니다.');
});

test('비밀번호 변경 기능이 정상 동작한다 (정상 케이스)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });
  await page.getByTestId('login-signup-link').click();
  await page.getByTestId('signup-id').type('woohm403');
  await page.getByTestId('signup-pw').type('snuttSNUTT1!');
  await page.getByTestId('signup-pwc').type('snuttSNUTT1!');
  await page.getByTestId('signup-submit').click();
  await expect(page).toHaveURL('/');
  await expect(page.getByTestId('layout-my-info')).toHaveText('woohm402님'); // 기술적인 이유로 woohm402님이 뜨게 되어 있음.. 모킹이 복잡해서 msw에서 t1 토큰을 반환
});
