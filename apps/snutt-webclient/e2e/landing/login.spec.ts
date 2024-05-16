import { expect, test } from '@playwright/test';

test('로컬 로그인이 성공적으로 동작한다.', async ({ page }) => {
  await page.goto('/');
  const id = 'woohm402';
  const password = '1234';

  await page.getByTestId('id-input').fill(id);
  await page.getByTestId('password-input').fill(password);

  await page.getByTestId('local-signin-button').click();

  await expect(page).toHaveURL('/');
});

test('존재하지 않는 아이디로 로컬 로그인 시, 에러메시지가 노출된다.', async ({ page }) => {
  await page.goto('/');
  const id = 'woohm403';
  const password = '1234';

  await expect(page.getByTestId('error-message')).toHaveText('');

  await page.getByTestId('id-input').fill(id);
  await page.getByTestId('password-input').fill(password);

  await page.getByTestId('local-signin-button').click();

  await expect(page.getByTestId('error-message')).toHaveText('찾을 수 없는 ID입니다.');
});

test('일치하지 않는 비밀번호로 로컬 로그인 시, 에러메시지가 노출된다.', async ({ page }) => {
  await page.goto('/');
  const id = 'woohm402';
  const password = '7890';

  await expect(page.getByTestId('error-message')).toHaveText('');

  await page.getByTestId('id-input').fill(id);
  await page.getByTestId('password-input').fill(password);

  await page.getByTestId('local-signin-button').click();

  await expect(page.getByTestId('error-message')).toHaveText('잘못된 password입니다.');
});
