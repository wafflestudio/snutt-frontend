import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

const testIds = {
  선생님: 'main-lecture-edit-form-instructor',
  '강의 시간 추가 버튼': 'main-lecture-edit-form-add-time',
  '강의 시간 제거 버튼': 'main-lecture-edit-form-delete-time',
};

test('강의 수정 모달이 잘 보인다 (성공케이스)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const lectureItem = page.getByTestId('main-lecture-listitem');
  await expect(page.getByTestId('main-lecture-edit-dialog-content')).toHaveCount(0);
  await lectureItem.filter({ hasText: '컴퓨터공학부, 2학년' }).click();
  await expect(page.getByTestId('main-lecture-edit-form-title')).toHaveValue('컴퓨터프로그래밍');
  await page.getByTestId(testIds['선생님']).fill('떡볶이맛 아몬드');
  await page.getByTestId('main-lecture-edit-form-color').filter({ hasText: '라벤더' }).click();
  await page.getByTestId('main-lecture-edit-form-time').nth(0).locator('input').nth(2).fill('낙아치');
  await page.getByTestId('main-lecture-edit-form-time').nth(1).locator('input').nth(0).click();
  await page.getByTestId('hour-clock').getByText('4', { exact: true }).click();
  await page.getByTestId('time-pick-dialog-submit').click();
  await page.getByTestId('main-lecture-edit-form-remark').clear();
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.method() === 'PUT' &&
        req.url().includes('/v1/tables/123/lecture/5d1decbddb261b554d609dcc') &&
        req.postDataJSON().class_time_json[0].place === '낙아치' &&
        req.postDataJSON().class_time_json[1].start_time === '16:30' &&
        req.postDataJSON().class_time_json[1].end_time === '20:20' &&
        req.postDataJSON().class_time_json[2].place === '302-208' &&
        req.postDataJSON().course_title === undefined &&
        req.postDataJSON().credit === undefined &&
        req.postDataJSON().instructor === '떡볶이맛 아몬드' &&
        req.postDataJSON().remark === '' &&
        req.postDataJSON().colorIndex === 8,
    ),
    page.waitForRequest((req) => req.method() === 'GET' && req.url().includes('/v1/tables/123')),
    page.getByTestId('main-lecture-edit-dialog-submit').click(),
  ]);
  // TODO: 모달 닫히는거 확인
});

test('커스텀 색 관련 ui가 잘 보인다 (커스텀 색인 강의)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  await page.getByTestId('main-lecture-listitem').filter({ hasText: '진화와 인간사회' }).click();
  const cLabels = {
    커스텀: page.getByTestId('main-lecture-edit-form-custom-color'),
    하늘: page.getByTestId('main-lecture-edit-form-color').filter({ hasText: '하늘' }),
  };

  await expect(cLabels['커스텀']).toHaveValue('#000000');
  await expect(cLabels['커스텀']).toHaveAttribute('aria-selected', 'true');
  await expect(cLabels['하늘']).toHaveAttribute('aria-selected', 'false');
  await cLabels['하늘'].click();
  await expect(cLabels['커스텀']).toHaveAttribute('aria-selected', 'false');
  await expect(cLabels['하늘']).toHaveAttribute('aria-selected', 'true');
  await cLabels['커스텀'].click();
  await expect(cLabels['커스텀']).toHaveValue('#000000');
  await expect(cLabels['커스텀']).toHaveAttribute('aria-selected', 'true');
  await expect(cLabels['하늘']).toHaveAttribute('aria-selected', 'false');
  await cLabels['커스텀'].locator('input').fill('#1a1a1a', { force: true });
  await cLabels['하늘'].click();
  await cLabels['커스텀'].click();
  await expect(cLabels['커스텀']).toHaveValue('#1a1a1a');
  await expect(cLabels['커스텀']).toHaveAttribute('aria-selected', 'true');
  await expect(cLabels['하늘']).toHaveAttribute('aria-selected', 'false');
});

