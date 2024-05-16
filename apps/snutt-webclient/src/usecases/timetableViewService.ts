import type { BaseLecture } from '@/entities/lecture';
import type { Day, Hour24, HourMinute24, Minute } from '@/entities/time';
import type { TimetableDisplayMode } from '@/entities/timetableView';
import type { StorageRepository } from '@/repositories/storageRepository';
import type { ArrayElement } from '@/utils/array-element';

type LectureTime = ArrayElement<BaseLecture['class_time_json']>;

export interface TimetableViewService {
  getDisplayMode: () => TimetableDisplayMode;
  setDisplayMode: (mode: TimetableDisplayMode) => void;

  getDayRange: (times: LectureTime[]) => [Day, Day]; // start ~ end
  getHourRange: (times: LectureTime[]) => [Hour24, Hour24]; // start ~ end
  getGridPos: (
    times: LectureTime[],
    time: LectureTime,
    isCustomLecture?: boolean,
  ) => { col: [number, number]; row: [number, number] };

  parseTime: (time: string) => HourMinute24; // 11:55 => { hour: 11, minute: 55 }
  formatTime: (hourMinute: HourMinute24) => string; // { hour: 11, minute: 55 } => 11:55
}

export const getTimetableViewService = ({
  repositories,
}: {
  repositories: [StorageRepository];
}): TimetableViewService => {
  const getDisplayMode = () => (repositories[0].get('timetable_display_mode', true) === 'full' ? 'full' : 'real');
  const parseTime = (time: string) => ({ hour: +time.split(':')[0] as Hour24, minute: +time.split(':')[1] as Minute });
  const formatTime = ({ hour, minute }: HourMinute24) =>
    `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;

  const getHourRange = (times: LectureTime[]): [Hour24, Hour24] => {
    const start = Math.min(...times.map((t) => parseTime(t.start_time).hour), 8) as Hour24;
    const end = Math.max(...times.map((t) => parseTime(t.end_time).hour), 22) as Hour24;
    return [start, end];
  };

  return {
    getDisplayMode,
    setDisplayMode: (mode) => repositories[0].set('timetable_display_mode', mode, true),
    getDayRange: (times) => [0, Math.max(4, Math.max(...times.map((item) => item.day))) as Day],
    getHourRange,
    getGridPos: (times, time, isCustomLecture = false) => {
      const startHour = getHourRange(times)[0];
      const displayMode = getDisplayMode();

      // 요일
      const colStart = time.day + 2;
      const colEnd = colStart + 1;

      // 시간
      const rowStart = (() => {
        const { hour, minute } = parseTime(time.start_time);
        const row = (hour - startHour) * 12 + minute / 5;
        return row + 2;
      })();
      const rowEnd = (() => {
        const { hour, minute } = parseTime(time.end_time);
        const row = (hour - startHour) * 12 + minute / 5;
        return displayMode === 'full' && !isCustomLecture ? Math.ceil(row / 6) * 6 + 2 : row + 2;
      })();

      return { col: [colStart, colEnd], row: [rowStart, rowEnd] };
    },
    parseTime,
    formatTime,
  };
};
