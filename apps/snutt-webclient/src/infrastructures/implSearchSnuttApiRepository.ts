import { type SnuttApi } from '@sf/snutt-api';

import { type getSearchService } from '@/usecases/searchService';

export const implSearchSnuttApiRepository = ({
  snuttApi,
}: {
  snuttApi: SnuttApi;
}): Parameters<typeof getSearchService>[0]['searchRepository'] => {
  return {
    getTags: async ({ token, year, semester }) => {
      const { status, data } = await snuttApi['GET /v1/tags/:year/:semester']({ token, params: { year, semester } });
      if (status === 200)
        return {
          type: 'success',
          data: {
            academicYear: data.academic_year,
            category: data.category,
            classification: data.classification,
            credit: data.credit,
            department: data.department,
            instructor: data.instructor,
            updated_at: data.updated_at,
          },
        };
      else return { type: 'error', errcode: data.errcode };
    },
    search: async ({ token, filter }) => {
      const { status, data } = await snuttApi['POST /v1/search_query']({
        token,
        body: {
          academic_year: filter.academicYear,
          category: filter.category,
          classification: filter.classification,
          credit: filter.credit,
          department: filter.department,
          etc: filter.etc,
          limit: filter.limit,
          semester: filter.semester,
          time_mask: filter.timeMask,
          title: filter.title,
          year: filter.year,
          page: filter.page,
          offset: filter.offset,
        },
      });
      if (status === 200) return { type: 'success', data };
      else return { type: 'error', errcode: data.errcode };
    },
  };
};
