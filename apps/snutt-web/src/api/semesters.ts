import { queryOptions } from '@tanstack/react-query';
import { compareSemester } from '@/domain/semester';
import { callApi } from './client';
import { toSemester } from './mappers/timetable';

export const semesterQueries = {
  all: () => ['semesters'] as const,
  /** 수강편람이 있는 학기 (학기 선택 목록). 최근 학기가 앞에 온다. 시간표도 이 학기들에만 만들 수 있다 */
  coursebooks: () =>
    queryOptions({
      queryKey: [...semesterQueries.all(), 'coursebooks'],
      queryFn: async () => (await callApi('GET /v2/coursebooks')).map(toSemester).sort((a, b) => compareSemester(b, a)),
      // 학기 중에 바뀌지 않는다
      staleTime: Infinity,
    }),
};
