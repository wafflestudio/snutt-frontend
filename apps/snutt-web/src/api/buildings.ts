import { queryOptions } from '@tanstack/react-query';
import { callApi } from './client';
import { toBuilding } from './mappers/building';

export const buildingQueries = {
  all: () => ['buildings'] as const,
  /** 강의 장소들(`getLecturePlaces`)의 건물. 장소가 없으면 부르지 않는다 */
  byPlaces: (places: readonly string[]) =>
    queryOptions({
      queryKey: [...buildingQueries.all(), places],
      queryFn: async () => (await callApi('GET /v2/buildings', { query: { places: places.join(',') } })).map(toBuilding),
      enabled: places.length > 0,
      // 건물 위치는 거의 바뀌지 않는다
      staleTime: Infinity,
    }),
};
