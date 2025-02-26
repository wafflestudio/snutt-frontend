import { type SearchTimeDto } from '@sf/snutt-api/src/apis/snutt-timetable/schemas';

import type { CellStatus, DragMode, Position } from '@/entities/timeMask';
import type { FullTimetable } from '@/entities/timetable';

export interface TimeMaskService {
  getInitialCellStatus(row: number, col: number): CellStatus;
  getUpdatedCellStatus(prev: CellStatus, dragStart: Position, dragEnd: Position): CellStatus;
  checkIsInArea(target: Position, from: Position, to: Position): boolean;
  getDragMode(cellStatus: CellStatus, dragStart: Position): DragMode;
  getTimes(cellStatus: CellStatus): SearchTimeDto[];
  getTimesByTimeTable(timetable: FullTimetable): SearchTimeDto[];
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
    getTimes: (cellStatus) => {
      const transposed = cellStatus[0].map((_, j) => cellStatus.map((row) => row[j])); // 행-열 반전

      const result = transposed.flatMap((cells, day) =>
        cells.reduce((acc: SearchTimeDto[], cur, index) => {
          if (!cur) return acc;

          const startMinute = (index + 16) * 30;

          const prev = acc.find((target) => target.endMinute === startMinute - 1);

          return [
            ...acc.filter((target) => target.endMinute !== startMinute - 1),
            {
              day,
              startMinute: prev?.startMinute || startMinute,
              endMinute: startMinute + 30 - 1,
            } as SearchTimeDto,
          ];
        }, []),
      );

      return result;
    },
    getTimesByTimeTable: (timetable) => {
      return timetable.lecture_list.flatMap((lecture) => {
        return lecture.class_time_json.map((classTime) => {
          const [startHour, startMinute] = classTime.start_time.split(':');
          const [endHour, endMinute] = classTime.end_time.split(':');
          return {
            day: classTime.day,
            startMinute: Number(startHour) * 60 + Number(startMinute),
            endMinute: Number(endHour) * 60 + Number(endMinute),
          };
        });
      });
    },
  };
};

const checkIsInArea: TimeMaskService['checkIsInArea'] = (target: Position, from: Position, to: Position) =>
  target.i >= Math.min(from.i, to.i) &&
  target.i <= Math.max(from.i, to.i) &&
  target.j >= Math.min(from.j, to.j) &&
  target.j <= Math.max(from.j, to.j);

const getDragMode: TimeMaskService['getDragMode'] = (cellStatus, dragStart) =>
  cellStatus[dragStart.i][dragStart.j] ? 'remove' : 'add';
