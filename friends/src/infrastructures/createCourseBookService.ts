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
    composeSemester: (semester) => ({ 1: '1학기', 2: '여름학기', 3: '2학기', 4: '겨울학기' }[semester]),
  };
};
