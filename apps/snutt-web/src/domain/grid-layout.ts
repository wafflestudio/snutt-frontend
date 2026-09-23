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

const FRIDAY: Day = 4;

export const DEFAULT_GRID_START_HOUR = 9;
export const DEFAULT_GRID_END_HOUR = 22;

/** 기본 범위를 보여주되, 범위를 벗어나는 강의가 있으면 정시 단위로 넓힌다 */
export const getGridRange = (
  times: readonly DayTimeRange[],
  { startHour = DEFAULT_GRID_START_HOUR, endHour = DEFAULT_GRID_END_HOUR, days = 'all' }: GridRangeOptions = {},
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

type ClippedEntry<T> = { entry: GridEntry<T>; start: number; end: number };

export const layoutGridBlocks = <T>(entries: readonly GridEntry<T>[], range: GridRange): GridBlock<T>[] => {
  const total = range.endMinute - range.startMinute;

  // 1. 범위 밖을 잘라내고 요일(column)별로 나눈다
  const byColumn = new Map<number, ClippedEntry<T>[]>();
  for (const entry of entries) {
    const column = range.days.indexOf(entry.time.day);
    const start = Math.max(entry.time.startMinute, range.startMinute);
    const end = Math.min(entry.time.endMinute, range.endMinute);
    if (column === -1 || start >= end) continue;
    const list = byColumn.get(column) ?? [];
    list.push({ entry, start, end });
    byColumn.set(column, list);
  }

  // 2. 요일마다 겹치는 것끼리 묶고, 3. 묶음 안에서 lane 을 배정한다
  return [...byColumn].flatMap(([column, clipped]) =>
    groupOverlapping(clipped).flatMap((cluster) => {
      const lanes = assignLanes(cluster);
      const laneCount = Math.max(...lanes) + 1;
      return cluster.map(({ entry, start, end }, i) => ({
        ...entry,
        column,
        top: (start - range.startMinute) / total,
        height: (end - start) / total,
        lane: lanes[i],
        laneCount,
      }));
    }),
  );
};

/** 시작 시각 순으로 정렬한 뒤, 앞 블록들과 이어서 겹치는 것끼리 묶는다 */
const groupOverlapping = <T>(items: readonly ClippedEntry<T>[]) => {
  const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end);
  const clusters: ClippedEntry<T>[][] = [];
  let clusterEnd = -Infinity;

  for (const item of sorted) {
    if (item.start >= clusterEnd) clusters.push([]);
    clusters[clusters.length - 1].push(item);
    clusterEnd = Math.max(clusterEnd, item.end);
  }
  return clusters;
};

/** 각 블록을 이미 비어 있는 가장 앞 lane 에 넣는다. 블록별 lane 번호를 돌려준다 */
const assignLanes = <T>(cluster: readonly ClippedEntry<T>[]) => {
  const laneEnds: number[] = [];
  return cluster.map(({ start, end }) => {
    const free = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    const lane = free === -1 ? laneEnds.length : free;
    laneEnds[lane] = end;
    return lane;
  });
};
