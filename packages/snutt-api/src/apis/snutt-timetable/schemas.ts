import { Double, DateTime, Integer } from './types';

export type SendEmailRequest = { email: string };

export type OkResponse = { message: string };

export type SocialLoginRequest = { token: string };

export type LoginResponse = { user_id: string; token: string; message: string };

export type FacebookLoginRequest = { fb_id?: string; fb_token: string };

export type LocalLoginRequest = { id: string; password: string };

export type LogoutRequest = { registration_id: string };

export type PasswordResetRequest = { user_id: string; password: string; code: string };

export type GetMaskedEmailRequest = { user_id: string };

export type EmailResponse = { email: string };

export type VerificationCodeRequest = { user_id?: string; code: string };

export type LocalRegisterRequest = { id: string; password: string; email?: string };

export type TokenResponse = { token: string };

export type EmailVerificationResultDto = { is_email_verified: boolean };

export type UserLegacyDto = {
  isAdmin: boolean;
  regDate: DateTime;
  notificationCheckedAt: DateTime;
  email?: string;
  local_id?: string;
  fb_name?: string;
};

export type PasswordChangeRequest = { old_password: string; new_password: string };

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

export type AuthProvidersCheckDto = {
  local: boolean;
  facebook: boolean;
  google: boolean;
  kakao: boolean;
  apple: boolean;
};

export type TimetableBriefDto = {
  _id: string;
  year: Integer;
  semester: Integer;
  title: string;
  isPrimary: boolean;
  updated_at: DateTime;
  total_credit: Integer;
};

export type TimetableAddRequestDto = { year: Integer; semester: 1 | 2 | 3 | 4; title: string };

export type ClassPlaceAndTimeLegacyDto = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  place?: string;
  startMinute: Integer;
  endMinute: Integer;
  start_time: string;
  end_time: string;
  len: Double;
  start: Double;
};

export type ColorSet = { bg?: string; fg?: string };

export type SnuttEvLectureIdDto = { snuttId?: string; evLectureId: Integer };

export type TimetableLectureLegacyDto = {
  _id: string;
  academic_year?: string;
  category?: string;
  class_time_json: ClassPlaceAndTimeLegacyDto[];
  classification?: string;
  credit?: Integer;
  department?: string;
  instructor?: string;
  lecture_number?: string;
  quota?: Integer;
  freshman_quota?: Integer;
  remark?: string;
  course_number?: string;
  course_title: string;
  color?: ColorSet;
  colorIndex: Integer;
  lecture_id?: string;
  snuttEvLecture?: SnuttEvLectureIdDto;
  categoryPre2025?: string;
};

export type TimetableLegacyDto = {
  _id: string;
  user_id: string;
  year: Integer;
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
  startMinute?: Integer;
  endMinute?: Integer;
};

export type CustomTimetableLectureAddLegacyRequestDto = {
  course_title: string;
  instructor?: string;
  credit?: Integer;
  class_time_json: ClassPlaceAndTimeLegacyRequestDto[];
  remark?: string;
  color?: ColorSet;
  colorIndex?: Integer;
  is_forced: boolean;
};

export type TimetableLectureModifyLegacyRequestDto = {
  course_title?: string;
  academic_year?: string;
  category?: string;
  classification?: string;
  instructor?: string;
  credit?: Integer;
  class_time_json?: ClassPlaceAndTimeLegacyRequestDto[];
  remark?: string;
  color?: ColorSet;
  colorIndex?: Integer;
  is_forced: boolean;
  categoryPre2025?: string;
};

export type Unit = Record<string, never>;

export type TimetableModifyThemeRequestDto = { theme?: 0 | 1 | 2 | 3 | 4 | 5; themeId?: string };

export type SearchQueryLegacy = {
  year: Integer;
  semester: 1 | 2 | 3 | 4;
  title?: string;
  classification?: string[];
  credit?: Integer[];
  course_number?: string[];
  academic_year?: string[];
  department?: string[];
  category?: string[];
  times?: SearchTimeDto[];
  timesToExclude?: SearchTimeDto[];
  etc?: string[];
  page: Integer;
  offset: Integer;
  limit: Integer;
  sortCriteria?: string;
  categoryPre2025?: string[];
};

export type SearchTimeDto = { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; startMinute: Integer; endMinute: Integer };

export type LectureDto = {
  _id: string;
  academic_year?: string;
  category?: string;
  class_time_json: ClassPlaceAndTimeLegacyDto[];
  classification?: string;
  credit: Integer;
  department?: string;
  instructor?: string;
  lecture_number: string;
  quota?: Integer;
  freshmanQuota?: Integer;
  remark?: string;
  semester: 1 | 2 | 3 | 4;
  year: Integer;
  course_number: string;
  course_title: string;
  registrationCount: Integer;
  wasFull: boolean;
  snuttEvLecture?: SnuttEvLectureSummaryDto;
  categoryPre2025?: string;
};

