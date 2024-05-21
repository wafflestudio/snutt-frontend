import { type RepositoryResponse } from '@/entities/response';
import { type CourseBook } from '@/entities/semester';

type CourseBookValue = `${number}-${1 | 2 | 3 | 4}`;
type BaseCourseBook = Omit<CourseBook, 'updatedAt'>;

export interface SemesterService {
  getCourseBooks(_: { token: string }): Promise<CourseBook[]>;
  courseBookToLabel(cb: BaseCourseBook): string;
  courseBookToValue(cb: BaseCourseBook): CourseBookValue;
  valueToCourseBook(value: CourseBookValue): BaseCourseBook;
}

export const getSemesterService = ({
  semesterRepository,
}: {
  semesterRepository: {
    getCourseBooks(_: { token: string }): RepositoryResponse<CourseBook[]>;
  };
}): SemesterService => {
  return {
    getCourseBooks: async ({ token }) => {
      const data = await semesterRepository.getCourseBooks({ token });
      if (data.type === 'error') throw new Error();
      return data.data;
    },
    courseBookToLabel: ({ year, semester }) =>
      `${year}년 ${[, 1, '여름', 2, '겨울'][semester] as 1 | 'S' | 2 | 'W'}학기`,
    courseBookToValue: ({ year, semester }) => `${year}-${semester}`,
    valueToCourseBook: (value) => ({
      year: Number(value.split('-')[0]),
      semester: Number(value.split('-')[1]) as 1 | 2 | 3 | 4,
    }),
  };
};
