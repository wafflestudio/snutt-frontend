import { queryOptions } from '@tanstack/react-query';
import { callApi } from './client';
import { toTheme } from './mappers/timetable';

export const themeQueries = {
  all: () => ['themes'] as const,
  /** 내가 쓸 수 있는 테마 (기본 제공 + 직접 만든 것 + 내려받은 것). 시간표의 themeId 로 팔레트를 찾는다 */
  list: () =>
    queryOptions({
      queryKey: [...themeQueries.all(), 'list'],
      queryFn: async () => (await callApi('GET /v2/themes')).map(toTheme),
    }),
};
