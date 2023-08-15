import { CourseBook } from '../entities/courseBook';
import { Semester } from '../entities/semester';

type CourseBookValue = string & { __brand: 'CourseBook' };

export type CourseBookService = {
  toValue: (cb: CourseBook) => CourseBookValue;
  fromValue: (value: CourseBookValue) => CourseBook;
  composeSemester: (semester: Semester) => string;
};
