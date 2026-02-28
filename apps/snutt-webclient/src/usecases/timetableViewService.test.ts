import { describe, expect, test } from 'vitest';

import { getTimetableViewService } from './timetableViewService';

describe('getGridPos', () => {
  type Time = Parameters<ReturnType<typeof getTimetableViewService>['getGridPos']>[1];

  test('default mode', () => {
    const timetableViewService = getTimetableViewService({
      persistStorageRepository: { getDisplayMode: () => null, setDisplayMode: () => null },
    });

    expect(timetableViewService.getGridPos([], { startMinute: 660, endMinute: 780, day: 1 } as Time)).toStrictEqual({
      row: [38, 62],
      col: [3, 4],
    });

    expect(timetableViewService.getGridPos([], { startMinute: 600, endMinute: 765, day: 2 } as Time)).toStrictEqual({
      row: [26, 59],
      col: [4, 5],
    });

    expect(
      timetableViewService.getGridPos([], { startMinute: 660, endMinute: 765, day: 3 } as Time, true),
    ).toStrictEqual({
      row: [38, 59],
      col: [5, 6],
    });
  });

  test('real mode', () => {
    const timetableViewService = getTimetableViewService({
      persistStorageRepository: { getDisplayMode: () => 'real', setDisplayMode: () => null },
    });

    expect(timetableViewService.getGridPos([], { startMinute: 660, endMinute: 780, day: 1 } as Time)).toStrictEqual({
      row: [38, 62],
      col: [3, 4],
    });

    expect(timetableViewService.getGridPos([], { startMinute: 600, endMinute: 765, day: 2 } as Time)).toStrictEqual({
      row: [26, 59],
      col: [4, 5],
    });

    expect(
      timetableViewService.getGridPos([], { startMinute: 660, endMinute: 765, day: 3 } as Time, true),
    ).toStrictEqual({
      row: [38, 59],
      col: [5, 6],
    });
  });

  test('full mode', () => {
    const timetableViewService = getTimetableViewService({
      persistStorageRepository: { getDisplayMode: () => 'full', setDisplayMode: () => null },
    });

    expect(
      timetableViewService.getGridPos([{ startMinute: 0, endMinute: 720 } as Time], {
        startMinute: 660,
        endMinute: 780,
        day: 1,
      } as Time),
    ).toStrictEqual({
      row: [134, 158],
      col: [3, 4],
    });

    expect(timetableViewService.getGridPos([], { startMinute: 600, endMinute: 765, day: 2 } as Time)).toStrictEqual({
      row: [26, 62],
      col: [4, 5],
    });

    expect(
      timetableViewService.getGridPos([], { startMinute: 660, endMinute: 765, day: 3 } as Time, true),
    ).toStrictEqual({
      row: [38, 59],
      col: [5, 6],
    });
  });
});
