import { type CourseBook } from '@/entities/semester';
import { type SemesterRepository } from '@/repositories/semesterRepository';

type CourseBookValue = `${number}-${1 | 2 | 3 | 4}`;
type BaseCourseBook = Omit<CourseBook, 'updated_at'>;

export interface SemesterService {
  getCourseBooks(): Promise<CourseBook[]>;
  courseBookToLabel(cb: BaseCourseBook): string;
  courseBookToValue(cb: BaseCourseBook): CourseBookValue;
  valueToCourseBook(value: CourseBookValue): BaseCourseBook;
}

type Deps = { repositories: [SemesterRepository] };
export const getSemesterService = ({ repositories: [semesterRepository] }: Deps): SemesterService => {
  return {
    getCourseBooks: () => semesterRepository.getCourseBooks(),
    courseBookToLabel: ({ year, semester }) =>
      `${year}년 ${[, 1, '여름', 2, '겨울'][semester] as 1 | 'S' | 2 | 'W'}학기`,
    courseBookToValue: ({ year, semester }) => `${year}-${semester}`,
    valueToCourseBook: (value) => ({
      year: Number(value.split('-')[0]),
      semester: Number(value.split('-')[1]) as 1 | 2 | 3 | 4,
    }),
  };
};
