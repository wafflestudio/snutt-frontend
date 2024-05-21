import { Int32, Double, Int64, DateTime } from './types';

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
  startMinute: Int32;
  endMinute: Int32;
  start_time: string;
  end_time: string;
  len: Double;
  start: Double;
  lectureBuildings: LectureBuilding[];
};

export type GeoCoordinate = {
  latitude: Double;
  longitude: Double;
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
  evLectureId: Int64;
  avgRating: Double;
};

export type SearchQueryLegacy = {
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  title?: string;
  classification?: string[];
  credit?: Int32[];
  course_number?: string[];
  academic_year?: string[];
  department?: string[];
  category?: string[];
  time_mask?: Int32[];
  times?: SearchTimeDto[];
  timesToExclude?: SearchTimeDto[];
  etc?: string[];
  page: Int32;
  offset: Int64;
  limit: Int32;
};

export type SearchTimeDto = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startMinute: Int32;
  endMinute: Int32;
};

export type LectureDto = {
  _id: string;
  academic_year?: string;
  category?: string;
  class_time_json: ClassPlaceAndTimeLegacyDto[];
  classification?: string;
  credit: Int64;
  department?: string;
  instructor: string;
  lecture_number: string;
  quota?: Int32;
  freshmanQuota?: Int32;
  remark?: string;
  semester: 1 | 2 | 3 | 4;
  year: Int32;
  course_number: string;
  course_title: string;
  registrationCount: Int32;
  wasFull: boolean;
  snuttEvLecture: SnuttEvLectureSummaryDto;
  class_time_mask: Int32[];
};

export type NotificationResponse = {
  _id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  deeplink?: string;
  created_at: DateTime;
};

export type NotificationCountResponse = {
  count: Int64;
};