export type SnuttEvLectureSummaryDto = {
  snuttId?: string;
  evLectureId: Integer;
  avgRating?: Double;
  evaluationCount: Integer;
};

export type BuildingsResponse = { content: LectureBuilding[]; totalCount: Integer };

export type GeoCoordinate = { latitude: Double; longitude: Double };

export type LectureBuilding = {
  id: string;
  buildingNumber: string;
  buildingNameKor: string;
  buildingNameEng: string;
  locationInDMS?: GeoCoordinate;
  locationInDecimal?: GeoCoordinate;
  campus: 'GWANAK' | 'YEONGEON' | 'PYEONGCHANG';
};

export type BookmarkLectureDto = {
  _id: string;
  academic_year?: string;
  category?: string;
  class_time_json: ClassPlaceAndTimeLegacyDto[];
  classification?: string;
  credit: Integer;
  department?: string;
  instructor?: string;
  lecture_number: string;
  quota?: Integer;
  freshmanQuota?: Integer;
  remark?: string;
  course_number: string;
  course_title: string;
  snuttEvLecture?: SnuttEvLectureSummaryDto;
};

export type BookmarkResponse = { year: Integer; semester: Integer; lectures: BookmarkLectureDto[] };

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

export type NotificationCountResponse = { count: Integer };

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

export type PostPopupRequest = { key: string; imageOriginUri: string; linkUrl?: string; hiddenDays?: Integer };

export type PopupResponse = {
  id: string;
  key: string;
  imageUri: string;
  image_url: string;
  linkUrl?: string;
  hiddenDays?: Integer;
  hidden_days?: Integer;
};

export type VacancyNotificationLecturesResponse = { lectures: LectureDto[] };

export type PopupsResponse = { content: PopupResponse[]; totalCount: Integer };

export type FriendResponse = {
  id: string;
  userId: string;
  displayName?: string;
  nickname: NicknameDto;
  createdAt: DateTime;
};

export type FriendsResponse = { content: FriendResponse[]; totalCount: Integer };

export type FriendRequest = { nickname: string };

export type FriendRequestLinkResponse = { requestToken: string };

export type CoursebookDto = { year: Integer; semester: 1 | 2 | 3 | 4 };

export type ClassPlaceAndTimeDto = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  place?: string;
  startMinute: Integer;
  endMinute: Integer;
};

export type TimetableDto = {
  id: string;
  userId: string;
  year: Integer;
  semester: 1 | 2 | 3 | 4;
  lectures: TimetableLectureDto[];
  title: string;
  theme: 0 | 1 | 2 | 3 | 4 | 5;
  themeId?: string;
  isPrimary: boolean;
  updatedAt: DateTime;
};

export type TimetableLectureDto = {
  id: string;
  academicYear?: string;
  category?: string;
  classPlaceAndTimes: ClassPlaceAndTimeDto[];
  classification?: string;
  credit?: Integer;
  department?: string;
  instructor?: string;
  lectureNumber?: string;
  quota?: Integer;
  freshmanQuota?: Integer;
  remark?: string;
  courseNumber?: string;
  courseTitle: string;
  color?: ColorSet;
  colorIndex: Integer;
  lectureId?: string;
  snuttEvLecture?: SnuttEvLectureIdDto;
  categoryPre2025?: string;
};

export type UpdateFriendDisplayNameRequest = { displayName: string };

export type ThemeMarketInfoDto = { publishName: string; authorName: string; downloads: Integer };

export type ThemeOrigin = { originId: string; authorId: string };

export type TimetableThemeDto = {
  id: string;
  theme: 0 | 1 | 2 | 3 | 4 | 5;
  name: string;
  colors?: ColorSet[];
  isDefault: boolean;
  isCustom: boolean;
  origin?: ThemeOrigin;
  status: 'BASIC' | 'DOWNLOADED' | 'PUBLISHED' | 'PRIVATE';
  publishInfo?: ThemeMarketInfoDto;
};

export type TimetableThemeAddRequestDto = { name: string; colors: ColorSet[] };

export type ThemesResponse = { content: TimetableThemeDto[]; totalCount: Integer };

export type TimetableThemeDownloadRequestDto = { name: string };

export type TimetableThemePublishRequestDto = { publishName: string; isAnonymous: boolean };

export type TagListResponse = {
  classification: string[];
  department: string[];
  academic_year: string[];
  credit: string[];
  instructor: string[];
  category: string[];
  sortCriteria: string[];
  updated_at: Integer;
  categoryPre2025: string[];
};

export type TagListUpdateTimeResponse = { updated_at: Integer };

export type CoursebookResponse = { year: Integer; semester: 1 | 2 | 3 | 4; updated_at: DateTime };

export type CoursebookOfficialResponse = { noProxyUrl: string; proxyUrl?: string; url: string };

export type FeedbackPostRequestDto = { email: string; message: string };
