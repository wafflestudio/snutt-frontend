import { queryOptions } from '@tanstack/react-query';
import type { TimetableId } from '@/domain/timetable';
import { callApi } from './client';
import { toTimetable, toTimetableSummary } from './mappers/timetable';

export const timetableQueries = {
  all: () => ['timetables'] as const,
  /** 내 시간표 전체 (모든 학기) */
  list: () =>
    queryOptions({
      queryKey: [...timetableQueries.all(), 'list'],
      queryFn: async () => (await callApi('GET /v2/timetables')).map(toTimetableSummary),
    }),
  detail: (id: TimetableId) =>
    queryOptions({
      queryKey: [...timetableQueries.all(), 'detail', id],
      queryFn: async () =>
        toTimetable(await callApi('GET /v2/timetables/:timetableId', { params: { timetableId: id } })),
    }),
  /** 처음 열 시간표: 가장 최근 학기의 기본 시간표 */
  recent: () =>
    queryOptions({
      queryKey: [...timetableQueries.all(), 'recent'],
      queryFn: async () => toTimetable(await callApi('GET /v2/timetables/recent')),
    }),
};
