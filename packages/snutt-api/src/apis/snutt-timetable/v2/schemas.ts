// 자동 생성 파일. 직접 수정하지 않는다. (yarn generate:snutt-timetable)
// 출처: https://snutt-api-dev.wafflestudio.com/v3/api-docs/v2
import { Int64, Int32, Double, LocalDate } from '../types';

export type TimetableModifyThemeRequest = { themeId?: Int64 };

export type ClassPlaceAndTime = { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; place: string; startMinute: Int32; endMinute: Int32 };

export type ColorSet = { backgroundColor: string; foregroundColor: string };

export type TimetableLectureResponse = {
  id: Int64;
  lectureId?: Int64 | null;
  courseId?: Int64 | null;
  academicYear?: string | null;
  category?: string | null;
  categoryPre2025?: string | null;
  classification?: string | null;
  courseNumber?: string | null;
  lectureNumber?: string | null;
  department?: string | null;
  quota?: Int32 | null;
  freshmanQuota?: Int32 | null;
  courseTitle: string;
  instructor?: string | null;
  credit?: Int32 | null;
  remark?: string | null;
  classPlaceAndTimes: ClassPlaceAndTime[];
  color: ColorSet;
  customColor?: ColorSet | null;
  paletteIndex: Int32;
};

export type TimetableResponse = {
  id: Int64;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  title: string;
  themeId: Int64;
  updatedAt: Int64;
  lectures: TimetableLectureResponse[];
  primary: boolean;
};

export type TimetableLectureReminderModifyRequest = {
  option?: 'NONE' | 'TEN_MINUTES_BEFORE' | 'ZERO_MINUTE' | 'TEN_MINUTES_AFTER';
};

export type TimetableLectureReminderResponse = {
  timetableLectureId: Int64;
  courseTitle: string;
  option: 'NONE' | 'TEN_MINUTES_BEFORE' | 'ZERO_MINUTE' | 'TEN_MINUTES_AFTER';
};

export type SocialTokenRequest = { token?: string };

export type AuthProvidersResponse = { authProviders: string[]; accessToken: string; refreshToken: string };

export type PushPreferenceDto = { pushPreferences: PushPreferenceItem[] };

export type PushPreferenceItem = {
  type: 'NORMAL' | 'LECTURE_UPDATE' | 'VACANCY_NOTIFICATION' | 'DIARY';
  enabled: boolean;
};

export type AttachLocalRequest = { localId?: string; password?: string };

export type SendVerificationEmailRequest = { email?: string };

export type VerificationCodeRequest = { code?: string };

export type EmailVerificationResultResponse = { emailVerified: boolean };

export type TimetableAddRequest = { year?: Int32; semester?: 1 | 2 | 3 | 4; title: string };

export type TimetableBriefResponse = {
  id: Int64;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  title: string;
  updatedAt: Int64;
  totalCredit: Int32;
  primary: boolean;
};

export type TimetableLectureAddRequest = { lectureId?: Int64; forced?: boolean };

export type ResetLectureRequestBody = { forced?: boolean };

export type CustomTimetableLectureAddRequest = {
  courseTitle?: string;
  instructor?: string | null;
  credit?: Int32 | null;
  classPlaceAndTimes?: ClassPlaceAndTime[];
  remark?: string | null;
  customColor?: ColorSet | null;
  paletteIndex?: Int32 | null;
  forced?: boolean;
};

export type ThemeAddRequest = { name: string; colors?: ColorSet[] };

export type ThemeResponse = {
  id: Int64;
  name: string;
  colors: ColorSet[];
  kind: 'BUILTIN' | 'CUSTOM' | 'DOWNLOADED';
  builtinCode?: string | null;
  publicationId?: Int64 | null;
  default: boolean;
};

export type ThemePublishRequest = { name: string; authorAnonymous?: boolean };

export type ThemePublicationResponse = {
  id: Int64;
  name: string;
  colors: ColorSet[];
  authorId?: Int64 | null;
  authorNickname?: string | null;
  authorAnonymous: boolean;
  listed: boolean;
  downloadCount: Int64;
};

export type EvaluationWriteRequestBody = {
  content: string;
  gradeSatisfaction?: Double;
  teachingSkill?: Double;
  gains?: Double;
  lifeBalance?: Double;
  rating?: Double;
};

export type EvaluationResponse = {
  id: Int64;
  courseId: Int64;
  courseTitle: string;
  instructor: string;
  content: string;
  gradeSatisfaction?: Double | null;
  teachingSkill?: Double | null;
  gains?: Double | null;
  lifeBalance?: Double | null;
  rating: Double;
  likeCount: Int64;
  fromSnuev: boolean;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  hidden: boolean;
  reported: boolean;
  liked: boolean;
  modifiable: boolean;
  reportable: boolean;
};

