import { type SearchFilter, type SearchResultLecture } from '@/entities/search';
import { type CourseBook } from '@/entities/semester';
import { type SearchRepository } from '@/repositories/searchRepository';

export interface SearchService {
  getTags(params: Omit<CourseBook, 'updated_at'>): Promise<{
    academic_year: string[];
    category: string[];
    classification: string[];
    credit: string[];
    department: string[];
    instructor: string[];
    updated_at: number;
  }>;
  search(params: Partial<SearchFilter>): Promise<SearchResultLecture[]>;
}

type Deps = { repositories: [SearchRepository] };
export const getSearchService = ({ repositories: [searchRepository] }: Deps): SearchService => {
  return {
    getTags: (yearSemester) => searchRepository.getTags(yearSemester),
    search: (params) => searchRepository.search(params),
  };
};
