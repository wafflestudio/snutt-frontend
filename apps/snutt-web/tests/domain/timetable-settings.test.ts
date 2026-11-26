import { describe, expect, it } from 'vitest';
import { DEFAULT_TIMETABLE_SETTINGS, getTimetableRange } from '@/domain/timetable-settings';
import { toMinute } from '@/domain/time';

const times = [
  { day: 0 as const, startMinute: toMinute(10, 30), endMinute: toMinute(12) },
  { day: 2 as const, startMinute: toMinute(13), endMinute: toMinute(14, 15) },
];

describe('getTimetableRange', () => {
  it('자동 맞춤을 끄면 9 ~ 22시 월 ~ 금 (설정 화면이 생기기 전과 같다)', () => {
    expect(DEFAULT_TIMETABLE_SETTINGS.autoFit).toBe(false);
    expect(getTimetableRange(times, { autoFit: false })).toEqual({
      days: [0, 1, 2, 3, 4],
      startMinute: toMinute(9),
      endMinute: toMinute(22),
    });
  });

  it('자동 맞춤을 켜면 강의의 처음 ~ 끝을 정시로 넓힌 범위', () => {
    expect(getTimetableRange(times, { autoFit: true })).toEqual({
      days: [0, 1, 2, 3, 4],
      startMinute: toMinute(10),
      endMinute: toMinute(15),
    });
  });

  it('자동 맞춤이어도 강의가 없으면 기본 범위', () => {
    expect(getTimetableRange([], { autoFit: true })).toEqual(getTimetableRange([], { autoFit: false }));
  });
});
