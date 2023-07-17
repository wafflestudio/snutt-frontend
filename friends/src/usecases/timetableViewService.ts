import { Day, Hour } from '../entities/time';
import { FullTimetable } from '../entities/timetable';

export type TimetableViewService = {
  getDayRange: (table: FullTimetable) => [Day, Day];
  getHourRange: (table: FullTimetable) => [Hour, Hour];
  getDayLabel: (day: Day) => string;
};