test('커스텀 색 관련 ui가 잘 보인다 (커스텀 색이 아닌 강의)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  await page.getByTestId('main-lecture-listitem').filter({ hasText: '컴퓨터프로그래밍' }).click();
  const cLabels = {
    커스텀: page.getByTestId('main-lecture-edit-form-custom-color'),
    하늘: page.getByTestId('main-lecture-edit-form-color').filter({ hasText: '하늘' }),
    감귤: page.getByTestId('main-lecture-edit-form-color').filter({ hasText: '감귤' }),
  };

  await expect(cLabels['커스텀']).toHaveValue('#888888');
  await expect(cLabels['커스텀']).toHaveAttribute('aria-selected', 'false');
  await expect(cLabels['감귤']).toHaveAttribute('aria-selected', 'true');
  await cLabels['하늘'].click();
  await expect(cLabels['하늘']).toHaveAttribute('aria-selected', 'true');
  await expect(cLabels['감귤']).toHaveAttribute('aria-selected', 'false');
  await cLabels['커스텀'].click();
  await expect(cLabels['커스텀']).toHaveValue('#888888');
  await expect(cLabels['커스텀']).toHaveAttribute('aria-selected', 'true');
  await expect(cLabels['하늘']).toHaveAttribute('aria-selected', 'false');
});

test('커스텀 색으로 잘 수정된다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const lectureItem = page.getByTestId('main-lecture-listitem');
  await expect(page.getByTestId('main-lecture-edit-dialog-content')).toHaveCount(0);
  await lectureItem.filter({ hasText: '김우찬 / 2학점' }).click();
  await page.getByTestId('main-lecture-edit-form-custom-color').click();
  await page.getByTestId('main-lecture-edit-form-custom-color').locator('input').fill('#1a1a1a', { force: true });
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/v1/tables/123/lecture/5d1a0132db261b554d5d0078') &&
        req.postDataJSON().colorIndex === 0 &&
        req.postDataJSON().color.bg === '#1a1a1a' &&
        req.postDataJSON().color.fg === '#ffffff' &&
        req.method() === 'PUT',
    ),
    page.waitForRequest((req) => req.method() === 'GET' && req.url().includes('/v1/tables/123')),
    page.getByTestId('main-lecture-edit-dialog-submit').click(),
  ]);
});

test('커스텀 색에서 잘 수정된다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const lectureItem = page.getByTestId('main-lecture-listitem');
  await expect(page.getByTestId('main-lecture-edit-dialog-content')).toHaveCount(0);
  await lectureItem.filter({ hasText: '진화와 인간사회' }).click();
  await page.getByTestId('main-lecture-edit-form-color').filter({ hasText: '비취' }).click();
  await Promise.all([
    page.waitForRequest((req) => req.postDataJSON().colorIndex === 5 && req.postDataJSON().color === undefined),
    page.waitForRequest((req) => req.method() === 'GET' && req.url().includes('/v1/tables/123')),
    page.getByTestId('main-lecture-edit-dialog-submit').click(),
  ]);
});

test('강의 시간 추가/제거가 잘 된다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  await page.getByTestId('main-lecture-listitem').filter({ hasText: '김우찬 / 2학점' }).click();
  await page.getByTestId(testIds['강의 시간 추가 버튼']).click();
  await page.getByTestId('main-lecture-edit-form-time').nth(2).locator('input').nth(2).type('박사');
  await page.getByTestId('main-lecture-edit-form-time').nth(1).getByTestId(testIds['강의 시간 제거 버튼']).click();
  await page.getByTestId('main-lecture-edit-form-time').nth(1).locator('input').nth(2).type('문도 ');
  await page.getByTestId('main-lecture-edit-form-time').nth(1).locator('input').nth(0).click();
  await page.getByTestId('hour-clock').getByText('9').click();
  await page.getByTestId('time-pick-dialog-submit').click();

  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.postDataJSON().class_time_json[1].place === '문도 박사' &&
        req.postDataJSON().class_time_json[1].start_time === '09:00' &&
        req.postDataJSON().class_time_json[1].end_time === '09:05' && // 시간이 자동으로 밀려서 end_time 이 start_time 과 같아진다
        req.postDataJSON().class_time_json[1].day === 0 &&
        req.postDataJSON().color === undefined &&
        req.postDataJSON().colorIndex === undefined &&
        req.url().includes('/v1/tables/123/lecture/5d1a0132db261b554d5d0078') &&
        req.method() === 'PUT',
    ),
    page.waitForRequest((req) => req.method() === 'GET' && req.url().includes('/v1/tables/123')),
    page.getByTestId('main-lecture-edit-dialog-submit').click(),
  ]);
});

