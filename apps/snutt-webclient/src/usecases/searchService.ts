import { type RepositoryResponse, type UsecaseResponse } from '@/entities/response';
import { type SearchFilter, type SearchResultLecture } from '@/entities/search';

type Filter = Partial<SearchFilter> & Pick<SearchFilter, 'year' | 'semester' | 'limit'>;

export interface SearchService {
  getTags(_: {
    year: number;
    semester: number;
    token: string;
  }): UsecaseResponse<
    Record<
      'academicYear' | 'category' | 'categoryPre2025' | 'classification' | 'credit' | 'department' | 'instructor',
      string[]
    >
  >;
  search(_: { token: string; params: Filter }): UsecaseResponse<SearchResultLecture[]>;
}

export const getSearchService = ({
  searchRepository,
}: {
  searchRepository: {
    getTags(_: {
      token: string;
      year: number;
      semester: number;
    }): RepositoryResponse<
      Record<
        'academicYear' | 'category' | 'categoryPre2025' | 'classification' | 'credit' | 'department' | 'instructor',
        string[]
      >
    >;
    search(_: {
      token: string;
      filter: Filter & { page: number; offset: number };
    }): RepositoryResponse<SearchResultLecture[]>;
  };
}): SearchService => {
  return {
    getTags: async (yearSemester) => {
      const data = await searchRepository.getTags(yearSemester);
      if (data.type === 'error') throw data;
      return { type: 'success', data: data.data };
    },
    search: async ({ token, params }) => {
      const data = await searchRepository.search({ token, filter: { ...params, page: 1, offset: 0 } });
      if (data.type === 'error') throw data;
      return { type: 'success', data: data.data };
    },
  };
};
