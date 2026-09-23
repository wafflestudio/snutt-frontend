import { describe, expect, it } from 'vitest';

import {
  compareDayTimeRange,
  type DayTimeRange,
  formatDayTimeRange,
  formatMinute,
  isOverlapping,
  isValidDayTimeRange,
  toMinute,
} from './time';

const range = (day: DayTimeRange['day'], start: string, end: string): DayTimeRange => {
  const toM = (t: string) => toMinute(Number(t.split(':')[0]), Number(t.split(':')[1]));
  return { day, startMinute: toM(start), endMinute: toM(end) };
};

describe('formatMinute', () => {
  it.each([
    [0, '00:00'],
    [5, '00:05'],
    [600, '10:00'],
    [675, '11:15'],
    [1439, '23:59'],
    [1440, '24:00'],
  ])('%i → %s', (minute, expected) => expect(formatMinute(minute)).toBe(expected));
});

describe('formatDayTimeRange', () => {
  it('요일과 시각 범위를 표시한다', () => {
    expect(formatDayTimeRange(range(2, '09:30', '10:45'))).toBe('수 09:30~10:45');
  });
});

describe('isOverlapping', () => {
  it('같은 요일에 시간이 겹치면 true', () => {
    expect(isOverlapping(range(0, '10:00', '11:00'), range(0, '10:30', '11:30'))).toBe(true);
  });

  it('한 구간이 다른 구간을 포함해도 true', () => {
    expect(isOverlapping(range(0, '09:00', '12:00'), range(0, '10:00', '11:00'))).toBe(true);
  });

  it('끝과 시작이 맞닿으면 겹치지 않는다', () => {
    expect(isOverlapping(range(0, '10:00', '11:00'), range(0, '11:00', '12:00'))).toBe(false);
    expect(isOverlapping(range(0, '11:00', '12:00'), range(0, '10:00', '11:00'))).toBe(false);
  });

  it('요일이 다르면 겹치지 않는다', () => {
    expect(isOverlapping(range(0, '10:00', '11:00'), range(1, '10:00', '11:00'))).toBe(false);
  });

  it('1분만 겹쳐도 true', () => {
    expect(isOverlapping(range(0, '10:00', '11:01'), range(0, '11:00', '12:00'))).toBe(true);
  });
});

describe('isValidDayTimeRange', () => {
  it('시작 < 끝 이고 하루 안이면 유효', () => {
    expect(isValidDayTimeRange(range(0, '00:00', '24:00'))).toBe(true);
  });

  it.each([
    ['시작 = 끝', { day: 0, startMinute: 600, endMinute: 600 }],
    ['시작 > 끝', { day: 0, startMinute: 660, endMinute: 600 }],
    ['음수', { day: 0, startMinute: -10, endMinute: 600 }],
    ['하루 초과', { day: 0, startMinute: 600, endMinute: 1441 }],
    ['정수 아님', { day: 0, startMinute: 600.5, endMinute: 660 }],
  ] as const)('%s 는 유효하지 않다', (_, value) => expect(isValidDayTimeRange(value)).toBe(false));
});

describe('compareDayTimeRange', () => {
  it('요일, 시작 시각 순으로 정렬한다', () => {
    const sorted = [range(2, '09:00', '10:00'), range(0, '13:00', '14:00'), range(0, '09:00', '10:00')].sort(
      compareDayTimeRange,
    );
    expect(sorted.map(formatDayTimeRange)).toEqual(['월 09:00~10:00', '월 13:00~14:00', '수 09:00~10:00']);
  });
});
