import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { givenUser } from '../utils/user.ts';

const testIds = {
  '강의 추가하기 버튼': 'mt-add-custom-lecture',
  '강의명 필드': 'main-lecture-edit-form-title',
  '강의 색 칩': 'main-lecture-edit-form-color',
  '강의 시간 추가 버튼': 'main-lecture-edit-form-add-time',
  '강의 시간 행': 'main-lecture-edit-form-time',
  '강의 생성 제출 버튼': 'main-lecture-create-dialog-submit',
  '강의 생성 취소 버튼': 'main-lecture-create-dialog-cancel',
  '에러 모달 메세지': 'error-dialog-message',
  '에러 모달 확인': 'error-dialog-confirm',
};

test('강의 생성 모달이 잘 보여진다 (성공 케이스)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  await page.getByTestId(testIds['강의 추가하기 버튼']).click();

  await expect(page.getByTestId(testIds['강의명 필드'])).toHaveValue('');
  await page.getByTestId(testIds['강의명 필드']).fill('떡볶이맛 아몬드');
  await page.getByTestId(testIds['강의 색 칩']).filter({ hasText: '라벤더' }).click();
  await page.getByTestId(testIds['강의 시간 추가 버튼']).click();
  await page.getByTestId(testIds['강의 시간 행']).nth(0).locator('input').nth(2).fill('낙아치');
  await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/v1/tables/123/lecture') &&
        req.method() === 'POST' &&
        req.postDataJSON().class_time_json[0].place === '낙아치' &&
        req.postDataJSON().class_time_json[1] === undefined &&
        req.postDataJSON().course_title === '떡볶이맛 아몬드' &&
        req.postDataJSON().credit === 0 &&
        req.postDataJSON().instructor === '' &&
        req.postDataJSON().remark === '' &&
        req.postDataJSON().colorIndex === 8,
    ),
    page.waitForRequest((req) => req.method() === 'GET' && req.url().includes('/v1/tables/123')),
    page.getByTestId(testIds['강의 생성 제출 버튼']).click(),
  ]);
  // TODO: 모달 닫히는거 확인
});

test('강의 생성 모달이 잘 취소된다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);

  await page.getByTestId(testIds['강의 추가하기 버튼']).click();
  await page.getByTestId(testIds['강의명 필드']).fill('떡볶이맛 아몬드');
  await page.keyboard.up('Escape');

  await page.getByTestId(testIds['강의 추가하기 버튼']).click();
  await expect(page.getByTestId(testIds['강의명 필드'])).toHaveValue('');
});

test('강의 생성 모달이 잘 실패된다 (강의명 없을 때)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);

  await page.getByTestId(testIds['강의 추가하기 버튼']).click();
  await page.getByTestId(testIds['강의명 필드']).fill('떡볶이맛 아몬드');
  await page.getByTestId(testIds['강의명 필드']).clear();
  await page.getByTestId(testIds['강의 생성 제출 버튼']).click();
  await expect(page.getByTestId(testIds['에러 모달 메세지'])).toHaveText('강의명을 입력해 주세요');
});

test('강의 생성 모달이 잘 실패된다 (색 없을 때)', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);

  await page.getByTestId(testIds['강의 추가하기 버튼']).click();
  await page.getByTestId(testIds['강의명 필드']).fill('떡볶이맛 아몬드');
  await page.getByTestId(testIds['강의 생성 제출 버튼']).click();
  await expect(page.getByTestId(testIds['에러 모달 메세지'])).toHaveText('강의 색을 지정해 주세요');
});

test('커스텀 색 관련 ui가 잘 보여진다', async ({ page }) => {
  await page.goto('/');
  await givenUser(page);
  await page.getByTestId(testIds['강의 추가하기 버튼']).click();
  const cLabels = {
    커스텀: page.getByTestId('main-lecture-edit-form-custom-color'),
    하늘: page.getByTestId('main-lecture-edit-form-color').filter({ hasText: '하늘' }),
    감귤: page.getByTestId('main-lecture-edit-form-color').filter({ hasText: '감귤' }),
  };

  await expect(cLabels['커스텀']).toHaveValue('#888888');
  await expect(cLabels['커스텀']).toHaveAttribute('aria-selected', 'false');
  await expect(cLabels['감귤']).toHaveAttribute('aria-selected', 'false');
  await cLabels['하늘'].click();
  await expect(cLabels['하늘']).toHaveAttribute('aria-selected', 'true');
  await expect(cLabels['감귤']).toHaveAttribute('aria-selected', 'false');
  await cLabels['커스텀'].click();
  await expect(cLabels['커스텀']).toHaveValue('#888888');
  await expect(cLabels['커스텀']).toHaveAttribute('aria-selected', 'true');
  await expect(cLabels['하늘']).toHaveAttribute('aria-selected', 'false');
});
