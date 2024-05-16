import type { CellStatus, DragMode, Position, TimeMask } from '@/entities/timeMask';
import type { FullTimetable } from '@/entities/timetable';

export interface TimeMaskService {
  getInitialCellStatus(row: number, col: number): CellStatus;
  getUpdatedCellStatus(prev: CellStatus, dragStart: Position, dragEnd: Position): CellStatus;
  checkIsInArea(target: Position, from: Position, to: Position): boolean;
  getDragMode(cellStatus: CellStatus, dragStart: Position): DragMode;
  getBitMask(cellStatus: CellStatus): TimeMask;
  getTimetableEmptyTimeBitMask(timetable?: FullTimetable): TimeMask;
}

export const getTimeMaskService = (): TimeMaskService => {
  return {
    getInitialCellStatus: (r, c) =>
      Array(r)
        .fill(0)
        .map(() => Array(c).fill(false)),
    getUpdatedCellStatus: (prev, start, end) =>
      prev.map((row, i) =>
        row.map((col, j) =>
          checkIsInArea({ i, j }, start, end) ? { add: true, remove: false }[getDragMode(prev, start)] : col,
        ),
      ),
    checkIsInArea,
    getDragMode,
    getBitMask: (cellStatus) => {
      const transposed = cellStatus[0].map((_, j) => cellStatus.map((row) => row[j])); // 행-열 반전
      return transposed.map((row) => row.map(Number).reduce((acc, cur) => acc * 2 + cur, 0)) as TimeMask;
    },
    getTimetableEmptyTimeBitMask: (timetable) =>
      (timetable?.lecture_list ?? [])
        .reduce<TimeMask>(
          (acc, cur) => acc.map((mask, day) => mask | cur.class_time_mask[day]) as TimeMask,
          [0, 0, 0, 0, 0, 0, 0],
        )
        .map((mask) => mask ^ 0x3fffffff) as TimeMask,
  };
};

const checkIsInArea: TimeMaskService['checkIsInArea'] = (target: Position, from: Position, to: Position) =>
  target.i >= Math.min(from.i, to.i) &&
  target.i <= Math.max(from.i, to.i) &&
  target.j >= Math.min(from.j, to.j) &&
  target.j <= Math.max(from.j, to.j);

const getDragMode: TimeMaskService['getDragMode'] = (cellStatus, dragStart) =>
  cellStatus[dragStart.i][dragStart.j] ? 'remove' : 'add';
