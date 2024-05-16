import type { Semester } from '@/entities/semester';
import type { CreateLectureRequest, FullTimetable, Timetable, UpdateLectureRequest } from '@/entities/timetable';
import type { TimetableRepository } from '@/repositories/timetableRepository';

export interface TimetableService {
  getTimetables(): Promise<Timetable[]>;
  getFullTimetable(id: string): Promise<FullTimetable>;
  createTimetable(info: { title: string; year: number; semester: Semester }): Promise<Timetable[]>;
  renameTimetable(id: string, title: string): Promise<Timetable[]>;
  deleteTimetable(id: string): Promise<Timetable[]>;
  updateLecture(params: { id: string; lecture_id: string }, data: UpdateLectureRequest): Promise<FullTimetable>;
  createLecture(params: { id: string }, data: CreateLectureRequest): Promise<FullTimetable>;
  deleteLecture(params: { id: string; lecture_id: string }): Promise<FullTimetable>;
  addLecture(params: { id: string; lecture_id: string }): Promise<FullTimetable>;
}

type Deps = { repositories: [TimetableRepository] };
export const getTimetableService = ({ repositories: [timetableRepository] }: Deps): TimetableService => {
  return {
    getTimetables: () => timetableRepository.getTimetables(),
    getFullTimetable: (id) => timetableRepository.getFullTimetable({ id }),
    deleteTimetable: (id) => timetableRepository.deleteTimetable({ id }),
    renameTimetable: (id, title) => timetableRepository.updateTimetable({ id }, { title }),
    createTimetable: async ({ title, year, semester }) =>
      timetableRepository.createTimetable({ title, year, semester }),
    updateLecture: async (params, body) => timetableRepository.updateLecture(params, body),
    createLecture: async (params, body) => timetableRepository.createLecture(params, body),
    deleteLecture: async (params) => timetableRepository.deleteLecture(params),
    addLecture: async (params) => timetableRepository.addLecture(params),
  };
};
