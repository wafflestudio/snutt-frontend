import { ApiClient } from '../clients/apiClient';
import { BasicTimetable, FullTimetable } from '../entities/timetable';
import { TimetableRepository } from '../repositories/timetableRepository';

export const createTimetableRepository = (apiClient: ApiClient): TimetableRepository => {
  return {
    listTimetables: () => apiClient.get<BasicTimetable[]>('/v1/tables'),
    getTimetable: (id) => apiClient.get<FullTimetable>(`/v1/tables/${id}`),
  };
};
