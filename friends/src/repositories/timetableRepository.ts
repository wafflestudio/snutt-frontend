import { Timetable } from '../entities/timetable';

export type TimetableRepository = {
  listTimetables: () => Promise<Timetable[]>;
};
