import { type Page } from '@playwright/test';

type Type =
  | 'temp' //     임시 유저
  | 'local' //    로컬 로그인 유저
  | 'fb' //       페이스북 로그인 유저
  | 'local_fb' // 로컬 로그인, 페이스북 연동 유저
  | 'wrong'; //   잘못된 토큰

export const givenUser = (page: Page, { login = true, type = 'local' }: { type?: Type; login?: boolean } = {}) => {
  if (!login) return;

  if (type === 'local') return page.evaluate(() => localStorage.setItem('snutt_token', 't1'));
  if (type === 'fb') return page.evaluate(() => localStorage.setItem('snutt_token', 't2'));
  if (type === 'temp') return page.evaluate(() => localStorage.setItem('snutt_token', 't3'));
  if (type === 'local_fb') return page.evaluate(() => localStorage.setItem('snutt_token', 't5'));
  if (type === 'wrong') return page.evaluate(() => localStorage.setItem('snutt_token', 'never')); // 존재하지 않는 유저 토큰
};
