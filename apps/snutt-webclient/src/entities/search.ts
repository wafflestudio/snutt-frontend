import type { BaseLecture } from './lecture';
import type { Semester } from './semester';

type BitMask = number;

export type SearchFilter = {
  timeMask: BitMask[];
  title: string;
  year: number;
  semester: Semester;
  academicYear: string[];
  category: string[];
  categoryPre2025: string[];
  credit: number[];
  department: string[];
  classification: string[];
  etc: ('MO' | 'E')[];
  limit: number;
};

export interface SearchResultLecture extends BaseLecture {
  year: number;
  semester: Semester;
}
