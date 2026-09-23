import type { GridRange } from './grid-layout';
import type { DayTimeRange } from './time';

/**
 * 검색 시간 필터에서 그리드로 고르는 시간대.
 * slots[column][row] 가 true 면 선택된 칸이다. column 은 GridRange.days 의 순서, row 는 30분 단위.
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
  const [minColumn, maxColumn] = [Math.min(from.column, to.column), Math.max(from.column, to.column)];
  const [minRow, maxRow] = [Math.min(from.row, to.row), Math.max(from.row, to.row)];

  return selection.map((rows, column) =>
    rows.map((selected, row) =>
      column >= minColumn && column <= maxColumn && row >= minRow && row <= maxRow ? nextValue : selected,
    ),
  );
};

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
