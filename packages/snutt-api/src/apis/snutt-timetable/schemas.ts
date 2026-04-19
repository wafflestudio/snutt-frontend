import { Int32, Double, Int64, DateTime } from './types';

export type PasswordChangeRequest = { old_password: string; new_password: string };

export type TokenResponse = { token: string };

export type TimetableModifyThemeRequestDto = { theme?: 0 | 1 | 2 | 3 | 4 | 5; themeId?: string };

export type ClassPlaceAndTimeLegacyDto = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  place?: string;
  startMinute: Int32;
  endMinute: Int32;
  start_time: string;
  end_time: string;
  len: Double;
  start: Double;
};

export type ColorSet = { bg?: string; fg?: string };

export type SnuttEvLectureIdDto = { snuttId?: string; evLectureId: Int64 };

export type TimetableLectureLegacyDto = {
  _id?: string;
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
  color?: ColorSet;
  colorIndex: Int32;
  lecture_id?: string;
  snuttEvLecture?: SnuttEvLectureIdDto;
  categoryPre2025?: string;
};

export type TimetableLegacyDto = {
  _id?: string;
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

export type ForcedReq = { is_forced?: boolean };

export type TimetableLectureReminderModifyRequestDto = {
  option: 'NONE' | 'TEN_MINUTES_BEFORE' | 'ZERO_MINUTE' | 'TEN_MINUTES_AFTER';
};

export type TimetableLectureReminderDto = {
  timetableLectureId: string;
  courseTitle: string;
  option: 'NONE' | 'TEN_MINUTES_BEFORE' | 'ZERO_MINUTE' | 'TEN_MINUTES_AFTER';
};

export type ClassPlaceAndTimeLegacyRequestDto = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  place?: string;
  startMinute?: Int32;
  endMinute?: Int32;
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
  categoryPre2025?: string;
};

export type TimetableModifyRequestDto = { title: string };

export type TimetableBriefDto = {
  _id: string;
  year: Int32;
  semester: Int32;
  title: string;
  isPrimary: boolean;
  updated_at: DateTime;
  total_credit: Int64;
};

export type LocalLoginRequest = { id: string; password: string };

export type SocialLoginRequest = { token: string };

export type VerificationCodeRequest = { user_id?: string; code: string };

export type EmailVerificationResultDto = { is_email_verified: boolean };

export type SendEmailRequest = { email: string };

export type OkResponse = { message: string };

export type TimetableThemePublishRequestDto = { publishName: string; isAnonymous: boolean };

export type TimetableThemeDownloadRequestDto = { name: string };

export type ThemeMarketInfoDto = { publishName: string; authorName: string; downloads: Int32 };

export type ThemeOrigin = { originId: string; authorId: string };

export type TimetableThemeDto = {
  id?: string;
  userId: string;
  theme: 0 | 1 | 2 | 3 | 4 | 5;
  name: string;
  colors?: ColorSet[];
  isDefault: boolean;
  isCustom: boolean;
  origin?: ThemeOrigin;
  status: 'BASIC' | 'DOWNLOADED' | 'PUBLISHED' | 'PRIVATE';
  publishInfo?: ThemeMarketInfoDto;
};

export type ListResponseTimetableThemeDto = { content: TimetableThemeDto[]; totalCount: Int32 };

export type TimetableThemeAddRequestDto = { name: string; colors: ColorSet[] };

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

export type TimetableAddRequestDto = { year: Int32; semester: 1 | 2 | 3 | 4; title: string };

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
  times?: SearchTimeDto[];
  timesToExclude?: SearchTimeDto[];
  etc?: string[];
  page: Int32;
  offset: Int64;
  limit: Int32;
  sortCriteria?: string;
  categoryPre2025?: string[];
};

export type SearchTimeDto = { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; startMinute: Int32; endMinute: Int32 };

