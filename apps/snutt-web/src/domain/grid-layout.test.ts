import { describe, expect, it } from 'vitest';

import { getGridRange, getHourMarks, type GridRange, layoutGridBlocks } from './grid-layout';
import type { DayTimeRange } from './time';

const t = (day: DayTimeRange['day'], startHour: number, endHour: number): DayTimeRange => ({
  day,
  startMinute: startHour * 60,
  endMinute: endHour * 60,
});

describe('getGridRange', () => {
  it('강의가 없으면 기본 범위(월~일, 9~22시)', () => {
    expect(getGridRange([])).toEqual({ days: [0, 1, 2, 3, 4, 5, 6], startMinute: 540, endMinute: 1320 });
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

  describe("days: 'auto'", () => {
    it('평일 강의만 있으면 월~금', () => {
      expect(getGridRange([t(2, 10, 11)], { days: 'auto' }).days).toEqual([0, 1, 2, 3, 4]);
    });

    it('토요일 강의가 있으면 월~토', () => {
      expect(getGridRange([t(5, 10, 11)], { days: 'auto' }).days).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('일요일 강의가 있으면 월~일', () => {
      expect(getGridRange([t(6, 10, 11)], { days: 'auto' }).days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });
});

describe('getHourMarks', () => {
  it('시작부터 끝 전까지 정시 목록', () => {
    expect(getHourMarks({ days: [], startMinute: 540, endMinute: 720 })).toEqual([540, 600, 660]);
  });
});

describe('layoutGridBlocks', () => {
  // 월~금, 9~19시 (10시간 = 600분)
  const range: GridRange = { days: [0, 1, 2, 3, 4], startMinute: 540, endMinute: 1140 };
  const entry = (item: string, time: DayTimeRange) => ({ item, time });
  const summary = (blocks: ReturnType<typeof layoutGridBlocks<string>>) =>
    blocks
      .map(({ item, column, top, height, lane, laneCount }) => ({ item, column, top, height, lane, laneCount }))
      .sort((a, b) => a.item.localeCompare(b.item));

  it('요일은 column, 시간은 전체 높이에 대한 비율로 배치한다', () => {
    expect(summary(layoutGridBlocks([entry('a', t(2, 10, 12))], range))).toEqual([
      { item: 'a', column: 2, top: 0.1, height: 0.2, lane: 0, laneCount: 1 },
    ]);
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

  it('겹치지 않는 블록은 모두 lane 0', () => {
    const blocks = layoutGridBlocks([entry('a', t(0, 10, 11)), entry('b', t(0, 11, 12))], range);
    expect(blocks.every((b) => b.lane === 0 && b.laneCount === 1)).toBe(true);
  });

  it('겹치는 블록은 lane 을 나눈다', () => {
    expect(summary(layoutGridBlocks([entry('a', t(0, 10, 12)), entry('b', t(0, 11, 13))], range))).toMatchObject([
      { item: 'a', lane: 0, laneCount: 2 },
      { item: 'b', lane: 1, laneCount: 2 },
    ]);
  });

  it('비는 lane 은 재사용한다: a(10-12), b(10-11), c(11-12) → c 는 b 자리', () => {
    const blocks = summary(
      layoutGridBlocks([entry('a', t(0, 10, 12)), entry('b', t(0, 10, 11)), entry('c', t(0, 11, 12))], range),
    );
    expect(blocks).toMatchObject([
      { item: 'a', lane: 0, laneCount: 2 },
      { item: 'b', lane: 1, laneCount: 2 },
      { item: 'c', lane: 1, laneCount: 2 },
    ]);
  });

  it('세 블록이 모두 겹치면 lane 3개', () => {
    const blocks = layoutGridBlocks(
      [entry('a', t(0, 10, 13)), entry('b', t(0, 11, 13)), entry('c', t(0, 12, 13))],
      range,
    );
    expect(blocks.map((b) => b.laneCount)).toEqual([3, 3, 3]);
    expect(new Set(blocks.map((b) => b.lane))).toEqual(new Set([0, 1, 2]));
  });

  it('겹침 묶음이 끝나면 다음 블록부터 laneCount 를 새로 센다', () => {
    const blocks = summary(
      layoutGridBlocks([entry('a', t(0, 10, 12)), entry('b', t(0, 11, 12)), entry('c', t(0, 14, 15))], range),
    );
    expect(blocks.find((b) => b.item === 'c')).toMatchObject({ lane: 0, laneCount: 1 });
  });

  it('다른 요일끼리는 lane 에 영향이 없다', () => {
    const blocks = layoutGridBlocks([entry('a', t(0, 10, 12)), entry('b', t(1, 10, 12))], range);
    expect(blocks.every((b) => b.laneCount === 1)).toBe(true);
  });
});
