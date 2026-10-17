import { infiniteQueryOptions, keepPreviousData } from '@tanstack/react-query';
import type { Semester } from '@/domain/semester';
import type { DayTimeRange } from '@/domain/time';
import { callApi } from './client';
import { toLecture } from './mappers/timetable';

/** 한 번에 받는 검색 결과 수 */
const SEARCH_PAGE_SIZE = 30;

/** 조건이 없으면 null 로 보낸다 (빈 배열이어도 서버가 조건으로 보는지 확인하지 않았다) */
const toTimeCondition = (ranges: readonly DayTimeRange[]) =>
  ranges.length > 0 ? ranges.map(({ day, startMinute, endMinute }) => ({ day, startMinute, endMinute })) : null;

export const lectureQueries = {
  all: () => ['lectures'] as const,
  /**
   * 수강편람 검색. 강의명 · 교수명으로 찾고, 검색어가 비어 있으면 학기의 모든 강의를 준다.
   * 서버는 전체 개수를 주지 않고 커서로 다음 쪽을 준다 (dev 서버에서 확인)
   *
   * 시간 조건 (시간대 검색, dev 서버에서 확인): times 는 수업 시간마다 그것을 통째로 품는 구간이 있는 강의만,
   * excludedTimes 는 어느 수업 시간도 겹치지 않는 강의만 준다. 구간은 domain 과 같이 끝 시각을 포함하지 않는 것으로 다룬다
   * (10:00~11:00 을 빼도 11:00 에 시작하는 강의는 남는다). 이어진 두 구간에 걸친 강의는 찾지 않으므로 이어진 칸은 합쳐서 보낸다.
   */
  search: ({
    semester,
    query,
    times = [],
    excludedTimes = [],
  }: {
    semester: Semester;
    query: string;
    times?: readonly DayTimeRange[];
    excludedTimes?: readonly DayTimeRange[];
  }) =>
    infiniteQueryOptions({
      queryKey: [...lectureQueries.all(), 'search', semester.year, semester.term, query, times, excludedTimes],
      queryFn: async ({ pageParam }) => {
        const page = await callApi('POST /v2/lectures/search', {
          body: {
            year: semester.year,
            semester: semester.term,
            query: query || null,
            times: toTimeCondition(times),
            timesToExclude: toTimeCondition(excludedTimes),
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