export type LectureDto = {
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
  semester: 1 | 2 | 3 | 4;
  year: Int32;
  course_number: string;
  course_title: string;
  registrationCount: Int32;
  wasFull: boolean;
  snuttEvLecture?: SnuttEvLectureSummaryDto;
  categoryPre2025?: string;
};

export type SnuttEvLectureSummaryDto = {
  snuttId?: string;
  evLectureId: Int64;
  avgRating?: Double;
  evaluationCount: Int64;
};

export type PushPreferenceDto = { pushPreferences: PushPreferenceItem[] };

export type PushPreferenceItem = {
  type: 'NORMAL' | 'LECTURE_UPDATE' | 'VACANCY_NOTIFICATION' | 'DIARY';
  isEnabled: boolean;
};

export type FriendResponse = {
  id: string;
  userId: string;
  displayName?: string;
  nickname: NicknameDto;
  createdAt: DateTime;
};

export type NicknameDto = { nickname: string; tag: string };

export type FriendRequest = { nickname: string };

export type FeedbackPostRequestDto = { email: string; message: string };

export type MultiValueMapStringString = { empty?: boolean };

export type DiaryQuestionnaireRequestDto = { lectureId: string; dailyClassTypes: string[] };

export type DiaryQuestionDto = { id: string; question: string; answers: string[] };

export type DiaryQuestionnaireDto = {
  courseTitle: string;
  questions: DiaryQuestionDto[];
  nextLecture?: DiaryTargetLectureDto;
};

export type DiaryTargetLectureDto = { lectureId: string; courseTitle: string };

export type DiarySubmissionRequestDto = {
  lectureId: string;
  dailyClassTypes: string[];
  questionAnswers: QuestionAnswer[];
  comment: string;
};

export type QuestionAnswer = { questionId: string; answerIndex: Int32 };

export type BookmarkLectureModifyRequest = { lecture_id: string };

export type LocalRegisterRequest = { id: string; password: string; email?: string };

export type LoginResponse = { user_id: string; token: string; message: string };

export type GetMaskedEmailRequest = { user_id: string };

export type EmailResponse = { email: string };

export type PasswordResetRequest = { user_id: string; password: string; code: string };

export type LogoutRequest = { registration_id: string };

export type FacebookLoginRequest = { fb_id?: string; fb_token: string };

export type PostPopupRequest = { key: string; imageOriginUri: string; linkUrl?: string; hiddenDays?: Int32 };

export type PopupResponse = {
  id: string;
  key: string;
  imageUri: string;
  image_url: string;
  linkUrl?: string;
  hiddenDays?: Int32;
  hidden_days?: Int32;
};

export type InsertNotificationRequest = {
  userId?: string;
  title: string;
  body: string;
  insertFcm: boolean;
  shouldSendAsDataMessage: boolean;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  dataPayload: Record<string, string>;
};

export type FileUploadUriDto = { uploadUri: string; fileOriginUri: string; fileUri: string };

export type DiaryAddQuestionRequestDto = {
  question: string;
  shortQuestion: string;
  answers: string[];
  shortAnswers: string[];
  targetDailyClassTypes: string[];
  active: boolean;
};

export type ConfigVersionDto = { ios: string; android: string };

export type JsonNode = {
  object?: boolean;
  container?: boolean;
  string?: boolean;
  long?: boolean;
  short?: boolean;
  float?: boolean;
  boolean?: boolean;
  number?: boolean;
  binary?: boolean;
  null?: boolean;
  int?: boolean;
  nodeType?: 'ARRAY' | 'BINARY' | 'BOOLEAN' | 'MISSING' | 'NULL' | 'NUMBER' | 'OBJECT' | 'POJO' | 'STRING';
  integralNumber?: boolean;
  valueNode?: boolean;
  missingNode?: boolean;
  pojo?: boolean;
  floatingPointNumber?: boolean;
  double?: boolean;
  bigDecimal?: boolean;
  bigInteger?: boolean;
  textual?: boolean;
  empty?: boolean;
  array?: boolean;
  embeddedValue?: boolean;
};