export type LectureSearchRequest = {
  year?: Int32;
  semester?: 1 | 2 | 3 | 4;
  query?: string | null;
  classification?: string[] | null;
  credit?: Int32[] | null;
  courseNumber?: string[] | null;
  academicYear?: string[] | null;
  department?: string[] | null;
  category?: string[] | null;
  categoryPre2025?: string[] | null;
  etcTags?: string[] | null;
  times?: SearchTime[] | null;
  timesToExclude?: SearchTime[] | null;
  cursor?: string | null;
  limit?: Int32;
  sort?: string | null;
};

export type SearchTime = { day?: 0 | 1 | 2 | 3 | 4 | 5 | 6; startMinute?: Int32; endMinute?: Int32 };

export type CursorPageLectureResponse = {
  content: LectureResponse[];
  cursor?: string | null;
  size: Int32;
  last: boolean;
  totalCount?: Int64 | null;
};

export type LectureEvSummaryResponse = { avgRating?: Double | null; evalCount: Int64 };

export type LectureResponse = {
  id: Int64;
  courseId?: Int64 | null;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  courseNumber: string;
  lectureNumber: string;
  courseTitle: string;
  instructor?: string | null;
  department?: string | null;
  academicYear?: string | null;
  category?: string | null;
  categoryPre2025?: string | null;
  classification?: string | null;
  credit: Int32;
  quota: Int32;
  freshmanQuota?: Int32 | null;
  remark?: string | null;
  classPlaceAndTimes: ClassPlaceAndTime[];
  evaluationSummary?: LectureEvSummaryResponse | null;
};

export type FriendRequest = { nickname: string; nicknameTag?: string };

export type FriendResponse = {
  id: Int64;
  userId: Int64;
  displayName?: string | null;
  nickname: string;
  nicknameTag: string;
  createdAt: Int64;
};

export type FeedbackPostRequest = { email?: string | null; message: string };

export type EvaluationReportRequestBody = { content: string };

export type DiarySubmissionRequestDto = {
  lectureId?: Int64;
  dailyClassTypes?: string[];
  questionAnswers?: QuestionAnswer[];
  comment?: string;
};

export type QuestionAnswer = { questionId?: Int64; answerIndex?: Int32 };

export type DiaryQuestionnaireRequestDto = { lectureId?: Int64; dailyClassTypes?: string[] };

export type DiaryQuestionResponse = {
  id: Int64;
  question: string;
  shortQuestion: string;
  answers: string[];
  shortAnswers: string[];
};

export type DiaryQuestionnaireResponse = {
  courseTitle: string;
  questions: DiaryQuestionResponse[];
  nextLecture?: DiaryTargetLectureResponse | null;
};

export type DiaryTargetLectureResponse = {
  lectureId: Int64;
  courseTitle: string;
  instructor?: string | null;
  credit?: Int32 | null;
  classPlaceAndTimes: ClassPlaceAndTime[];
};

export type RegisterLocalRequest = { localId: string; password: string; email?: string | null };

export type TokenResponse = { userId: Int64; accessToken: string; refreshToken: string };

export type RefreshRequest = { refreshToken: string };

export type RequestPasswordResetRequest = { email: string };

export type ConfirmPasswordResetRequest = { email: string; code: string; newPassword: string };

export type LogoutRequest = { refreshToken: string; fcmRegistrationId?: string | null };

export type LoginLocalRequest = { localId: string; password: string };

export type SocialLoginRequest = { token: string };

export type FindIdRequest = { email: string };

export type AdminPopupWriteRequest = {
  popupKey: string;
  imageOriginUri: string;
  linkUrl?: string | null;
  hiddenDays?: Int32 | null;
};

export type AdminPopupResponse = {
  id: Int64;
  popupKey: string;
  imageOriginUri: string;
  linkUrl?: string | null;
  hiddenDays?: Int32 | null;
  createdAt: Int64;
  updatedAt: Int64;
};

export type InsertNotificationRequest = {
  userId?: Int64 | null;
  title: string;
  message: string;
  type?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  deeplink?: string | null;
  sendPush?: boolean;
};

export type FileUploadUri = { uploadUri: string; fileOriginUri: string; fileUri: string };

export type AdminDiaryQuestionWriteRequest = {
  question: string;
  shortQuestion: string;
  answers?: string[];
  shortAnswers?: string[];
  targetDailyClassTypes?: string[];
};

export type AdminConfigWriteRequest = {
  value?: JsonNode;
  osType?: 'ios' | 'android' | 'web';
  minVersion?: string | null;
  maxVersion?: string | null;
};

