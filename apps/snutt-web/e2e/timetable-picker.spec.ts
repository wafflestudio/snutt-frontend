import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/** 가짜 서버 origin = e2e 서버 origin */
const getOrigin = (page: Page) => new URL(page.url()).origin;

const login = async (page: Page) => {
  await page.getByRole('textbox', { name: '아이디' }).fill('snutt');
  await page.getByLabel('비밀번호').fill('password1');
  await page.getByRole('button', { name: '로그인' }).click();
};

test('허용 안 된 origin 이면 오류 화면을 보여 주고 목록이 없다', async ({ page }) => {
  await page.goto('/timetable-picker?origin=https://evil.com');
  await expect(page.getByText('허용되지 않은 요청입니다')).toBeVisible();
  // 시간표 목록을 렌더링하지 않는다
  await expect(page.getByRole('button', { name: /확인/ })).toHaveCount(0);
});

test('origin 없이 열면 오류 화면을 보여 준다', async ({ page }) => {
  await page.goto('/timetable-picker');
  await expect(page.getByText('허용되지 않은 요청입니다')).toBeVisible();
});

test('미로그인 상태에서 접근하면 로그인 폼을 보여 준다', async ({ page }) => {
  // getOrigin 이 올바른 URL 을 받도록 먼저 페이지를 열어 baseURL 을 확정한다
  await page.goto('/');
  const origin = getOrigin(page);
  await page.goto(`/timetable-picker?origin=${encodeURIComponent(origin)}`);
  await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
});

/**
 * popup 흐름: opener 로 열린 창에서 확인하면 창이 닫힌다.
 * 팝업 열기 전에 메인 페이지에서 미리 로그인해 두면 열린 뒤 메인 페이지가 추가 내비게이션을 하지 않으므로
 * window.opener 참조가 유효하게 유지된다.
 * postMessage 내용은 단위 테스트(picker-message.test.ts 등)에서 충분히 검증한다.
 */
test('popup 흐름: 확인 → 창 닫힘', async ({ page, context }) => {
  // 메인 페이지에서 먼저 로그인해 메인 페이지의 URL 이 / 로 고정된다
  await page.goto('/login');
  await login(page);
  await page.waitForURL('/');

  const origin = getOrigin(page);

  // window.open 으로 picker 팝업 열기 (opener 연결)
  const pickerPagePromise = context.waitForEvent('page');
  await page.evaluate(
    ({ url }) => window.open(url),
    { url: `/timetable-picker?origin=${encodeURIComponent(origin)}` },
  );
  const pickerPage = await pickerPagePromise;
  await pickerPage.waitForLoadState();

  // 이미 로그인됐으므로 바로 picker 가 뜬다
  // 버튼이 enabled 될 때까지 기다린 뒤 클릭한다.
  // force: true 를 쓰는 이유: Playwright 의 일반 click() 은 포인터 이벤트 시퀀스를 먼저
  // 발생시키는데, 이 과정에서 Chrome 이 창 닫기를 허용하지 않는 경우가 있다.
  // waitForEvent 를 click 보다 먼저 설정해야 창이 즉시 닫혀도 이벤트를 놓치지 않는다.
  const confirmBtn = pickerPage.getByTestId('timetable-picker-confirm');
  await expect(confirmBtn).toBeEnabled({ timeout: 10000 });
  const closePromise = pickerPage.waitForEvent('close');
  await confirmBtn.click({ force: true });

  // picker 창이 닫힌다
  await closePromise;
  expect(pickerPage.isClosed()).toBe(true);
});

test('다른 시간표 선택 → 확인하면 창이 닫힌다', async ({ page, context }) => {
  await page.goto('/login');
  await login(page);
  await page.waitForURL('/');

  const origin = getOrigin(page);

  const pickerPagePromise = context.waitForEvent('page');
  await page.evaluate(({ url }) => window.open(url), {
    url: `/timetable-picker?origin=${encodeURIComponent(origin)}`,
  });
  const pickerPage = await pickerPagePromise;
  await pickerPage.waitForLoadState();

  const confirmBtn2 = pickerPage.getByTestId('timetable-picker-confirm');
  await expect(confirmBtn2).toBeEnabled({ timeout: 10000 });

  // 다른 시간표 선택 (sample-2 가 있으면 클릭)
  const item2 = pickerPage.getByTestId('timetable-picker-item-sample-2');
  if ((await item2.count()) > 0) {
    await item2.click();
    expect(await item2.getAttribute('aria-pressed')).toBe('true');
    // 다른 시간표로 바꾼 뒤 detail 이 다시 로드되므로 enabled 대기
    await expect(confirmBtn2).toBeEnabled({ timeout: 10000 });
  }

  const closePromise2 = pickerPage.waitForEvent('close');
  await confirmBtn2.click({ force: true });
  await closePromise2;
  expect(pickerPage.isClosed()).toBe(true);
});

test('모바일 뷰포트에서도 로그인 · 목록 · 확인이 보인다', async ({ page, context }) => {
  // iPhone 12 크기 (390 x 844)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const origin = getOrigin(page);

  const pickerPagePromise = context.waitForEvent('page');
  await page.evaluate(({ url }) => window.open(url), {
    url: `/timetable-picker?origin=${encodeURIComponent(origin)}`,
  });
  const pickerPage = await pickerPagePromise;
  await pickerPage.setViewportSize({ width: 390, height: 844 });
  await pickerPage.waitForLoadState();

  // 로그인 폼이 보인다
  await expect(pickerPage.getByRole('button', { name: '로그인' })).toBeVisible();
  await login(pickerPage);

  // 목록이 보인다 (세로 레이아웃)
  await expect(pickerPage.getByTestId('timetable-picker-confirm')).toBeVisible();
});
