import { type SearchTimeDto } from '@sf/snutt-api/src/apis/snutt-timetable/schemas';

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
  times: SearchTimeDto[];
  timesToExclude: SearchTimeDto[];
  credit: number[];
  department: string[];
  classification: string[];
  etc: ('MO' | 'E')[];
  limit: number;
};

export interface SearchResultLecture extends Omit<BaseLecture, 'lecture_id' | 'quot'> {
  year: number;
  semester: Semester;
}
