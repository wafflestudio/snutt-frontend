import { type Day, type DayTimeRange, DAYS, MINUTES_PER_HOUR } from './time';

/** 그리드에 표시할 요일과 시간 범위. 시간 범위는 항상 정시 단위다. */
export type GridRange = { days: Day[]; startMinute: number; endMinute: number };

type GridRangeOptions = {
  /** 강의가 없어도 기본으로 보여줄 시간 (정시) */
  startHour?: number;
  endHour?: number;
  /**
   * all: 월~일 전부
   * auto: 월~금 + 강의가 있는 가장 늦은 요일까지 (토요일 강의가 있으면 월~토)
   */
  days?: 'all' | 'auto';
};

export const DEFAULT_GRID_START_HOUR = 9;
export const DEFAULT_GRID_END_HOUR = 22;

/** 기본 범위를 보여주되, 범위를 벗어나는 강의가 있으면 정시 단위로 넓힌다 */
export const getGridRange = (
  times: readonly DayTimeRange[],
  { startHour = DEFAULT_GRID_START_HOUR, endHour = DEFAULT_GRID_END_HOUR, days = 'all' }: GridRangeOptions = {},
): GridRange => {
  const earliest = Math.min(startHour * MINUTES_PER_HOUR, ...times.map((t) => t.startMinute));
  const latest = Math.max(endHour * MINUTES_PER_HOUR, ...times.map((t) => t.endMinute));
  const lastDay = Math.max(4, ...times.map((t) => t.day));

  return {
    days: days === 'all' ? [...DAYS] : DAYS.filter((day) => day <= lastDay),
    startMinute: Math.floor(earliest / MINUTES_PER_HOUR) * MINUTES_PER_HOUR,
    endMinute: Math.ceil(latest / MINUTES_PER_HOUR) * MINUTES_PER_HOUR,
  };
};

/** 그리드 왼쪽에 표시할 시각 (정시, 분 단위). 9:00~22:00 이면 [540, 600, ..., 1260] */
export const getHourMarks = ({ startMinute, endMinute }: GridRange) =>
  Array.from({ length: (endMinute - startMinute) / MINUTES_PER_HOUR }, (_, i) => startMinute + i * MINUTES_PER_HOUR);

export type GridEntry<T> = { item: T; time: DayTimeRange };

/**
 * 그리드 위 블록의 위치. top / height 는 그리드 전체 높이에 대한 비율(0~1)이다.
 * 같은 요일에 시간이 겹치는 블록은 lane 을 나눠 나란히 놓는다. (너비 = 1 / laneCount)
 */
export type GridBlock<T> = GridEntry<T> & {
  column: number;
  top: number;
  height: number;
  lane: number;
  laneCount: number;
};

export const layoutGridBlocks = <T>(entries: readonly GridEntry<T>[], range: GridRange): GridBlock<T>[] => {
  const total = range.endMinute - range.startMinute;

  const visible = entries
    .map((entry) => ({
      entry,
      column: range.days.indexOf(entry.time.day),
      start: Math.max(entry.time.startMinute, range.startMinute),
      end: Math.min(entry.time.endMinute, range.endMinute),
    }))
    .filter(({ column, start, end }) => column !== -1 && start < end);

  const blocks: GridBlock<T>[] = [];

  range.days.forEach((_, column) => {
    const sorted = visible.filter((v) => v.column === column).sort((a, b) => a.start - b.start || b.end - a.end);

    // 서로 겹치는 블록끼리 묶은 뒤, 묶음 안에서 비어 있는 가장 앞 lane 에 배치한다
    let cluster: { v: (typeof sorted)[number]; lane: number }[] = [];
    let clusterEnd = -Infinity;

    const flush = () => {
      const laneCount = Math.max(0, ...cluster.map((c) => c.lane + 1));
      cluster.forEach(({ v, lane }) =>
        blocks.push({
          ...v.entry,
          column,
          top: (v.start - range.startMinute) / total,
          height: (v.end - v.start) / total,
          lane,
          laneCount,
        }),
      );
      cluster = [];
    };

    sorted.forEach((v) => {
      if (v.start >= clusterEnd) flush();
      const laneEnds: number[] = [];
      cluster.forEach((c) => (laneEnds[c.lane] = Math.max(laneEnds[c.lane] ?? -Infinity, c.v.end)));
      const freeLane = laneEnds.findIndex((end) => end <= v.start);
      cluster.push({ v, lane: freeLane === -1 ? laneEnds.length : freeLane });
      clusterEnd = cluster.length === 1 ? v.end : Math.max(clusterEnd, v.end);
    });
    flush();
  });

  return blocks;
};
