import { IntegerInt32, IntegerInt64, NumberDouble, StringDateTime } from './types';

export type LocalLoginRequest = {
  id: string;
  password: string;
};

export type LoginResponse = {
  user_id: string;
  token: string;
  message: string;
};

export type OkResponse = {
  message: string;
};

export type ClassPlaceAndTimeLegacyDto = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  place?: string;
  startMinute: IntegerInt32;
  endMinute: IntegerInt32;
  start_time: string;
  end_time: string;
  len: NumberDouble;
  start: NumberDouble;
  lectureBuildings: LectureBuilding[];
};

export type GeoCoordinate = {
  latitude: NumberDouble;
  longitude: NumberDouble;
};

export type LectureBuilding = {
  id: string;
  buildingNumber: string;
  buildingNameKor: string;
  buildingNameEng: string;
  locationInDMS?: GeoCoordinate;
  locationInDecimal?: GeoCoordinate;
  campus: 'GWANAK' | 'YEONGEON' | 'PYEONGCHANG';
};

export type SnuttEvLectureSummaryDto = {
  snuttId?: string;
  evLectureId: IntegerInt64;
  avgRating: NumberDouble;
};

export type SearchQueryLegacy = {
  year: IntegerInt32;
  semester: 1 | 2 | 3 | 4;
  title?: string;
  classification?: string[];
  credit?: IntegerInt32[];
  course_number?: string[];
  academic_year?: string[];
  department?: string[];
  category?: string[];
  time_mask?: IntegerInt32[];
  times?: SearchTimeDto[];
  timesToExclude?: SearchTimeDto[];
  etc?: string[];
  page: IntegerInt32;
  offset: IntegerInt64;
  limit: IntegerInt32;
};

export type SearchTimeDto = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startMinute: IntegerInt32;
  endMinute: IntegerInt32;
};

export type LectureDto = {
  _id: string;
  academic_year?: string;
  category?: string;
  class_time_json: ClassPlaceAndTimeLegacyDto[];
  classification?: string;
  credit: IntegerInt64;
  department?: string;
  instructor: string;
  lecture_number: string;
  quota?: IntegerInt32;
  freshmanQuota?: IntegerInt32;
  remark?: string;
  semester: 1 | 2 | 3 | 4;
  year: IntegerInt32;
  course_number: string;
  course_title: string;
  registrationCount: IntegerInt32;
  wasFull: boolean;
  snuttEvLecture: SnuttEvLectureSummaryDto;
  class_time_mask: IntegerInt32[];
};

export type NotificationResponse = {
  _id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  deeplink?: string;
  created_at: StringDateTime;
};

export type NotificationCountResponse = {
  count: IntegerInt64;
};
