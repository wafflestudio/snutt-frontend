import { getErrorMessage } from '@/entities/error';
import { type RepositoryResponse, type UsecaseResponse } from '@/entities/response';
import type { Semester } from '@/entities/semester';
import type { CreateLectureRequest, FullTimetable, Timetable, UpdateLectureRequest } from '@/entities/timetable';

export interface TimetableService {
  getTimetables(_: { token: string }): UsecaseResponse<Timetable[]>;
  getFullTimetable(_: { id: string; token: string }): UsecaseResponse<FullTimetable>;
  createTimetable(info: {
    title: string;
    year: number;
    semester: Semester;
    token: string;
  }): UsecaseResponse<Timetable[]>;
  renameTimetable(_: { id: string; title: string; token: string }): UsecaseResponse<Timetable[]>;
  deleteTimetable(_: { id: string; token: string }): UsecaseResponse<Timetable[]>;
  updateLecture(params: {
    id: string;
    lecture_id: string;
    token: string;
    data: UpdateLectureRequest;
  }): UsecaseResponse<FullTimetable>;
  createLecture(params: { id: string; token: string; data: CreateLectureRequest }): UsecaseResponse<FullTimetable>;
  deleteLecture(params: { id: string; lecture_id: string; token: string }): UsecaseResponse<FullTimetable>;
  addLecture(params: { id: string; lecture_id: string; token: string }): UsecaseResponse<FullTimetable>;
}

export const getTimetableService = ({
  timetableRepository,
}: {
  timetableRepository: {
    getTimetables(_: { token: string }): RepositoryResponse<Timetable[]>;
    getFullTimetable(params: { id: string; token: string }): RepositoryResponse<FullTimetable>;
    createTimetable(params: {
      title: string;
      year: number;
      semester: Semester;
      token: string;
    }): RepositoryResponse<Timetable[]>;
    deleteTimetable(params: { id: string; token: string }): RepositoryResponse<Timetable[]>;
    updateLecture(
      params: { id: string; lecture_id: string; token: string },
      data: UpdateLectureRequest,
    ): RepositoryResponse<FullTimetable>;
    createLecture(params: { id: string; token: string }, data: CreateLectureRequest): RepositoryResponse<FullTimetable>;
    deleteLecture(params: { id: string; lecture_id: string; token: string }): RepositoryResponse<FullTimetable>;
    addLecture(params: { id: string; lecture_id: string; token: string }): RepositoryResponse<FullTimetable>;
    updateTimetable(params: { id: string; token: string }, data: { title: string }): RepositoryResponse<Timetable[]>;
  };
}): TimetableService => {
  return {
    getTimetables: async ({ token }) => {
      const data = await timetableRepository.getTimetables({ token });
      if (data.type === 'success') return { type: 'success', data: data.data };
      return { type: 'error', message: getErrorMessage(data) };
    },
    getFullTimetable: async ({ id, token }) => {
      const data = await timetableRepository.getFullTimetable({ id, token });
      if (data.type === 'success') return { type: 'success', data: data.data };
      return { type: 'error', message: getErrorMessage(data) };
    },
    deleteTimetable: async ({ id, token }) => {
      const data = await timetableRepository.deleteTimetable({ id, token });
      if (data.type === 'success') return { type: 'success', data: data.data };
      return { type: 'error', message: getErrorMessage(data) };
    },
    renameTimetable: async ({ id, title, token }) => {
      const data = await timetableRepository.updateTimetable({ id, token }, { title });
      if (data.type === 'success') return { type: 'success', data: data.data };
      return { type: 'error', message: getErrorMessage(data) };
    },
    createTimetable: async ({ title, year, semester, token }) => {
      const data = await timetableRepository.createTimetable({ title, year, semester, token });
      if (data.type === 'success') return { type: 'success', data: data.data };
      return { type: 'error', message: getErrorMessage(data) };
    },
    updateLecture: async ({ id, lecture_id, token, data }) => {
      const res = await timetableRepository.updateLecture({ id, lecture_id, token }, data);
      if (res.type === 'success') return { type: 'success', data: res.data };
      return { type: 'error', message: getErrorMessage(res) };
    },
    createLecture: async ({ data, id, token }) => {
      const res = await timetableRepository.createLecture({ id, token }, data);
      if (res.type === 'success') return { type: 'success', data: res.data };
      return { type: 'error', message: getErrorMessage(res) };
    },
    deleteLecture: async (params) => {
      const res = await timetableRepository.deleteLecture(params);
      if (res.type === 'success') return { type: 'success', data: res.data };
      return { type: 'error', message: getErrorMessage(res) };
    },
    addLecture: async (params) => {
      const res = await timetableRepository.addLecture(params);
      if (res.type === 'success') return { type: 'success', data: res.data };
      return { type: 'error', message: getErrorMessage(res) };
    },
  };
};
