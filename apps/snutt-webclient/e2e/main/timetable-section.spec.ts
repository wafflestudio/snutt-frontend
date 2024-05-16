import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenTimetableDisplayMode } from '../utils/timetable.ts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.js';

test('로그인되었을 경우, 시간표 목록 탭이 정상 동작한다 (시간표 2개인 학기)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const tabs = page.getByTestId('mt-tab');
  await expect(tabs).toHaveCount(2);
  const tab1 = tabs.filter({ hasText: '나의 시간표' });
  const tab2 = tabs.filter({ hasText: '나무의 시간표' });
  await expect(tab1).toHaveAttribute('aria-selected', `${true}`);
  await expect(tab2).toHaveAttribute('aria-selected', `${false}`);
  await expect(page.getByTestId('main-timetable-credit')).toHaveText('18학점');
  await tab2.click();
  await expect(tab1).toHaveAttribute('aria-selected', `${false}`);
  await expect(tab2).toHaveAttribute('aria-selected', `${true}`);
  await expect(page.getByTestId('main-timetable-credit')).toHaveText('16학점');
});

test('로그인되었을 경우, 시간표 목록 탭이 정상 동작한다 (시간표 1개인 학기)', async ({ page }) => {
  await page.goto('/?year=2001&semester=2');
  await givenUser(page);
  const tabs = page.getByTestId('mt-tab');
  await expect(tabs).toHaveCount(1);
  const tab1 = tabs.filter({ hasText: '나비의 시간표' });
  await expect(tab1).toHaveAttribute('aria-selected', `${true}`);
});

test('로그인되었을 경우, 시간표 목록 탭이 정상 동작한다 (시간표 없는 학기)', async ({ page }) => {
  await page.goto('/?year=4001&semester=3');
  await givenUser(page);
  const tabs = page.getByTestId('mt-tab');
  await expect(tabs).toHaveCount(0);
  await expect(page.getByTestId('mt-empty-create-timetable')).toHaveCount(1);
});

test('로그인되었을 경우, 시간표 내용이 보인다 (월~금 시간표)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const table = page.getByTestId('main-timetable');
  const lecture = page.getByTestId('main-timetable-lecture');
  await expect(table).not.toContainText('토');
  await expect(lecture).toHaveCount(18);
  await expect(page.getByTestId('hour-label')).toHaveCount(15);
  await expect(lecture.filter({ hasText: '고급수학 2' })).toHaveCount(2);
  await expect(lecture.filter({ hasText: '상상력과 문화' }).first()).toHaveAttribute(
    'style',
    'background-color: rgb(166, 217, 48); color: rgb(255, 255, 255);',
  );
  await expect(lecture.filter({ hasText: '생물학실험' })).toHaveCSS('grid-column', '2 / 3');
  await expect(lecture.filter({ hasText: '생물학실험' })).toHaveCSS('grid-row', '86 / 108');
});

test('시간표 장소가 보인다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  await expect(page.getByTestId('main-timetable-lecture').filter({ hasText: '상상력과 문화' }).first()).toContainText(
    '014-203',
  );
});

test('로그인되었을 경우, 시간표 내용이 보인다 (월~일 시간표)', async ({ page }) => {
  await page.goto('/?year=2001&semester=2');
  await givenUser(page);
  await givenTimetableDisplayMode(page, { type: 'full' });
  const table = page.getByTestId('main-timetable');
  const lecture = page.getByTestId('main-timetable-lecture');
  await expect(table).toContainText('일');
  await expect(lecture.filter({ hasText: '헬스' })).toHaveCount(7);
  await expect(lecture.filter({ hasText: '물리학실험' })).toHaveCSS('grid-column', '4 / 5');
  await expect(lecture.filter({ hasText: '물리학실험' })).toHaveCSS('grid-row', '62 / 86');
});

test('로그인되었을 경우, 시간표 내용이 보인다 (시작 끝 난리난 시간표)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const tabs = page.getByTestId('mt-tab');
  await tabs.filter({ hasText: '나무의 시간표' }).click();

  const table = page.getByTestId('main-timetable');
  const hourLabel = table.getByTestId('hour-label');
  const lecture = table.getByTestId('main-timetable-lecture');

  await expect(hourLabel).toHaveCount(24);
  await expect(lecture.filter({ hasText: '베이스세미나' })).toHaveCSS('grid-row', '5 / 26');
  await expect(lecture.filter({ hasText: '가디언세미나' })).toHaveCSS('grid-row', '224 / 279');
  await expect(lecture.filter({ hasText: '베이스 과외' })).toHaveCSS('grid-row', '200 / 212');
  await expect(lecture.filter({ hasText: '논리와 비판적 사고' })).toHaveCSS('grid-row', '170 / 204');
});

