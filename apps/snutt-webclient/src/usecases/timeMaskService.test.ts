import { describe, expect, it, test } from '@jest/globals';

import type { FullTimetable } from '@/entities/timetable';

import { getTimeMaskService } from './timeMaskService';

const timeMaskService = getTimeMaskService();

test('getInitialCellStatus', () => {
  expect(timeMaskService.getInitialCellStatus(2, 3)).toStrictEqual([
    [false, false, false],
    [false, false, false],
  ]);
});

test('getDragMode', () => {
  expect(
    timeMaskService.getDragMode(
      [
        [false, false, true],
        [false, false, false],
      ],
      { i: 0, j: 2 },
    ),
  ).toBe('remove');
});

test('checkIsInArea', () => {
  expect(timeMaskService.checkIsInArea({ i: 0, j: 2 }, { i: 0, j: 2 }, { i: 0, j: 2 })).toBe(true);
  expect(timeMaskService.checkIsInArea({ i: 0, j: 2 }, { i: 0, j: 1 }, { i: 1, j: 3 })).toBe(true);
  expect(timeMaskService.checkIsInArea({ i: 0, j: 0 }, { i: 0, j: 1 }, { i: 1, j: 3 })).toBe(false);
});

test('getUpdatedCellStatus', () => {
  expect(
    timeMaskService.getUpdatedCellStatus(
      [
        [false, false, true],
        [false, false, false],
      ],
      { i: 0, j: 0 },
      { i: 1, j: 1 },
    ),
  ).toStrictEqual([
    [true, true, true],
    [true, true, false],
  ]);
});

test('getBitMask', () => {
  expect(
    timeMaskService.getBitMask([
      [false, false, true],
      [false, false, false],
    ]),
  ).toStrictEqual([0, 0, 2]);

  expect(
    timeMaskService.getBitMask([
      [false, false, true],
      [false, false, false],
      [false, true, false],
      [true, false, false],
      [false, true, false],
      [false, true, false],
    ]),
  ).toStrictEqual([4, 11, 32]);
});

describe('getTimetableEmptyTimeBitMask', () => {
  it('empty case', () => {
    expect(
      timeMaskService.getTimetableEmptyTimeBitMask({ lecture_list: [] } as unknown as FullTimetable),
    ).toStrictEqual([1073741823, 1073741823, 1073741823, 1073741823, 1073741823, 1073741823, 1073741823]);
  });

  it('simple case', () => {
    expect(
      timeMaskService.getTimetableEmptyTimeBitMask({
        lecture_list: [{ class_time_mask: [0, 536870912, 0, 0, 0, 0, 0] }],
      } as unknown as FullTimetable),
    ).toStrictEqual([1073741823, 536870911, 1073741823, 1073741823, 1073741823, 1073741823, 1073741823]);
  });

  it('complex case', () => {
    expect(
      timeMaskService.getTimetableEmptyTimeBitMask({
        lecture_list: [
          { class_time_mask: [4064, 0, 3584, 0, 0, 0, 0] },
          { class_time_mask: [28672, 0, 28672, 0, 0, 0, 0] },
          { class_time_mask: [0, 0, 786432, 0, 0, 0, 0] },
          { class_time_mask: [0, 229376, 0, 229376, 0, 0, 0] },
          { class_time_mask: [0, 3584, 0, 3584, 0, 0, 0] },
          { class_time_mask: [14680064, 0, 14680064, 0, 0, 0, 0] },
          { class_time_mask: [0, 28672, 0, 28672, 0, 0, 0] },
          { class_time_mask: [0, 192, 0, 192, 0, 0, 12582912] },
        ],
      } as FullTimetable),
    ).toStrictEqual([1059029023, 1073479999, 1058243071, 1073479999, 1073741823, 1073741823, 1061158911]);
  });
});
