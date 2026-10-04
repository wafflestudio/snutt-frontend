import { describe, expect, it } from 'vitest';

import { getGridRange, getHourMarks, type GridRange, layoutGridBlocks, toGridEntries } from '@/domain/grid-layout';
import type { DayTimeRange } from '@/domain/time';

const t = (day: DayTimeRange['day'], startHour: number, endHour: number): DayTimeRange => ({
  day,
  startMinute: startHour * 60,
  endMinute: endHour * 60,
});

describe('getGridRange', () => {
  it('강의가 없으면 기본 범위(월~금, 9~22시)', () => {
    expect(getGridRange([])).toEqual({ days: [0, 1, 2, 3, 4], startMinute: 540, endMinute: 1320 });
  });

  it('기본 범위 안의 강의는 범위를 바꾸지 않는다', () => {
    expect(getGridRange([t(0, 10, 12)])).toMatchObject({ startMinute: 540, endMinute: 1320 });
  });

  it('범위 밖 강의가 있으면 정시 단위로 넓힌다', () => {
    const range = getGridRange([
      { day: 0, startMinute: 8 * 60 + 30, endMinute: 10 * 60 }, // 08:30 시작 → 8시부터
      { day: 1, startMinute: 21 * 60, endMinute: 22 * 60 + 15 }, // 22:15 끝 → 23시까지
    ]);
    expect(range).toMatchObject({ startMinute: 480, endMinute: 1380 });
  });

  it('정시에 끝나는 강의는 범위를 한 시간 더 넓히지 않는다', () => {
    expect(getGridRange([t(0, 21, 23)])).toMatchObject({ endMinute: 1380 });
  });

  it('기본 시간을 옵션으로 바꿀 수 있다', () => {
    expect(getGridRange([], { startHour: 8, endHour: 20 })).toMatchObject({ startMinute: 480, endMinute: 1200 });
  });

  describe('요일', () => {
    it('평일 강의만 있으면 월~금', () => {
      expect(getGridRange([t(2, 10, 11)]).days).toEqual([0, 1, 2, 3, 4]);
    });

    it('토요일 강의가 있으면 월~토', () => {
      expect(getGridRange([t(5, 10, 11)]).days).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('일요일 강의가 있으면 월~일', () => {
      expect(getGridRange([t(6, 10, 11)]).days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it("days: 'all' 이면 강의가 없어도 월~일", () => {
      expect(getGridRange([], { days: 'all' }).days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });
});

describe('getHourMarks', () => {
  it('시작부터 끝 전까지 정시 목록', () => {
    expect(getHourMarks({ days: [], startMinute: 540, endMinute: 720 })).toEqual([540, 600, 660]);
  });
});

describe('toGridEntries', () => {
  it('수업 시간마다 항목 하나를 만든다', () => {
    const a = { id: 'a', classTimes: [t(0, 10, 11), t(2, 10, 11)] };
    const b = { id: 'b', classTimes: [t(1, 9, 10)] };
    expect(toGridEntries([a, b])).toEqual([
      { item: a, time: t(0, 10, 11) },
      { item: a, time: t(2, 10, 11) },
      { item: b, time: t(1, 9, 10) },
    ]);
  });

  it('수업 시간이 없는 강의는 항목이 없다', () => {
    expect(toGridEntries([{ classTimes: [] }])).toEqual([]);
  });
});

describe('layoutGridBlocks', () => {
  // 월~금, 9~19시 (10시간 = 600분)
  const range: GridRange = { days: [0, 1, 2, 3, 4], startMinute: 540, endMinute: 1140 };
  const entry = (item: string, time: DayTimeRange) => ({ item, time });

  it('요일은 column, 시간은 전체 높이에 대한 비율로 배치한다', () => {
    expect(layoutGridBlocks([entry('a', t(2, 10, 12))], range)).toEqual([
      { item: 'a', time: t(2, 10, 12), column: 2, top: 0.1, height: 0.2 },
    ]);
  });

  it('정시가 아닌 시각도 그대로 비율로 바꾼다', () => {
    const [block] = layoutGridBlocks([entry('a', { day: 0, startMinute: 543, endMinute: 603 })], range);
    expect(block).toMatchObject({ top: 3 / 600, height: 60 / 600 });
  });

  it('범위에 없는 요일의 블록은 제외한다', () => {
    expect(layoutGridBlocks([entry('sat', t(5, 10, 11))], range)).toEqual([]);
  });

  it('범위를 벗어난 부분은 잘라낸다', () => {
    const [block] = layoutGridBlocks([entry('a', t(0, 8, 10))], range);
    expect(block).toMatchObject({ top: 0, height: 0.1 });
    expect(block.time).toEqual(t(0, 8, 10)); // 원래 시간 정보는 유지
  });

  it('범위 밖에 완전히 있는 블록은 제외한다', () => {
    expect(layoutGridBlocks([entry('a', t(0, 7, 9))], range)).toEqual([]);
  });

  it('겹치는 블록도 칸을 나누지 않고 들어온 순서대로 둔다', () => {
    const blocks = layoutGridBlocks([entry('a', t(0, 10, 12)), entry('b', t(0, 11, 13))], range);
    expect(blocks.map(({ item, column }) => ({ item, column }))).toEqual([
      { item: 'a', column: 0 },
      { item: 'b', column: 0 },
    ]);
  });
});
