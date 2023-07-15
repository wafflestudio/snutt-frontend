import { Timetable } from '../entities/timetable';

export type TimetableService = {
  listTimetables: () => Promise<Timetable[]>;
};
