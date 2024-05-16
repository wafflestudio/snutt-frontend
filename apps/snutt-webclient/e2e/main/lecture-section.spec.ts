import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.js';

test('강의 목록 탭이 정상 동작한다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const resultTab = page.getByTestId('ml-result-tab');
  const currentTab = page.getByTestId('ml-current-tab');
  await expect(resultTab).toHaveAttribute('aria-selected', 'false');
  await expect(currentTab).toHaveAttribute('aria-selected', 'true');
  await resultTab.click();
  await expect(resultTab).toHaveAttribute('aria-selected', 'true');
  await expect(currentTab).toHaveAttribute('aria-selected', 'false');
});

test('현재 시간표 탭이 정상 동작한다 (시간표 있을 때)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const currentTab = page.getByTestId('ml-current-tab');
  await expect(currentTab).toHaveAttribute('aria-selected', 'true');

  const lectureItem = page.getByTestId('main-lecture-listitem');
  await expect(lectureItem.nth(0).getByTestId('main-lecture-listitem-title')).toHaveText('고급수학 2');
  await expect(lectureItem.nth(1).getByTestId('main-lecture-listitem-instructor')).toHaveText('이영기 / 4학점');
  await expect(lectureItem.nth(1).getByTestId('main-lecture-listitem-place')).toHaveText('302-208, -, 302-208');
  await expect(lectureItem.nth(3).getByTestId('main-lecture-listitem-department')).toHaveText('생명과학부, 1학년');
  await expect(lectureItem.nth(4).getByTestId('main-lecture-listitem-time')).toHaveText(
    '화(12:30~13:45), 목(12:30~13:45)',
  );
});

test('현재 시간표 탭이 정상 동작한다 (강의 없을 때)', async ({ page }) => {
  await page.goto('/?year=3001&semester=4');
  await givenUser(page);
  await expect(page.getByTestId('ml-current-no-lecture')).toHaveCount(1);
});

test('현재 시간표 탭이 정상 동작한다 (시간표 없을 때)', async ({ page }) => {
  await page.goto('/?year=4001&semester=3');
  await givenUser(page);
  await expect(page.getByTestId('ml-current-no-timetable')).toHaveCount(1);
});

test('수강편람 버튼이 정상 동작한다', async ({ page, context }) => {
  await page.goto('/');
  await givenUser(page);
  const currentTab = page.getByTestId('ml-current-tab');
  await expect(currentTab).toHaveAttribute('aria-selected', 'true');

  const lectureItem = page.getByTestId('main-lecture-listitem');
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    lectureItem.filter({ hasText: '고급수학 2' }).getByTestId('main-lecture-listitem-link').click(),
  ]);
  await expect(newPage).toHaveURL(
    'https://sugang.snu.ac.kr/sugang/cc/cc103.action?openSchyy=1001&openShtmFg=U000200001&openDetaShtmFg=U000300001&sbjtCd=L0442.000700&ltNo=001&sbjtSubhCd=000',
  );
  await expect(lectureItem.filter({ hasText: '복싱' }).getByTestId('main-lecture-listitem-link')).toHaveCount(0);
});

test('강의 삭제 기능이 정상 동작한다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const lectureItem = page.getByTestId('main-lecture-listitem');
  await lectureItem.filter({ hasText: '고급수학 2' }).getByTestId('main-lecture-listitem-delete').click();
  await Promise.all([
    page.waitForRequest(
      (req) => req.method() === 'DELETE' && req.url().includes('/v1/tables/123/lecture/5d1a0132db261b554d5d0078'),
    ),
    page.waitForRequest((req) => req.method() === 'GET' && req.url().includes('/v1/tables/123')),
    page.getByTestId('ml-lecture-delete-submit').click(),
  ]);
});

test('검색 결과 탭이 정상 동작한다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  await page.getByTestId('main-searchbar-input').type('컴');
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'POST' &&
        req.url().includes('/v1/search_query') &&
        req.postDataJSON().title === '컴' &&
        req.postDataJSON().limit === 200 &&
        req.postDataJSON().semester === 1 &&
        req.postDataJSON().year === 1001 &&
        Object.entries(req.postDataJSON()).length === 4,
    ),
    page.getByTestId('main-searchbar-search').click(),
  ]);
  await expect(page.getByTestId('ml-result-tab')).toHaveAttribute('aria-selected', 'true');

  const lectureItem = page.getByTestId('main-lecture-listitem');
  await expect(lectureItem.nth(0).getByTestId('main-lecture-listitem-title')).toHaveText('컴퓨터구조');
});

test('검색 결과 탭이 정상 동작한다 (시간표 없을 때)', async ({ page }) => {
  await page.goto('/?year=4001&semester=3');
  await givenUser(page);
  await page.getByTestId('main-searchbar-input').type('컴');
  await page.getByTestId('main-searchbar-search').click();
  const lectureItem = page.getByTestId('main-lecture-listitem');
  await expect(lectureItem.nth(0).getByText('추가')).toBeDisabled();
});

test('검색 결과 탭이 정상 동작한다 (검색 전)', async ({ page }) => {
  await page.goto('/?year=4001&semester=3');
  await givenUser(page);
  await page.getByTestId('ml-result-tab').click();
  await expect(page.getByText('강의를 검색하세요')).toHaveCount(1);
});

test('학기 변경 시 검색 결과가 초기화된다', async ({ page }) => {
  await page.goto('/?year=4001&semester=3');
  await givenUser(page);
  await page.getByTestId('main-searchbar-search').click();
  await page.getByTestId('ml-result-tab').click();
  await expect(page.getByText('강의를 검색하세요')).toHaveCount(0);
  await page.getByTestId('course-book-select').selectOption({ label: '2001년 여름학기' });
  await expect(page.getByText('강의를 검색하세요')).toHaveCount(1);
});

test('검색 결과 탭에서 추가 기능이 정상 동작한다 (성공)', async ({ page }) => {
  await page.goto('/?year=2001&semester=2');
  await givenUser(page, { login: true });
  await page.getByTestId('main-searchbar-input').type('컴');
  await page.getByTestId('main-searchbar-search').click();

  await expect(page.getByTestId('main-timetable-preview-lecture')).toHaveCount(0);
  await page.getByTestId('main-lecture-listitem').nth(10).hover();
  await expect(page.getByTestId('main-timetable-preview-lecture')).toHaveCount(2);

  await Promise.all([
    page.waitForRequest(
      (req) => req.method() === 'POST' && req.url().includes('/v1/tables/789/lecture/6329ab4fcb360c002b6efbf8'),
    ),
    page.waitForRequest((req) => req.method() === 'GET' && req.url().includes('/v1/tables/789')),
    page.getByTestId('main-lecture-listitem').nth(10).getByText('추가').click(),
  ]);
});

test('검색 결과 탭에서 추가 기능이 정상 동작한다 (실패)', async ({ page }) => {
  await page.goto('/?year=2001&semester=2');
  await givenUser(page, { login: true });
  await page.getByTestId('main-searchbar-input').type('컴');
  await page.getByTestId('main-searchbar-search').click();
  await page.getByTestId('main-lecture-listitem').nth(0).getByText('추가').click();
  await expect(page.getByTestId('error-dialog-message')).toHaveText('강의 시간이 서로 겹칩니다.');
});
