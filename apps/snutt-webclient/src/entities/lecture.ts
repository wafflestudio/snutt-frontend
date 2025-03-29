import {
  type ClassPlaceAndTimeDto,
  type ClassPlaceAndTimeLegacyDto,
} from '@sf/snutt-api/src/apis/snutt-timetable/schemas';

import type { Color } from './color';
import type { Day } from './time';

export interface BaseLecture {
  _id: string;
  classification?: string;
  department?: string;
  academic_year?: string;
  course_title: string;
  credit?: number;
  classPlaceAndTimes?: ClassPlaceAndTimeDto[];
  class_time_json: ClassPlaceAndTimeLegacyDto[];
  instructor?: string;
  quota?: number;
  remark?: string;
  category?: string;
  course_number?: string;
  lecture_id?: string;
  lecture_number?: string;
}

export interface Lecture extends BaseLecture {
  color: Color | Record<string, never>;
  colorIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

export type ClassTime = { day: Day; place?: string; start_time: string; end_time: string };
