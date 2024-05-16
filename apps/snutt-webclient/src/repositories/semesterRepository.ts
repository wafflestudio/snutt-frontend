import type { HttpClient } from '@/clients/HttpClient';
import type { CourseBook } from '@/entities/semester';

export interface SemesterRepository {
  getCourseBooks(): Promise<CourseBook[]>;
}

export const getSemesterRepository = ({ httpClient }: { httpClient: HttpClient }): SemesterRepository => {
  return {
    getCourseBooks: async () => (await httpClient.get<CourseBook[]>(`/v1/course_books`)).data,
  };
};
