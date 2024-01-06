import { Brand } from '@/utils/brand';

export type Lecture = {
  id: Brand<number, 'LectureId'>;
  title: string;
  instructor: string;
  department: string;
  courseNumber: string;
  credit: number;
  academicYear: number;
  category: string;
  classification: string;
  takenYear: number;
  takenSemester: number;
};
