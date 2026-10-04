import { type Day, type DayTimeRange, DAYS, MINUTES_PER_HOUR } from './time';

/** 그리드에 표시할 요일과 시간 범위. 시간 범위는 항상 정시 단위다. */
export type GridRange = { days: Day[]; startMinute: number; endMinute: number };

type GridRangeOptions = {
  /** 강의가 없어도 기본으로 보여줄 시간 (정시) */
  startHour?: number;
  endHour?: number;
  /**
   * auto (기본): 월~금 + 강의가 있는 가장 늦은 요일까지 (토요일 강의가 있으면 월~토)
   * all: 월~일 전부
   */
  days?: 'auto' | 'all';
};

const FRIDAY: Day = 4;

export const DEFAULT_GRID_START_HOUR = 9;
export const DEFAULT_GRID_END_HOUR = 22;

/** 기본 범위를 보여주되, 범위를 벗어나는 강의가 있으면 정시 단위로 넓힌다 */
export const getGridRange = (
  times: readonly DayTimeRange[],
  { startHour = DEFAULT_GRID_START_HOUR, endHour = DEFAULT_GRID_END_HOUR, days = 'auto' }: GridRangeOptions = {},
): GridRange => {
  const earliest = Math.min(startHour * MINUTES_PER_HOUR, ...times.map((t) => t.startMinute));
  const latest = Math.max(endHour * MINUTES_PER_HOUR, ...times.map((t) => t.endMinute));
  const lastDay = Math.max(FRIDAY, ...times.map((t) => t.day));

  return {
    days: days === 'all' ? [...DAYS] : DAYS.filter((day) => day <= lastDay),
    startMinute: Math.floor(earliest / MINUTES_PER_HOUR) * MINUTES_PER_HOUR,
    endMinute: Math.ceil(latest / MINUTES_PER_HOUR) * MINUTES_PER_HOUR,
  };
};

/** 그리드 왼쪽에 표시할 시각 (정시, 분 단위). 9:00~22:00 이면 [540, 600, ..., 1260] */
export const getHourMarks = ({ startMinute, endMinute }: GridRange) =>
  Array.from({ length: (endMinute - startMinute) / MINUTES_PER_HOUR }, (_, i) => startMinute + i * MINUTES_PER_HOUR);

/** 그리드에 올릴 항목. time 은 장소가 붙은 ClassTime 처럼 DayTimeRange 를 넓힌 타입이어도 된다. */
export type GridEntry<T, Time extends DayTimeRange = DayTimeRange> = { item: T; time: Time };

/** 강의 하나가 수업 시간마다 블록 하나가 되도록 편다. (월 · 수 수업이면 블록 2개) */
export const toGridEntries = <T extends { classTimes: readonly DayTimeRange[] }>(
  items: readonly T[],
): GridEntry<T, T['classTimes'][number]>[] => items.flatMap((item) => item.classTimes.map((time) => ({ item, time })));

/**
 * 그리드 위 블록의 위치. top / height 는 그리드 전체 높이에 대한 비율(0~1)이다.
 * 기획상 시간표 안의 강의는 시간이 겹치지 않으므로 칸을 나누지 않는다. 겹치면 뒤 항목이 위에 그려진다. (v1 과 같음)
 */
export type GridBlock<T, Time extends DayTimeRange = DayTimeRange> = GridEntry<T, Time> & {
  column: number;
  top: number;
  height: number;
};

/** 항목을 요일(column)과 시간(top / height)으로 배치한다. 범위 밖 요일은 빼고, 범위를 벗어난 시간은 잘라낸다. */
export const layoutGridBlocks = <T, Time extends DayTimeRange>(
  entries: readonly GridEntry<T, Time>[],
  range: GridRange,
): GridBlock<T, Time>[] => {
  const total = range.endMinute - range.startMinute;

  return entries.flatMap((entry) => {
    const column = range.days.indexOf(entry.time.day);
    const start = Math.max(entry.time.startMinute, range.startMinute);
    const end = Math.min(entry.time.endMinute, range.endMinute);
    if (column === -1 || start >= end) return [];
    return [{ ...entry, column, top: (start - range.startMinute) / total, height: (end - start) / total }];
  });
};
