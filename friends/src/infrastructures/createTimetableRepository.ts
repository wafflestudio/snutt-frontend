import { ApiClient } from '../clients/apiClient';
import { Timetable } from '../entities/timetable';
import { TimetableRepository } from '../repositories/timetableRepository';

export const createTimetableRepository = (
  apiClient: ApiClient,
): TimetableRepository => {
  return { listTimetables: () => apiClient.get<Timetable[]>('/v1/tables') };
};
