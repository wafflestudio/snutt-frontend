import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

test('필터 모달이 정상 동작한다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true });
  await page.getByTestId('layout-searchbar-filter-button').click();
  await expect(page.getByText('상세조건 설정')).toHaveCount(1);
});

test('시간대 선택 기능이 정상 동작한다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true });
  await page.getByTestId('layout-searchbar-filter-button').click();
  await page.getByTestId('layout-searchbar-filter-dialog-form-time-check').click();
  await page.getByTestId('layout-searchbar-filter-dialog-form-time-radio-manual').click();
  await page.getByTestId('layout-searchbar-filter-dialog-form-time-manual-button').click();
  // TODO: 이거 어떻게하지
});

test('검색 폼이 잘 보여진다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true });
  await page.getByTestId('layout-searchbar-filter-button').click();
  await expect(page.getByText('영어진행 강의')).toHaveCount(1);
  await expect(page.getByText('시간대 검색')).toHaveCount(2);
});

test('검색 기능이 정상 동작한다 (검색 결과 있을 때)', async ({ page }) => {
  await page.goto('/?year=2001&semester=2');
  await givenUser(page, { login: true });
  await page.waitForResponse((res) => res.url().includes('/v1/tables/789'));
  await page.getByTestId('layout-searchbar-filter-button').click();
  await page.getByTestId('layout-searchbar-filter-dialog-form-time-check').click();
  await page.getByTestId('layout-searchbar-filter-dialog-form-time-radio-auto').click();
  await page.getByText('군휴학 원격수업').click();
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/v1/search_query') &&
        req.postDataJSON().year === 2001 &&
        req.postDataJSON().limit === 200 &&
        req.postDataJSON().time_mask[0] === 671024127 &&
        req.postDataJSON().etc[0] === 'MO' &&
        req.postDataJSON().etc.length === 1 &&
        req.method() === 'POST',
    ),
    page.getByTestId('main-searchbar-filter-dialog-submit').click(),
  ]);
});

test('검색 기능이 정상 동작한다 (검색 결과 없을 때)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true });
  // TODO:
});

test('검색 초기화 기능이 정상 동작한다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true });
  // TODO:
});

test('미리보기가 정상 동작한다 (평일 강의)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true });
  // TODO:
});

test('미리보기가 정상 동작한다 (주말 강의)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page, { login: true });
  await page.getByTestId('main-searchbar-search').click();

  await expect(page.getByTestId('main-timetable-day')).toHaveCount(5);
  await expect(page.getByTestId('main-timetable-preview-lecture')).toHaveCount(0);
  await page.getByTestId('main-lecture-listitem').nth(2).hover(); // 일요일 강의 호버해서 미리보기
  await expect(page.getByTestId('main-timetable-day')).toHaveCount(7);
  await expect(page.getByTestId('main-timetable-preview-lecture')).toHaveCount(1);
});
