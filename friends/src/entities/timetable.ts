export type BasicTimetable = {
  _id: string;
  year: number;
  semester: 1 | 2 | 3 | 4;
  title: string;
  updated_at: string;
  total_credit: number;
};

export type FullTimetable = {
  _id: string;
  user_id: string;
  year: number;
  semester: 1 | 2 | 3 | 4;
  title: string;
  lecture_list: ({
    _id: string;
    classification: string;
    department: string;
    academic_year: string;
    course_title: string;
    credit: number;
    class_time: string;
    real_class_time: string;
    class_time_json: {
      _id: string;
      day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      place: string;
      startMinute: number;
      endMinute: number;
    }[];
    class_time_mask: [number, number, number, number, number, number, number];
    instructor: string;
    quota: number;
    remark: string;
    category: string;
    course_number: string;
    lecture_number: string;
    lecture_id: string;
  } & (
    | { color: Record<'bg' | 'fg', never>; colorIndex: 0 }
    | { color: Record<'bg' | 'fg', string>; colorIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
  ))[];
  theme: 0;
  updated_at: string;
};