export type JsonNode = {
  empty: boolean;
  array: boolean;
  null: boolean;
  object: boolean;
  float: boolean;
  number: boolean;
  nodeType: 'ARRAY' | 'BINARY' | 'BOOLEAN' | 'MISSING' | 'NULL' | 'NUMBER' | 'OBJECT' | 'POJO' | 'STRING';
  string: boolean;
  integralNumber: boolean;
  missingNode: boolean;
  valueNode: boolean;
  container: boolean;
  pojo: boolean;
  floatingPointNumber: boolean;
  short: boolean;
  int: boolean;
  long: boolean;
  double: boolean;
  bigDecimal: boolean;
  bigInteger: boolean;
  textual: boolean;
  boolean: boolean;
  binary: boolean;
  embeddedValue: boolean;
};

export type AdminConfigResponse = {
  id: Int64;
  name: string;
  osType: 'ios' | 'android' | 'web';
  value: JsonNode;
  minVersion?: string | null;
  maxVersion?: string | null;
  createdAt: Int64;
  updatedAt: Int64;
};

export type UpdateUserRequest = { nickname: string };

export type UserResponse = {
  id: Int64;
  nickname: string;
  nicknameTag: string;
  email?: string | null;
  authProviders: string[];
  admin: boolean;
  emailVerified: boolean;
};

export type ChangePasswordRequest = { currentPassword?: string; newPassword?: string };

export type ChangePasswordResponse = { accessToken: string; refreshToken: string };

export type TimetableModifyRequest = { title: string };

export type TimetableLectureModifyRequest = {
  resetFields?: (
    | 'courseTitle'
    | 'instructor'
    | 'credit'
    | 'remark'
    | 'classPlaceAndTimes'
    | 'academicYear'
    | 'category'
    | 'classification'
    | 'categoryPre2025'
  )[];
  courseTitle?: string | null;
  instructor?: string | null;
  credit?: Int32 | null;
  classPlaceAndTimes?: ClassPlaceAndTime[] | null;
  remark?: string | null;
  customColor?: ColorSet | null;
  paletteIndex?: Int32 | null;
  academicYear?: string | null;
  category?: string | null;
  classification?: string | null;
  categoryPre2025?: string | null;
  forced?: boolean;
};

export type ThemeModifyRequest = { name?: string | null; colors?: ColorSet[] | null };

export type UpdateFriendDisplayNameRequest = { displayName: string };

export type EvaluationUpdateRequestBody = {
  lectureId?: Int64 | null;
  content?: string | null;
  gradeSatisfaction?: Double | null;
  teachingSkill?: Double | null;
  gains?: Double | null;
  lifeBalance?: Double | null;
  rating?: Double | null;
};

export type RegistrationDate = {
  date: LocalDate;
  vacantSeatRegistrationTimes: RegistrationTimeSlot[];
  phase: 'CURRENT_STUDENT' | 'FRESHMAN' | 'COURSE_CHANGE';
};

export type RegistrationTimeSlot = { startMinute: Int32; endMinute: Int32 };

export type VacancyNotificationLectureResponse = {
  id: Int64;
  courseId?: Int64 | null;
  courseTitle: string;
  courseNumber: string;
  lectureNumber: string;
  instructor?: string | null;
  credit: Int32;
  quota: Int32;
  registrationCount: Int32;
  wasFull: boolean;
};

export type VacancyNotificationLecturesResponse = { lectures: VacancyNotificationLectureResponse[] };

export type TakenLectureResponse = {
  id: Int64;
  lectureId: Int64;
  title: string;
  instructor: string;
  courseNumber: string;
  department?: string | null;
  credit?: Int32 | null;
  academicYear?: string | null;
  category?: string | null;
  classification?: string | null;
  takenYear: Int32;
  takenSemester: 1 | 2 | 3 | 4;
};

export type CursorPageThemePublicationResponse = {
  content: ThemePublicationResponse[];
  cursor?: string | null;
  size: Int32;
  last: boolean;
  totalCount?: Int64 | null;
};

export type SortCriterionResponse = { value: string; label: string };

export type TagListResponse = {
  classification: string[];
  department: string[];
  academicYear: string[];
  credit: Int32[];
  instructor: string[];
  category: string[];
  categoryPre2025: string[];
  sortCriteria: SortCriterionResponse[];
  updatedAt?: Int64 | null;
};

export type CourseTagListResponse = {
  classification: string[];
  department: string[];
  academicYear: string[];
  credit: Int32[];
  category: string[];
  categoryPre2025: string[];
  semesters: SemesterResponse[];
  updatedAt?: Int64 | null;
};

export type SemesterResponse = { year: Int32; semester: 1 | 2 | 3 | 4 };

export type SemesterStatusResponse = { current?: YearAndSemesterResponse | null; next: YearAndSemesterResponse };