test('음수 학점은 입력할 수 없다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const lectureItem = page.getByTestId('main-lecture-listitem');
  await lectureItem.filter({ hasText: '컴퓨터공학부, 2학년' }).click();
  await page.getByTestId('main-lecture-edit-form-credit').clear();
  await page.getByTestId('main-lecture-edit-form-credit').type('-1');
  await expect(page.getByTestId('main-lecture-edit-form-credit')).toHaveValue('1');
});

test('소수 학점은 입력할 수 없다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const lectureItem = page.getByTestId('main-lecture-listitem');
  await lectureItem.filter({ hasText: '컴퓨터공학부, 2학년' }).click();
  await page.getByTestId('main-lecture-edit-form-credit').clear();
  await page.getByTestId('main-lecture-edit-form-credit').type('1234.1234');
  await expect(page.getByTestId('main-lecture-edit-form-credit')).toHaveValue('12341234');
});

test('강의 수정 모달이 잘 취소된다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const lectureItem = page.getByTestId('main-lecture-listitem');
  await expect(page.getByTestId('main-lecture-edit-dialog-content')).toHaveCount(0);
  await lectureItem.filter({ hasText: '컴퓨터공학부, 2학년' }).click();
  await page.getByTestId(testIds['선생님']).type('떡볶이맛 아몬드');
  await page.getByTestId('main-lecture-edit-dialog-cancel').click();
  await lectureItem.filter({ hasText: '컴퓨터공학부, 2학년' }).click();
  await expect(page.getByTestId(testIds['선생님'])).toHaveValue('이영기');
});

test('강의 수정 모달이 잘 취소된다 (실패케이스)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  const lectureItem = page.getByTestId('main-lecture-listitem');
  await expect(page.getByTestId('main-lecture-edit-dialog-content')).toHaveCount(0);
  await lectureItem.filter({ hasText: '상상력과 문화' }).click();
  await page.getByTestId('main-lecture-edit-form-time').nth(1).locator('select').nth(0).selectOption('1');
  await page.getByTestId('main-lecture-edit-dialog-submit').click();
  await expect(page.getByTestId('error-dialog-message')).toHaveText('강의 시간이 서로 겹칩니다.');
});

test('강의 수정 모달이 잘 취소된다 (성공케이스, 커스텀강의)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  // TODO:
});

test('강의가 잘 삭제된다 (취소)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  await page.getByTestId('main-lecture-listitem').filter({ hasText: '상상력과 문화' }).click();
  await page.getByTestId('main-lecture-edit-dialog-delete').click();
  await page.getByTestId('ml-edit-delete-cancel').click();
  // TODO: 닫혔는지 테스트
});

test('강의가 잘 삭제된다 (확인)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  await page.getByTestId('main-lecture-listitem').filter({ hasText: '상상력과 문화' }).click();
  await page.getByTestId('main-lecture-edit-dialog-delete').click();

  await Promise.all([
    page.waitForRequest(
      (req) => req.method() === 'DELETE' && req.url().includes('/v1/tables/123/lecture/5d43e9fb3c46177d58a540b5'),
    ),
    page.waitForRequest((req) => req.method() === 'GET' && req.url().includes('/v1/tables/123')),
    page.getByTestId('ml-edit-delete-confirm').click(),
  ]);
  // TODO: 강의 삭제 모달 닫혔는지 테스트
  // TODO: 강의 수정 모달 닫혔는지 테스트
});
