import { Int32, Double, Int64, DateTime } from './types';

export type LocalLoginRequest = { id: string; password: string };

export type LoginResponse = { user_id: string; token: string; message: string };

export type LogoutRequest = { registration_id: string };

export type OkResponse = { message: string };

export type LocalRegisterRequest = { id: string; password: string; email?: string };

export type FriendRequestLinkResponse = { requestToken: string };

export type UserLegacyDto = {
  isAdmin: boolean;
  regDate: DateTime;
  notificationCheckedAt: DateTime;
  email?: string;
  local_id?: string;
  fb_name?: string;
};

export type NicknameDto = { nickname: string; tag: string };

export type UserDto = {
  id: string;
  isAdmin: boolean;
  regDate: DateTime;
  notificationCheckedAt: DateTime;
  email?: string;
  localId?: string;
  fbName?: string;
  nickname: NicknameDto;
};

export type UserPatchRequest = { nickname?: string };

export type TimetableBriefDto = {
  _id: string;
  year: Int32;
  semester: Int32;
  title: string;
  isPrimary: boolean;
  updated_at: DateTime;
  total_credit: Int64;
};

export type TimetableAddRequestDto = { year: Int32; semester: 1 | 2 | 3 | 4; title: string };

export type ClassPlaceAndTimeLegacyDto = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  place?: string;
  startMinute: Int32;
  endMinute: Int32;
  start_time: string;
  end_time: string;
  len: Double;
  start: Double;
  lectureBuildings?: LectureBuilding[];
};

export type ColorSet = { bg: string; fg: string } | Record<string, never>;

export type GeoCoordinate = { latitude: Double; longitude: Double };

export type LectureBuilding = {
  id?: string;
  buildingNumber: string;
  buildingNameKor: string;
  buildingNameEng: string;
  locationInDMS?: GeoCoordinate;
  locationInDecimal?: GeoCoordinate;
  campus: 'GWANAK' | 'YEONGEON' | 'PYEONGCHANG';
};

export type SnuttEvLectureSummaryDto = { snuttId?: string; evLectureId: Int64; avgRating?: Double };

export type TimetableLectureLegacyDto = {
  _id: string;
  academic_year?: string;
  category?: string;
  class_time_json: ClassPlaceAndTimeLegacyDto[];
  classification?: string;
  credit?: Int64;
  department?: string;
  instructor?: string;
  lecture_number?: string;
  quota?: Int32;
  freshman_quota?: Int32;
  remark?: string;
  course_number?: string;
  course_title: string;
  color: ColorSet;
  colorIndex: Int32;
  lecture_id?: string;
  snuttEvLecture?: SnuttEvLectureSummaryDto;
  class_time_mask: Int32[];
};

export type TimetableLegacyDto = {
  _id: string;
  user_id: string;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  lecture_list: TimetableLectureLegacyDto[];
  title: string;
  theme: 0 | 1 | 2 | 3 | 4 | 5;
  themeId?: string;
  isPrimary: boolean;
  updated_at: DateTime;
};

export type TimetableModifyRequestDto = { title: string };

export type ClassPlaceAndTimeLegacyRequestDto = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  place?: string;
  startMinute?: Int32;
  endMinute?: Int32;
  start_time?: string;
  end_time?: string;
  len?: Double;
  start?: Double;
};

export type CustomTimetableLectureAddLegacyRequestDto = {
  course_title: string;
  instructor?: string;
  credit?: Int64;
  class_time_json: ClassPlaceAndTimeLegacyRequestDto[];
  remark?: string;
  color?: ColorSet;
  colorIndex?: Int32;
  is_forced: boolean;
};

export type TimetableLectureModifyLegacyRequestDto = {
  course_title?: string;
  academic_year?: string;
  category?: string;
  classification?: string;
  instructor?: string;
  credit?: Int64;
  class_time_json?: ClassPlaceAndTimeLegacyRequestDto[];
  remark?: string;
  color?: ColorSet;
  colorIndex?: Int32;
  is_forced: boolean;
};

export type Unit = Record<string, never>;

export type TimetableModifyThemeRequestDto = { theme?: 0 | 1 | 2 | 3 | 4 | 5; themeId?: string };

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

export type SearchTimeDto = { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; startMinute: Int32; endMinute: Int32 };