test('로그인되었을 경우, 시간표 생성 기능이 정상 동작한다 (성공 케이스)', async ({ page }) => {
  await page.goto('/?year=1001&semester=1');
  await givenUser(page, { login: true });
  await page.getByTestId('mt-create-timetable').click();
  await page.getByTestId('mt-create-timetable-title').type('나비의 시간표');
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/v1/tables') &&
        req.method() === 'POST' &&
        req.postDataJSON().semester === 1 &&
        req.postDataJSON().year === 1001 &&
        req.postDataJSON().title === '나비의 시간표',
    ),
    page.getByTestId('mt-create-timetable-confirm').click(),
  ]);

  const tabs = page.getByTestId('mt-tab');
  await expect(tabs).toHaveCount(3);
  const newTab = tabs.filter({ hasText: '나비의 시간표' });
  await expect(newTab).toHaveAttribute('aria-selected', `${true}`);
});

test('로그인되었을 경우, 시간표 생성 기능이 정상 동작한다 (실패 케이스)', async ({ page }) => {
  await page.goto('/?year=1001&semester=1');
  await givenUser(page, { login: true });
  await page.getByTestId('mt-create-timetable').click();
  await page.getByTestId('mt-create-timetable-title').type('나의 시간표');
  await page.getByTestId('mt-create-timetable-confirm').click();

  const tabs = page.getByTestId('mt-tab');
  await expect(tabs).toHaveCount(2);
  await expect(page.getByTestId('mt-create-timetable-error')).toHaveText('동일한 이름의 시간표가 존재합니다');
  await page.getByTestId('mt-create-timetable-cancel').click();
  await page.getByTestId('mt-create-timetable').click();
  await expect(page.getByTestId('mt-create-timetable-error')).toHaveText('');
});

test('로그인되었을 경우, 시간표 삭제 기능이 정상 동작한다', async ({ page }) => {
  await page.goto('/?year=1001&semester=1');
  await givenUser(page, { login: true });
  const tabs = page.getByTestId('mt-tab');

  await tabs.filter({ hasText: '나무의 시간표' }).locator('[data-testid=mt-tab-delete]').click();
  await expect(page.getByText('삭제하시겠습니까?')).toHaveCount(0); // active하지 않으므로, 모달이 열리는 대신 탭이 선택됨
  await tabs.filter({ hasText: '나무의 시간표' }).locator('[data-testid=mt-tab-delete]').click();
  await expect(page.getByText('시간표 이름을 변경합니다')).toHaveCount(0); // 시간표 이름 변경 모달이 같이 뜨는 이슈가 있어서 추가된 tc
  await expect(page.getByTestId('mt-tt-delete-submit')).toBeDisabled();
  await page.getByTestId('mt-tt-delete-input').type('나무의 시간표');
  await Promise.all([
    page.waitForRequest((req) => req.method() === 'DELETE' && req.url().includes('/v1/tables/456')),
    page.waitForRequest((req) => req.method() === 'GET' && req.url().includes('/v1/tables')),
    page.getByTestId('mt-tt-delete-submit').click(),
  ]);
  await expect(tabs.filter({ hasText: '나의 시간표' })).toHaveAttribute('aria-selected', `${true}`);
  await tabs.filter({ hasText: '나의 시간표' }).locator('[data-testid=mt-tab-delete]').click();
  await expect(page.getByTestId('mt-tt-delete-input')).toHaveValue('');
});

test('로그인되었을 경우, 시간표 이름 변경 기능이 정상 동작한다', async ({ page }) => {
  await page.goto('/?year=1001&semester=1');
  await givenUser(page, { login: true });

  const tabs = page.getByTestId('mt-tab');
  await tabs.filter({ hasText: '나무의 시간표' }).click();
  await expect(page.getByTestId('mt-tt-change-name-input')).toHaveCount(0);
  await tabs.filter({ hasText: '나무의 시간표' }).click();
  await expect(page.getByTestId('mt-tt-change-name-input')).toHaveValue('나무의 시간표');
  await page.getByTestId('mt-tt-change-name-input').type('소');
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/v1/tables/456') &&
        req.method() === 'PUT' &&
        req.postDataJSON().title === '소나무의 시간표',
    ),
    page.getByTestId('mt-tt-change-name-submit').click(),
  ]);
});
