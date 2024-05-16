import type { Color } from './color';
import type { Day } from './time';

export interface BaseLecture {
  _id: string;
  classification?: string;
  department?: string;
  academic_year?: string;
  course_title: string;
  credit: number;
  class_time?: string;
  real_class_time: string;
  class_time_json: ClassTime[];
  class_time_mask: number[];
  instructor: string;
  quota: number;
  remark: string;
  category?: string;
  course_number?: string;
  lecture_id?: string;
  lecture_number?: string;
}

export interface Lecture extends BaseLecture {
  created_at: string;
  updated_at: string;
  color: Color | Record<string, never>;
  colorIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

export type ClassTime = { day: Day; place: string; start_time: string; end_time: string };
