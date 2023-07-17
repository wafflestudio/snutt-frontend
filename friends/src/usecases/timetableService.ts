import { BasicTimetable, FullTimetable } from '../entities/timetable';

export type TimetableService = {
  listTimetables: () => Promise<BasicTimetable[]>;
  getTimetable: (id: FullTimetable['_id']) => Promise<FullTimetable>;
};
