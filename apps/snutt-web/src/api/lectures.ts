import { infiniteQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';
import { EMPTY_SEARCH_FILTER, type SearchConditions, toSearchConditions } from '@/domain/search-filter';
import type { Semester } from '@/domain/semester';
import { callApi } from './client';
import { toSearchConditionsRequest, toSearchTags } from './mappers/search';
import { toLecture } from './mappers/timetable';

/** 한 번에 받는 검색 결과 수 */
const SEARCH_PAGE_SIZE = 30;

const NO_CONDITIONS = toSearchConditions(EMPTY_SEARCH_FILTER, []);

export const lectureQueries = {
  all: () => ['lectures'] as const,
  /**
   * 수강편람 검색. 강의명 · 교수명으로 찾고, 검색어가 비어 있으면 학기의 모든 강의를 준다.
   * 서버는 전체 개수를 주지 않고 커서로 다음 쪽을 준다 (dev 서버에서 확인)
   *
   * 시간 조건 (시간대 검색, dev 서버에서 확인): times 는 수업 시간마다 그것을 통째로 품는 구간이 있는 강의만,
   * excludedTimes 는 어느 수업 시간도 겹치지 않는 강의만 준다. 구간은 domain 과 같이 끝 시각을 포함하지 않는 것으로 다룬다
   * (10:00~11:00 을 빼도 11:00 에 시작하는 강의는 남는다). 이어진 두 구간에 걸친 강의는 찾지 않으므로 이어진 칸은 합쳐서 보낸다.
   *
   * 필터(conditions)는 같은 종류 안에서는 하나라도 맞으면, 종류끼리는 모두 맞아야 결과에 들어간다.
   */
  search: ({
    semester,
    query,
    conditions = NO_CONDITIONS,
  }: {
    semester: Semester;
    query: string;
    /** toSearchConditions 로 만든다 (값이 정렬되어 있어 query key 가 안정적이다) */
    conditions?: SearchConditions;
  }) =>
    infiniteQueryOptions({
      queryKey: [...lectureQueries.all(), 'search', semester.year, semester.term, query, conditions],
      queryFn: async ({ pageParam }) => {
        const page = await callApi('POST /v2/lectures/search', {
          body: {
            year: semester.year,
            semester: semester.term,
            query: query || null,
            ...toSearchConditionsRequest(conditions),
            cursor: pageParam,
            limit: SEARCH_PAGE_SIZE,
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
  /** 학기의 필터 값 (분류, 학과, 학년, 학점, 교양영역). 로그인해야 받을 수 있다 */
  tags: (semester: Semester) =>
    queryOptions({
      queryKey: [...lectureQueries.all(), 'tags', semester.year, semester.term],
      queryFn: async () =>
        toSearchTags(
          await callApi('GET /v2/tags/:year/:semester', {
            params: { year: String(semester.year), semester: String(semester.term) },
          }),
        ),
      staleTime: 60 * 60 * 1000,
    }),
};
