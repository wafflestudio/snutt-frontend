import test, { expect } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

const testIds = {
  '아이디 찾기 버튼': 'login-find-id',
  '아이디 찾기 이메일 입력창': 'login-find-id-email',
  '아이디 찾기 결과 문구': 'login-find-id-result',
  '아이디 찾기 전송 버튼': 'login-find-id-submit',
  '아이디 찾기 취소 버튼': 'login-find-id-cancel',
};

test('아이디 찾기가 잘 동작한다 (취소)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });

  await page.getByTestId(testIds['아이디 찾기 버튼']).click();
  await page.getByTestId(testIds['아이디 찾기 이메일 입력창']).type('qwer');
  await page.getByTestId(testIds['아이디 찾기 취소 버튼']).click();
  await page.getByTestId(testIds['아이디 찾기 버튼']).click();
  await expect(page.getByTestId(testIds['아이디 찾기 이메일 입력창'])).toHaveValue('');
});

test('아이디 찾기가 잘 동작한다 (실패)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });

  await page.getByTestId(testIds['아이디 찾기 버튼']).click();
  await expect(page.getByTestId(testIds['아이디 찾기 전송 버튼'])).toBeDisabled();
  await page.getByTestId(testIds['아이디 찾기 이메일 입력창']).type('qwer');
  await page.getByTestId(testIds['아이디 찾기 전송 버튼']).click();
  await expect(page.getByTestId(testIds['아이디 찾기 결과 문구'])).toHaveText('유저를 찾을 수 없습니다');
  await expect(page.getByTestId(testIds['아이디 찾기 전송 버튼'])).toBeEnabled();
});

test('아이디 찾기가 잘 동작한다 (성공)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: false });

  await page.getByTestId(testIds['아이디 찾기 버튼']).click();
  await expect(page.getByTestId(testIds['아이디 찾기 전송 버튼'])).toBeDisabled();
  await page.getByTestId(testIds['아이디 찾기 이메일 입력창']).type('woohm402@snu.ac.kr');
  await page.getByTestId(testIds['아이디 찾기 전송 버튼']).click();
  await expect(page.getByTestId(testIds['아이디 찾기 결과 문구'])).toHaveText('이메일이 전송되었어요');
  await expect(page.getByTestId(testIds['아이디 찾기 전송 버튼'])).toBeDisabled();
});
