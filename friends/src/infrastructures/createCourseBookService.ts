import { Semester } from '../entities/semester';
import { Year } from '../entities/year';
import { CourseBookService } from '../usecases/courseBookService';

export const createCourseBookService = (): CourseBookService => {
  return {
    toValue: (cb) => `${cb.year}-${cb.semester}` as ReturnType<CourseBookService['toValue']>,
    fromValue: (v) => {
      const [year, semester] = v.split('-').map(Number) as [Year, Semester];
      return { year, semester };
    },
    toLabel: ({ year, semester }) => `${year}년 ${{ 1: '1', 2: '여름', 3: '2', 4: '겨울' }[semester]}학기`,
  };
};
