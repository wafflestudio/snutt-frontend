import type { GridRange } from './grid-layout';
import { compareDayTimeRange, type DayTimeRange } from './time';

/**
 * 검색 시간 필터에서 그리드로 고르는 시간대.
 * selection[column][row] 가 true 면 선택된 칸이다. column 은 GridRange.days 의 순서, row 는 30분 단위.
 *
 * 칸 번호는 GridRange 에 따라 의미가 바뀐다(범위가 넓어지면 같은 row 가 다른 시각이 된다).
 * 그래서 필터 상태는 DayTimeRange[] 로 저장하고, TimeSelection 은 그리드를 그리고 드래그하는 동안에만 쓴다.
 */
export type TimeSelection = boolean[][];

export type TimeSlot = { column: number; row: number };

export const TIME_FILTER_SLOT_MINUTES = 30;

export const getSlotCount = ({ startMinute, endMinute }: GridRange) =>
  (endMinute - startMinute) / TIME_FILTER_SLOT_MINUTES;

export const createTimeSelection = (range: GridRange): TimeSelection =>
  range.days.map(() => Array.from({ length: getSlotCount(range) }, () => false));

/**
 * 드래그로 사각형 영역을 선택하거나 해제한다.
 * 드래그를 시작한 칸이 선택돼 있었으면 해제, 아니면 선택.
 */
export const applyDragSelection = (selection: TimeSelection, from: TimeSlot, to: TimeSlot): TimeSelection => {
  const nextValue = !selection[from.column]?.[from.row];
  const isInDragArea = (column: number, row: number) =>
    isBetween(column, from.column, to.column) && isBetween(row, from.row, to.row);

  return selection.map((rows, column) =>
    rows.map((selected, row) => (isInDragArea(column, row) ? nextValue : selected)),
  );
};

const isBetween = (value: number, a: number, b: number) => Math.min(a, b) <= value && value <= Math.max(a, b);

/** 선택된 칸을 요일별 연속 구간으로 합친다 */
export const selectionToRanges = (selection: TimeSelection, range: GridRange): DayTimeRange[] =>
  selection.flatMap((rows, column) => {
    const day = range.days[column];
    const ranges: DayTimeRange[] = [];

    rows.forEach((selected, row) => {
      if (!selected) return;
      const startMinute = range.startMinute + row * TIME_FILTER_SLOT_MINUTES;
      const endMinute = startMinute + TIME_FILTER_SLOT_MINUTES;
      const last = ranges.at(-1);
      if (last && last.endMinute === startMinute) last.endMinute = endMinute;
      else ranges.push({ day, startMinute, endMinute });
    });

    return ranges;
  });

/** 구간 목록을 선택 상태로 되돌린다. 칸 전체가 구간 안에 들어가야 선택된 것으로 본다. */
export const rangesToSelection = (ranges: readonly DayTimeRange[], range: GridRange): TimeSelection =>
  createTimeSelection(range).map((rows, column) =>
    rows.map((_, row) => {
      const startMinute = range.startMinute + row * TIME_FILTER_SLOT_MINUTES;
      const endMinute = startMinute + TIME_FILTER_SLOT_MINUTES;
      return ranges.some(
        (r) => r.day === range.days[column] && r.startMinute <= startMinute && endMinute <= r.endMinute,
      );
    }),
  );

/**
 * 강의 검색의 시간 조건 (시간대 검색 모달). 두 조건을 함께 고를 수 있고, 서버는 둘 다 만족하는 강의를 준다.
 * 어느 조건이든 있으면 서버는 수업 시간이 없는 강의를 주지 않는다. (2026-10-17 dev 서버 확인)
 */
export type TimeFilter = {
  /** 그리드에서 고른 시간. 수업 시간이 하나도 빠짐없이 이 안(구간 하나)에 들어가는 강의만 찾는다 (서버 `times`) */
  times: DayTimeRange[];
  /** 고른 시간표의 강의와 겹치지 않는 강의만 찾는다 (서버 `timesToExclude` 에 시간표의 수업 시간을 보낸다) */
  emptyOnly: boolean;
};

export const EMPTY_TIME_FILTER: TimeFilter = { times: [], emptyOnly: false };

export const isTimeFilterEmpty = ({ times, emptyOnly }: TimeFilter) => times.length === 0 && !emptyOnly;

/**
 * 검색 요청에 넣을 시간 조건. 빈 시간대만이면 시간표의 수업 시간(occupied)을 뺄 시간으로 보낸다.
 * 장소 같은 다른 필드는 지우고 정렬해서, 조건이 같으면 query key 도 같게 한다.
 */
export const toSearchTimes = (
  { times, emptyOnly }: TimeFilter,
  occupied: readonly DayTimeRange[],
): { times: DayTimeRange[]; excludedTimes: DayTimeRange[] } => ({
  times: toSortedRanges(times),
  excludedTimes: emptyOnly ? toSortedRanges(occupied) : [],
});

const toSortedRanges = (ranges: readonly DayTimeRange[]) =>
  ranges.map(({ day, startMinute, endMinute }) => ({ day, startMinute, endMinute })).sort(compareDayTimeRange);
