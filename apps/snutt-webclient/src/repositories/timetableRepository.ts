import type { HttpClient } from '@/clients/HttpClient';
import type { Semester } from '@/entities/semester';
import type { CreateLectureRequest, FullTimetable, Timetable, UpdateLectureRequest } from '@/entities/timetable';

export interface TimetableRepository {
  getTimetables(): Promise<Timetable[]>;
  getFullTimetable(params: { id: string }): Promise<FullTimetable>;
  createTimetable(params: { title: string; year: number; semester: Semester }): Promise<Timetable[]>;
  deleteTimetable(params: { id: string }): Promise<Timetable[]>;
  updateLecture(params: { id: string; lecture_id: string }, data: UpdateLectureRequest): Promise<FullTimetable>;
  createLecture(params: { id: string }, data: CreateLectureRequest): Promise<FullTimetable>;
  deleteLecture(params: { id: string; lecture_id: string }): Promise<FullTimetable>;
  addLecture(params: { id: string; lecture_id: string }): Promise<FullTimetable>;
  updateTimetable(params: { id: string }, data: { title: string }): Promise<Timetable[]>;
}

export const getTimetableRepository = ({ httpClient }: { httpClient: HttpClient }): TimetableRepository => {
  return {
    getTimetables: async () => (await httpClient.get<Timetable[]>('/v1/tables')).data,
    getFullTimetable: async ({ id }) => (await httpClient.get<FullTimetable>(`/v1/tables/${id}`)).data,
    deleteTimetable: async ({ id }) => (await httpClient.delete<Timetable[]>(`/v1/tables/${id}`)).data,
    createTimetable: async ({ title, year, semester }) =>
      (await httpClient.post<Timetable[]>('/v1/tables', { title, year, semester })).data,
    updateLecture: async ({ id, lecture_id }, body) =>
      (await httpClient.put<FullTimetable>(`/v1/tables/${id}/lecture/${lecture_id}`, body)).data,
    createLecture: async ({ id }, body) =>
      (await httpClient.post<FullTimetable>(`/v1/tables/${id}/lecture`, body)).data,
    deleteLecture: async ({ id, lecture_id }) =>
      (await httpClient.delete<FullTimetable>(`/v1/tables/${id}/lecture/${lecture_id}`)).data,
    addLecture: async ({ id, lecture_id }) =>
      (await httpClient.post<FullTimetable>(`/v1/tables/${id}/lecture/${lecture_id}`, undefined)).data,
    updateTimetable: async ({ id }, body) => (await httpClient.put<Timetable[]>(`/v1/tables/${id}`, body)).data,
  };
};
