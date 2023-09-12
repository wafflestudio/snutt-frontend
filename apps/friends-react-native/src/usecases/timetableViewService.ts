import { Color } from '../entities/color';
import { Day, Hour } from '../entities/time';
import { FullTimetable } from '../entities/timetable';

export type TimetableViewService = {
  getDayRange: (table: Pick<FullTimetable, 'lectures'>) => [Day, Day];
  getHourRange: (table: Pick<FullTimetable, 'lectures'>) => [Hour, Hour]; // Note: [9, 17] 이면 9:00 ~ 17:59 를 의미한다
  getDayLabel: (day: Day) => string;
  getLessonColor: (lesson: FullTimetable['lectures'][number], palette: Color[]) => { bg: string; fg: string };
};
