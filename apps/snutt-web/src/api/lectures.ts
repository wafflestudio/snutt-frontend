import { infiniteQueryOptions, keepPreviousData } from '@tanstack/react-query';
import type { Semester } from '@/domain/semester';
import { callApi } from './client';
import { toLecture } from './mappers/timetable';

/** 한 번에 받는 검색 결과 수 */
const SEARCH_PAGE_SIZE = 30;

export const lectureQueries = {
  all: () => ['lectures'] as const,
  /**
   * 수강편람 검색. 강의명 · 교수명으로 찾고, 검색어가 비어 있으면 학기의 모든 강의를 준다.
   * 서버는 전체 개수를 주지 않고 커서로 다음 쪽을 준다 (dev 서버에서 확인)
   */
  search: ({ semester, query }: { semester: Semester; query: string }) =>
    infiniteQueryOptions({
      queryKey: [...lectureQueries.all(), 'search', semester.year, semester.term, query],
      queryFn: async ({ pageParam }) => {
        const page = await callApi('POST /v2/lectures/search', {
          body: {
            year: semester.year,
            semester: semester.term,
            query: query || null,
            cursor: pageParam,
            limit: SEARCH_PAGE_SIZE,
            sort: 'DEFAULT',
          },
        });
        return { lectures: page.content.map(toLecture), next: page.last ? null : (page.cursor ?? null) };
      },
      initialPageParam: null as string | null,
      getNextPageParam: (page) => page.next,
      // 검색어를 바꾸는 동안 이전 결과를 그대로 보여 준다 (목록이 비었다 찼다 하지 않게)
      placeholderData: keepPreviousData,
      // 수강편람은 학기 중에 거의 바뀌지 않는다
      staleTime: 5 * 60 * 1000,
    }),
};
