import type { Color } from './color';
import type { Lecture } from './lecture';
import type { Day } from './time';

export interface Timetable {
  semester: 1 | 2 | 3 | 4;
  title: string;
  total_credit: number;
  updated_at: string;
  year: number;
  _id: string;
}

export interface FullTimetable {
  lecture_list: Lecture[];
  semester: 1 | 2 | 3 | 4;
  theme: number;
  title: string;
  updated_at: string;
  user_id: string;
  year: number;
  _id: string;
}

export type CreateLectureRequest = {
  course_title: string;
  instructor: string;
  class_time_json: (
    | { _id: string; day: Day; start_time: string; end_time: string; place: string }
    | { day: Day; start_time: string; end_time: string; place: string }
  )[];
  remark: string;
  credit: number;
} & ({ colorIndex: 0; color: Color } | { colorIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 });

export type UpdateLectureRequest = Partial<CreateLectureRequest>;
