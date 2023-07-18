import { FullTimetable, BasicTimetable } from '../entities/timetable';

export type TimetableRepository = {
  listTimetables: () => Promise<BasicTimetable[]>;
  getTimetable: (id: FullTimetable['_id']) => Promise<FullTimetable>;
};
