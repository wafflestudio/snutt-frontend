import type { BaseLecture } from './lecture';
import type { Semester } from './semester';

type BitMask = number;

export type SearchFilter = {
  time_mask: BitMask[];
  title: string;
  year: number;
  semester: Semester;
  academic_year: string[];
  category: string[];
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