export type PostConfigRequest = { data: JsonNode; minVersion?: ConfigVersionDto; maxVersion?: ConfigVersionDto };

export type ConfigResponse = {
  id: string;
  data: JsonNode;
  minVersion?: ConfigVersionDto;
  maxVersion?: ConfigVersionDto;
};

export type UserPatchRequest = { nickname?: string };

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

export type TimetableThemeModifyRequestDto = { name?: string; colors?: ColorSet[] };

export type UpdateFriendDisplayNameRequest = { displayName: string };

export type RegistrationDate = {
  date: Date;
  vacantSeatRegistrationTimes: RegistrationTimeSlot[];
  phase: 'CURRENT_STUDENT' | 'FRESHMAN' | 'COURSE_CHANGE';
};

export type RegistrationTimeSlot = { startMinute: Int32; endMinute: Int32 };

export type PatchConfigRequest = { data?: JsonNode; minVersion?: ConfigVersionDto; maxVersion?: ConfigVersionDto };

export type ExistenceResponse = { exists: boolean };

export type VacancyNotificationLecturesResponse = { lectures: LectureDto[] };

export type AuthProvidersCheckDto = {
  local: boolean;
  facebook: boolean;
  google: boolean;
  kakao: boolean;
  apple: boolean;
};

export type UserLegacyDto = {
  isAdmin: boolean;
  regDate: DateTime;
  notificationCheckedAt: DateTime;
  email?: string;
  local_id?: string;
  fb_name?: string;
};

export type TagListUpdateTimeResponse = { updated_at: Int64 };

export type TagListResponse = {
  classification: string[];
  department: string[];
  academic_year: string[];
  credit: string[];
  instructor: string[];
  category: string[];
  sortCriteria: string[];
  updated_at: Int64;
  categoryPre2025: string[];
};

export type GetSemesterStatusResponse = { current?: YearAndSemester; next: YearAndSemester };

export type YearAndSemester = { year: Int32; semester: 1 | 2 | 3 | 4 };

export type ListResponsePopupResponse = { content: PopupResponse[]; totalCount: Int32 };

export type NotificationCountResponse = { count: Int64 };

export type NotificationResponse = {
  _id?: string;
  user_id?: string;
  title: string;
  message: string;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  deeplink?: string;
  created_at: DateTime;
};

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
  snuttEvLecture?: SnuttEvLectureIdDto;
  categoryPre2025?: string;
};

export type FriendRequestLinkResponse = { requestToken: string };

export type ListResponseFriendResponse = { content: FriendResponse[]; totalCount: Int32 };

export type DiaryShortQuestionReply = { question: string; answer: string };

export type DiarySubmissionSummaryDto = {
  id: string;
  lectureId: string;
  date: DateTime;
  courseTitle: string;
  shortQuestionReplies: DiaryShortQuestionReply[];
  comment: string;
};

export type DiarySubmissionsOfYearSemesterDto = {
  year: Int32;
  semester: Int32;
  submissions: DiarySubmissionSummaryDto[];
};

export type DiaryDailyClassTypeDto = { id: string; name: string };

export type CoursebookResponse = { year: Int32; semester: 1 | 2 | 3 | 4; updated_at: DateTime };

export type CoursebookOfficialResponse = { noProxyUrl: string; proxyUrl?: string; url: string };

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

export type ListResponseLectureBuilding = { content: LectureBuilding[]; totalCount: Int32 };

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
  snuttEvLecture?: SnuttEvLectureSummaryDto;
};

export type BookmarkResponse = { year: Int32; semester: Int32; lectures: BookmarkLectureDto[] };

export type SemesterRegistrationPeriod = {
  id?: string;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  registrationPeriods: RegistrationDate[];
};

export type DiaryQuestion = {
  id?: string;
  question: string;
  shortQuestion: string;
  answers: string[];
  shortAnswers: string[];
  targetDailyClassTypeIds: string[];
  active: boolean;
};

export type DiaryDailyClassType = { id?: string; name: string; active: boolean };
