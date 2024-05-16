import type { HttpClient } from '@/clients/HttpClient';
import type { SearchFilter, SearchResultLecture } from '@/entities/search';
import type { CourseBook } from '@/entities/semester';

type Tags = {
  academic_year: string[];
  category: string[];
  classification: string[];
  credit: string[];
  department: string[];
  instructor: string[];
  updated_at: number;
};
export interface SearchRepository {
  getTags(params: Omit<CourseBook, 'updated_at'>): Promise<Tags>;
  search(params: Partial<SearchFilter>): Promise<SearchResultLecture[]>;
}

export const getSearchRepository = ({ httpClient }: { httpClient: HttpClient }): SearchRepository => {
  return {
    getTags: async ({ year, semester }) => (await httpClient.get<Tags>(`/v1/tags/${year}/${semester}`)).data,
    search: async (params) => (await httpClient.post<SearchResultLecture[]>(`/v1/search_query`, params)).data,
  };
};