export type YearAndSemesterResponse = { year: Int32; semester: 1 | 2 | 3 | 4 };

export type PopupResponse = {
  id: Int64;
  popupKey: string;
  imageUri: string;
  linkUrl?: string | null;
  hiddenDays?: Int32 | null;
};

export type CursorPageNotificationResponse = {
  content: NotificationResponse[];
  cursor?: string | null;
  size: Int32;
  last: boolean;
  totalCount?: Int64 | null;
};

export type NotificationResponse = {
  id: Int64;
  userId?: Int64 | null;
  title: string;
  message: string;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  deeplink?: string | null;
  createdAt: Int64;
};

export type NotificationCountResponse = { count: Int64 };

export type FriendCoursebookResponse = { year: Int32; semester: 1 | 2 | 3 | 4 };

export type FriendRequestLinkResponse = { requestToken: string };

export type EvaluationTagResponse = { key: string; title: string; description: string };

export type CursorPageEvaluationResponse = {
  content: EvaluationResponse[];
  cursor?: string | null;
  size: Int32;
  last: boolean;
  totalCount?: Int64 | null;
};

export type DiaryShortQuestionReplyResponse = { questionId: Int64; shortQuestion: string; shortAnswer: string };

export type DiarySubmissionSummaryResponse = {
  id: Int64;
  lectureId?: Int64 | null;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  courseTitle: string;
  comment: string;
  createdAt: Int64;
  shortQuestionReplies: DiaryShortQuestionReplyResponse[];
};

export type DiarySubmissionsOfYearSemesterResponse = {
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  submissions: DiarySubmissionSummaryResponse[];
};

export type DiaryDailyClassTypeResponse = { id: Int64; name: string };

export type CourseEvaluationSummaryResponse = { avgRating?: Double | null; count: Int64 };

export type CourseResponse = {
  id: Int64;
  title: string;
  instructor: string;
  courseNumber: string;
  evaluation: CourseEvaluationSummaryResponse;
};

export type CursorPageCourseResponse = {
  content: CourseResponse[];
  cursor?: string | null;
  size: Int32;
  last: boolean;
  totalCount?: Int64 | null;
};

export type CourseDetailResponse = { course: CourseResponse; lectures: CourseLectureResponse[] };

export type CourseLectureResponse = {
  id: Int64;
  lectureNumber: string;
  courseTitle: string;
  credit: Int32;
  academicYear?: string | null;
  classification?: string | null;
  category?: string | null;
  department?: string | null;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  myEvaluationExists: boolean;
};

export type CourseEvaluationDetailsResponse = {
  courseId: Int64;
  count: Int64;
  avgGradeSatisfaction?: Double | null;
  avgTeachingSkill?: Double | null;
  avgGains?: Double | null;
  avgLifeBalance?: Double | null;
  avgRating?: Double | null;
};

export type CoursebookResponse = { id: Int64; year: Int32; semester: 1 | 2 | 3 | 4; updatedAt: Int64 };

export type CoursebookOfficialResponse = { url: string; proxyUrl?: string | null };

export type BuildingResponse = {
  id: Int64;
  buildingNumber: string;
  buildingNameKor: string;
  buildingNameEng: string;
  campus: 'GWANAK' | 'YEONGEON' | 'PYEONGCHANG';
  location?: GeoCoordinate | null;
};

export type GeoCoordinate = { latitude: Double; longitude: Double };

export type BookmarkResponse = { year: Int32; semester: 1 | 2 | 3 | 4; lectures: LectureResponse[] };

export type AdminSocialAccountsResponse = {
  googleEmail?: string | null;
  kakaoEmail?: string | null;
  appleEmail?: string | null;
  facebookName?: string | null;
};

export type AdminUserSearchResponse = {
  id: Int64;
  email?: string | null;
  nickname: string;
  nicknameTag: string;
  localId?: string | null;
  active: boolean;
  createdAt: Int64;
  lastLoginAt: Int64;
  authProviders: string[];
  socialAccounts: AdminSocialAccountsResponse;
  admin: boolean;
  emailVerified: boolean;
};

export type AdminRegistrationPeriodResponse = {
  id: Int64;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  registrationPeriods: RegistrationDate[];
  createdAt: Int64;
  updatedAt: Int64;
};

export type AdminDiaryQuestionResponse = {
  id: Int64;
  question: string;
  shortQuestion: string;
  answers: string[];
  shortAnswers: string[];
  active: boolean;
  createdAt: Int64;
  updatedAt: Int64;
};

export type AdminDiaryDailyClassTypeResponse = {
  id: Int64;
  name: string;
  active: boolean;
  createdAt: Int64;
  updatedAt: Int64;
};
