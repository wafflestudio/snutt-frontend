import { CourseBook } from '../entities/courseBook';

type CourseBookValue = string & { __brand: 'CourseBook' };

export type CourseBookService = {
  toValue: (cb: CourseBook) => CourseBookValue;
  fromValue: (value: CourseBookValue) => CourseBook;
  toLabel: (cb: CourseBook) => string;
};
