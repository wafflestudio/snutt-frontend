import type { Page } from '@playwright/test';
import { ACCOUNT, expect, test } from './fixtures';

const login = async (page: Page) => {
  await page.getByRole('textbox', { name: '아이디' }).fill(ACCOUNT.localId);
  await page.getByLabel('비밀번호').fill(ACCOUNT.password);
  await page.getByRole('button', { name: '로그인' }).click();
};

/** 시간표의 강의 블록 (요일마다 하나씩 있어서 첫 블록만 본다) */
const block = (page: Page, title: string) => page.getByRole('button', { name: new RegExp(`^${title},`) }).first();
/** 고른 시간표 탭. `시간표 1, 기본 시간표(15학점)` 처럼 학점이 붙는다 */
const selectedTab = (page: Page) => page.getByRole('tablist', { name: '시간표' }).getByRole('tab', { selected: true });

test('로그인하지 않았으면 로그인 화면으로 보내고, 틀리면 서버 메시지를 보여 준다', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);

  await page.getByRole('textbox', { name: '아이디' }).fill(ACCOUNT.localId);
  await page.getByLabel('비밀번호').fill('wrong');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page.getByText('아이디 또는 비밀번호가 올바르지 않습니다')).toBeVisible();
});

test('로그인 → 검색 → 담기 → 삭제', async ({ page }) => {
  await page.goto('/');
  await login(page);
  await expect(page).toHaveURL('/');
  await expect(selectedTab(page)).toContainText('15학점');

  // 검색해서 담는다
  await page.getByRole('searchbox', { name: '강의 검색' }).fill('운영관리');
  const results = page.getByRole('article');
  await expect(results).toHaveCount(1);
  await results.getByRole('button', { name: '시간표에 담기' }).click();
  await expect(block(page, '운영관리')).toBeVisible();
  await expect(selectedTab(page)).toContainText('18학점');

  // 강의 상세에서 지운다
  await block(page, '운영관리').click();
  await page.getByRole('complementary', { name: '강의 상세' }).getByRole('button', { name: '삭제' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: '확인' }).click();
  await expect(block(page, '운영관리')).toHaveCount(0);
  await expect(selectedTab(page)).toContainText('15학점');
  await expect(page.getByRole('complementary', { name: '강의 상세' })).toHaveCount(0);

  // 새로 고쳐도 로그인과 서버에 반영된 시간표가 남는다
  await page.reload();
  await expect(selectedTab(page)).toContainText('15학점');
  await expect(block(page, '경영전략')).toBeVisible();
});