export type LectureDto = {
  _id: string;
  academic_year?: string;
  category?: string;
  class_time_json: ClassPlaceAndTimeLegacyDto[];
  classification?: string;
  credit: Int64;
  department?: string;
  instructor?: string;
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
  snuttEvLecture?: SnuttEvLectureSummaryDto;
  class_time_mask: Int32[];
};

export type BuildingsResponse = { content: LectureBuilding[]; totalCount: Int32; nextPageToken?: string };

export type BookmarkLectureDto = {
  _id?: string;
  academic_year?: string;
  category?: string;
  class_time_json: ClassPlaceAndTimeLegacyDto[];
  classification?: string;
  credit: Int64;
  department?: string;
  instructor?: string;
  lecture_number: string;
  quota?: Int32;
  freshmanQuota?: Int32;
  remark?: string;
  course_number: string;
  course_title: string;
  class_time_mask: Int32[];
};

export type BookmarkResponse = { year: Int32; semester: Int32; lectures: BookmarkLectureDto[] };

export type BookmarkLectureModifyRequest = { lecture_id: string };

export type ExistenceResponse = { exists: boolean };

export type NotificationResponse = {
  _id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  deeplink?: string;
  created_at: DateTime;
};

export type NotificationCountResponse = { count: Int64 };

export type ConfigResponse = {
  id: string;
  data: JsonNode;
  minVersion?: ConfigVersionDto;
  maxVersion?: ConfigVersionDto;
};

export type ConfigVersionDto = { ios: string; android: string };

export type JsonNode = Record<string, never>;

export type PostConfigRequest = { data: JsonNode; minVersion?: ConfigVersionDto; maxVersion?: ConfigVersionDto };

export type PatchConfigRequest = { data?: JsonNode; minVersion?: ConfigVersionDto; maxVersion?: ConfigVersionDto };

export type FileUploadUriDto = { uploadUri: string; fileOriginUri: string; fileUri: string };

export type InsertNotificationRequest = {
  userId?: string;
  title: string;
  body: string;
  insertFcm: boolean;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  dataPayload: Record<string, string>;
};

export type PostPopupRequest = { key: string; imageOriginUri: string; hiddenDays?: Int32 };

export type PopupResponse = {
  id: string;
  key: string;
  imageUri: string;
  image_url: string;
  hiddenDays?: Int32;
  hidden_days?: Int32;
};

export type VacancyNotificationLecturesResponse = { lectures: LectureDto[] };

export type PopupsResponse = { content: PopupResponse[]; totalCount: Int32; nextPageToken?: string };

export type FriendResponse = {
  id: string;
  userId: string;
  displayName?: string;
  nickname: NicknameDto;
  createdAt: DateTime;
};

export type FriendsResponse = { content: FriendResponse[]; totalCount: Int32; nextPageToken?: string };

export type FriendRequest = { nickname: string };

export type CoursebookDto = { year: Int32; semester: 1 | 2 | 3 | 4 };

export type ClassPlaceAndTimeDto = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  place?: string;
  startMinute: Int32;
  endMinute: Int32;
};

export type TimetableDto = {
  id?: string;
  userId: string;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  lectures: TimetableLectureDto[];
  title: string;
  theme: 0 | 1 | 2 | 3 | 4 | 5;
  themeId?: string;
  isPrimary: boolean;
  updatedAt: DateTime;
};

export type TimetableLectureDto = {
  id?: string;
  academicYear?: string;
  category?: string;
  classPlaceAndTimes: ClassPlaceAndTimeDto[];
  classification?: string;
  credit?: Int64;
  department?: string;
  instructor?: string;
  lectureNumber?: string;
  quota?: Int32;
  freshmanQuota?: Int32;
  remark?: string;
  courseNumber?: string;
  courseTitle: string;
  color?: ColorSet;
  colorIndex: Int32;
  lectureId?: string;
  snuttEvLecture?: SnuttEvLectureSummaryDto;
};

export type UpdateFriendDisplayNameRequest = { displayName: string };

export type TimetableThemeDto = {
  id?: string;
  theme: 0 | 1 | 2 | 3 | 4 | 5;
  name: string;
  colors?: ColorSet[];
  isDefault: boolean;
  isCustom: boolean;
};

export type TimetableThemeAddRequestDto = { name: string; colors: ColorSet[] };
