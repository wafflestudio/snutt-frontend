// 자동 생성 파일. 직접 수정하지 않는다. (yarn generate:snutt-timetable)
// 출처: https://snutt-api-dev.wafflestudio.com/v3/api-docs/v1compat
import { DateTime, Int64, Int32, Double, LocalDate } from '../types';

export type LegacyTimetableModifyRequest = { title?: string };

export type LegacyTimetableBriefDto = {
  _id: string;
  updated_at: DateTime;
  total_credit: Int32;
  id: string;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  title: string;
  updatedAt: DateTime;
  totalCredit: Int32;
  primary: boolean;
};

export type LegacyChangePasswordRequest = {
  old_password?: string;
  new_password?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type LegacyTokenResponse = { token: string };

export type LegacyTimetableModifyThemeRequest = { theme?: Int32 | null; themeId?: Int64 | null };

export type LegacyClassPlaceAndTimeFullDto = {
  start_time: string;
  end_time: string;
  len: Double;
  start: Double;
  day: Int32;
  place: string;
  startMinute: Int32;
  endMinute: Int32;
  startTime: string;
  endTime: string;
  periodLength: Double;
  startPeriod: Double;
};

export type LegacyColorSetDto = { bg?: string | null; fg?: string | null };

export type LegacyEvLectureIdDto = { evLectureId: Int64 };

export type LegacyTimetableDto = {
  _id: string;
  user_id: string;
  lecture_list: LegacyTimetableLectureDto[];
  updated_at: DateTime;
  id?: string | null;
  userId: string;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  lectures: LegacyTimetableLectureDto[];
  title: string;
  theme: Int32;
  themeId?: string | null;
  updatedAt: DateTime;
  primary: boolean;
};

export type LegacyTimetableLectureDto = {
  _id: string;
  academic_year: string;
  class_time_json: LegacyClassPlaceAndTimeFullDto[];
  lecture_number: string;
  freshman_quota: Int32;
  course_number: string;
  course_title: string;
  colorIndex: Int32;
  lecture_id: string;
  categoryPre2025?: string | null;
  id?: string | null;
  academicYear?: string | null;
  category?: string | null;
  classPlaceAndTimes: LegacyClassPlaceAndTimeFullDto[];
  classification?: string | null;
  credit?: Int32 | null;
  department?: string | null;
  instructor?: string | null;
  lectureNumber?: string | null;
  quota?: Int32 | null;
  freshmanQuota?: Int32 | null;
  remark?: string | null;
  courseNumber?: string | null;
  courseTitle: string;
  color?: LegacyColorSetDto | null;
  lectureId?: string | null;
  snuttEvLecture?: LegacyEvLectureIdDto | null;
};

export type LegacyClassTimeRequest = {
  day?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  place?: string | null;
  startMinute?: Int32;
  endMinute?: Int32;
};

export type LegacyColorRequest = { bg?: string | null; fg?: string | null };

export type LegacyModifyLectureRequest = {
  course_title?: string;
  academic_year?: string;
  class_time_json?: LegacyClassTimeRequest[];
  is_forced?: boolean;
  courseTitle?: string | null;
  academicYear?: string | null;
  category?: string | null;
  classification?: string | null;
  categoryPre2025?: string | null;
  instructor?: string | null;
  credit?: Int32 | null;
  classPlaceAndTimes?: LegacyClassTimeRequest[] | null;
  remark?: string | null;
  color?: LegacyColorRequest | null;
  colorIndex?: Int32 | null;
  forced?: boolean;
};

export type LegacyForcedRequest = { is_forced?: boolean; forced?: boolean };

export type LegacyReminderModifyRequest = {
  option?: 'NONE' | 'TEN_MINUTES_BEFORE' | 'ZERO_MINUTE' | 'TEN_MINUTES_AFTER';
};

export type LegacyReminderDto = {
  timetableLectureId: string;
  courseTitle: string;
  option: 'NONE' | 'TEN_MINUTES_BEFORE' | 'ZERO_MINUTE' | 'TEN_MINUTES_AFTER';
};

export type PushPreferenceDto = { pushPreferences: PushPreferenceItem[] };

export type PushPreferenceItem = {
  type: 'NORMAL' | 'LECTURE_UPDATE' | 'VACANCY_NOTIFICATION' | 'DIARY';
  enabled: boolean;
};

export type SendVerificationEmailRequest = { email?: string };

export type VerificationCodeRequest = { code?: string };

export type SearchTime = { day?: 0 | 1 | 2 | 3 | 4 | 5 | 6; startMinute?: Int32; endMinute?: Int32 };

export type QuestionAnswer = { questionId?: Int64; answerIndex?: Int32 };

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

export type LegacySocialTokenRequest = { token?: string };

export type LegacyAttachLocalRequest = { id?: string; password?: string };

export type LegacyOkResponse = { message: string };

export type LegacyEmailVerificationResponse = { is_email_verified: boolean };

export type LegacyThemeAddRequest = { name?: string; colors?: LegacyColorRequest[] };

export type LegacyThemeDto = {
  id?: string | null;
  userId: string;
  theme: Int32;
  name: string;
  colors?: LegacyColorSetDto[] | null;
  origin?: LegacyThemeOriginDto | null;
  status: 'BASIC' | 'PRIVATE' | 'PUBLISHED' | 'DOWNLOADED';
  publishInfo?: LegacyThemePublishInfoDto | null;
  default: boolean;
  custom: boolean;
};

export type LegacyThemeOriginDto = { originId: string; authorId: string };

export type LegacyThemePublishInfoDto = { publishName: string; authorName?: string | null; downloads: Int64 };

export type LegacyThemePublishRequest = { publishName?: string; anonymous?: boolean };

export type LegacyThemeDownloadRequest = { name?: string };

export type LegacyPageResponseLegacyThemeDto = { content: LegacyThemeDto[]; totalCount: Int32 };

export type LegacyTimetableAddRequest = { year?: Int32; semester?: 1 | 2 | 3 | 4; title?: string };

export type LegacyCustomLectureRequest = {
  course_title?: string;
  class_time_json?: LegacyClassTimeRequest[];
  is_forced?: boolean;
  courseTitle?: string;
  instructor?: string | null;
  credit?: Int32 | null;
  classPlaceAndTimes?: LegacyClassTimeRequest[] | null;
  remark?: string | null;
  color?: LegacyColorRequest | null;
  colorIndex?: Int32 | null;
  forced?: boolean;
};

export type LegacySearchQuery = {
  course_number?: string[];
  academic_year?: string[];
  year?: Int32;
  semester?: 1 | 2 | 3 | 4;
  title?: string | null;
  classification?: string[] | null;
  credit?: Int32[] | null;
  courseNumber?: string[] | null;
  academicYear?: string[] | null;
  department?: string[] | null;
  category?: string[] | null;
  times?: SearchTime[] | null;
  timesToExclude?: SearchTime[] | null;
  etc?: string[] | null;
  page?: Int32;
  offset?: Int64 | null;
  limit?: Int32;
  sortCriteria?: string | null;
  categoryPre2025?: string[] | null;
};

export type LegacyEvSummary = { evLectureId: Int64; avgRating?: Double | null; evaluationCount: Int64 };

export type LegacyLectureDto = {
  _id: string;
  academic_year: string;
  class_time_json: LegacyClassPlaceAndTimeFullDto[];
  lecture_number: string;
  course_number: string;
  course_title: string;
  id?: string | null;
  academicYear?: string | null;
  category?: string | null;
  classPlaceAndTimes: LegacyClassPlaceAndTimeFullDto[];
  classification?: string | null;
  credit?: Int32 | null;
  department?: string | null;
  instructor?: string | null;
  lectureNumber?: string | null;
  quota?: Int32 | null;
  freshmanQuota?: Int32 | null;
  remark?: string | null;
  semester: Int32;
  year: Int32;
  courseNumber?: string | null;
  courseTitle: string;
  registrationCount: Int32;
  wasFull: boolean;
  snuttEvLecture?: LegacyEvSummary | null;
  categoryPre2025?: string | null;
};

export type LegacyFriendRequest = { nickname?: string };

export type LegacyFriendDto = {
  id: string;
  userId: string;
  displayName?: string | null;
  nickname: LegacyFriendNicknameDto;
  createdAt: DateTime;
};

export type LegacyFriendNicknameDto = { nickname: string; tag?: string | null };

export type LegacyFeedbackRequest = { email?: string | null; message?: string };

export type LegacyEvaluationWriteRequest = {
  content?: string;
  gradeSatisfaction?: Double;
  teachingSkill?: Double;
  gains?: Double;
  lifeBalance?: Double;
  rating?: Double;
};

export type LegacyEvaluationCreateResponse = {
  id?: Int64 | null;
  userId?: string | null;
  content: string;
  gradeSatisfaction?: Double | null;
  teachingSkill?: Double | null;
  gains?: Double | null;
  lifeBalance?: Double | null;
  rating: Double;
  likeCount: Int64;
  fromSnuev: boolean;
  hidden: boolean;
  reported: boolean;
};

export type LegacyEvaluationReportRequest = { content?: string };

export type LegacyEvaluationReportResponse = {
  id?: Int64 | null;
  lectureEvaluationId: Int64;
  userId?: string | null;
  content: string;
  hidden: boolean;
};

export type LegacyDiarySubmissionRequest = {
  lectureId?: Int64;
  dailyClassTypes?: string[];
  questionAnswers?: QuestionAnswer[];
  comment?: string;
};

export type LegacyDiaryQuestionnaireRequest = { lectureId?: Int64; dailyClassTypes?: string[] };

export type LegacyDiaryQuestionDto = { id: string; question: string; answers: string[] };

export type LegacyDiaryQuestionnaireResponse = {
  courseTitle: string;
  questions: LegacyDiaryQuestionDto[];
  nextLecture?: LegacyDiaryTargetLectureDto | null;
};

export type LegacyDiaryTargetLectureDto = { lectureId?: string | null; courseTitle: string };

export type LegacyBookmarkLectureRequest = { lecture_id?: Int64; lectureId?: Int64 };

export type LegacyTokenExchangeRequest = { legacyToken?: string };

export type LegacyTokenExchangeResponse = { userId: string; accessToken: string; refreshToken: string };

export type LegacyLocalRegisterRequest = { id?: string; password?: string; email?: string | null };

export type LegacyLoginResponse = { user_id: string; userId: string; token: string; message: string };

export type LegacyResetPasswordRequest = { user_id?: string; userId?: string; password?: string; code?: string };

export type LegacyVerifyResetCodeRequest = { user_id?: string; localId?: string | null; code?: string };

export type LegacySendEmailRequest = { email?: string };

export type LegacyMaskedEmailRequest = { user_id?: string; userId?: string };

export type LegacyMaskedEmailResponse = { email: string };

export type LegacyLogoutRequest = { registration_id?: string; registrationId?: string | null };

export type LegacyLocalLoginRequest = { id?: string; password?: string };

export type LegacySocialLoginRequest = { token?: string };

export type RegistrationDate = {
  date: LocalDate;
  vacantSeatRegistrationTimes: RegistrationTimeSlot[];
  phase: 'CURRENT_STUDENT' | 'FRESHMAN' | 'COURSE_CHANGE';
};

export type RegistrationTimeSlot = { startMinute: Int32; endMinute: Int32 };

export type LegacyUpdateUserRequest = { nickname?: string | null };

export type LegacyNicknameDto = { nickname: string; tag?: string | null };

export type LegacyUserDto = {
  id: string;
  regDate: DateTime;
  notificationCheckedAt: DateTime;
  email?: string | null;
  localId?: string | null;
  fbName?: string | null;
  nickname: LegacyNicknameDto;
  admin: boolean;
};

export type LegacyThemeModifyRequest = { name?: string | null; colors?: LegacyColorRequest[] | null };

export type LegacyFriendDisplayNameRequest = { displayName?: string };

export type LegacyEvaluationUpdateRequest = {
  content?: string | null;
  gradeSatisfaction?: Double | null;
  teachingSkill?: Double | null;
  gains?: Double | null;
  lifeBalance?: Double | null;
  rating?: Double | null;
  semesterLectureId?: string | null;
};

export type LegacyEvaluationWithSemesterDto = {
  id?: Int64 | null;
  userId?: string | null;
  content: string;
  gradeSatisfaction?: Double | null;
  teachingSkill?: Double | null;
  gains?: Double | null;
  lifeBalance?: Double | null;
  rating: Double;
  likeCount: Int64;
  fromSnuev: boolean;
  year: Int32;
  semester: Int32;
  lectureId: Int64;
  hidden: boolean;
  reported: boolean;
  liked: boolean;
  modifiable: boolean;
  reportable: boolean;
};

export type LegacyVacancyLecturesResponse = { lectures: LegacyLectureDto[] };

export type LegacyExistsResponse = { exists: boolean };

export type LegacySocialProvidersResponse = {
  local: boolean;
  facebook: boolean;
  google: boolean;
  kakao: boolean;
  apple: boolean;
};

export type LegacyUserInfoDto = {
  local_id: string;
  fb_name: string;
  regDate: DateTime;
  notificationCheckedAt: DateTime;
  email?: string | null;
  localId?: string | null;
  fbName?: string | null;
  admin: boolean;
};

export type LegacyTagListResponse = {
  academic_year: string[];
  updated_at: Int64;
  classification: string[];
  department: string[];
  academicYear: string[];
  credit: string[];
  instructor: string[];
  category: string[];
  sortCriteria: string[];
  updatedAt: Int64;
  categoryPre2025: string[];
};

export type LegacyTagUpdateTimeResponse = { updated_at: Int64; updatedAt: Int64 };

export type LegacySemesterStatusResponse = {
  current?: LegacyYearAndSemesterDto | null;
  next: LegacyYearAndSemesterDto;
};

export type LegacyYearAndSemesterDto = { year: Int32; semester: 1 | 2 | 3 | 4 };

export type LegacyListResponseLegacyPopupDto = { content: LegacyPopupDto[]; totalCount: Int32 };

export type LegacyPopupDto = {
  image_url: string;
  hidden_days: Int32;
  id: string;
  key: string;
  imageUri: string;
  imageUrl: string;
  linkUrl?: string | null;
  hiddenDays?: Int32 | null;
  hiddenDaysSnake?: Int32 | null;
};

export type LegacyNotificationDto = {
  _id: string;
  user_id: string;
  created_at: DateTime;
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: Int32;
  deeplink?: string | null;
  createdAt: DateTime;
};

export type LegacyNotificationCountResponse = { count: Int64 };

export type LegacyPageResponseLegacyFriendDto = { content: LegacyFriendDto[]; totalCount: Int32 };

export type LegacyFriendCoursebookDto = { year: Int32; semester: Int32 };

export type LegacyFriendClassPlaceAndTimeDto = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  place?: string | null;
  startMinute: Int32;
  endMinute: Int32;
};

export type LegacyFriendEvLectureIdDto = { evLectureId: Int64 };

export type LegacyFriendTimetableDto = {
  id?: string | null;
  userId: string;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  lectures: LegacyFriendTimetableLectureDto[];
  title: string;
  theme: 0 | 1 | 2 | 3 | 4 | 5;
  themeId?: string | null;
  updatedAt: DateTime;
  primary: boolean;
};

export type LegacyFriendTimetableLectureDto = {
  id?: string | null;
  academicYear?: string | null;
  category?: string | null;
  classPlaceAndTimes: LegacyFriendClassPlaceAndTimeDto[];
  classification?: string | null;
  credit?: Int32 | null;
  department?: string | null;
  instructor?: string | null;
  lectureNumber?: string | null;
  quota?: Int32 | null;
  freshmanQuota?: Int32 | null;
  remark?: string | null;
  courseNumber?: string | null;
  courseTitle: string;
  color?: LegacyColorSetDto | null;
  colorIndex: Int32;
  lectureId?: string | null;
  snuttEvLecture?: LegacyFriendEvLectureIdDto | null;
  categoryPre2025?: string | null;
};

export type LegacyFriendLinkResponse = { requestToken: string };

export type LegacyLectureEvSummaryResponse = {
  evLectureId?: Int64 | null;
  avgRating?: Double | null;
  evaluationCount: Int64;
};

export type LegacyTakenLectureDto = {
  id?: Int64 | null;
  title: string;
  instructor: string;
  department?: string | null;
  courseNumber: string;
  credit?: Int32 | null;
  academicYear?: string | null;
  category?: string | null;
  classification?: string | null;
  takenYear: Int32;
  takenSemester: Int32;
};

export type LegacyTakenLecturesResponse = { content: LegacyTakenLectureDto[]; totalCount: Int32 };

export type LegacyEvTagDto = { id: Int64; name: string; description?: string | null; ordering: Int32 };

export type LegacyEvTagGroupDto = {
  id: Int32;
  name: string;
  ordering: Int32;
  color?: string | null;
  tags: LegacyEvTagDto[];
};

export type LegacySearchTagGroupsResponse = { tagGroups: LegacyEvTagGroupDto[] };

export type LegacyEvCursorPageLegacyEvaluationWithLectureDto = {
  content: LegacyEvaluationWithLectureDto[];
  cursor?: string | null;
  size: Int32;
  last: boolean;
  totalCount?: Int64 | null;
};

export type LegacyEvaluationCourseDto = { id?: Int64 | null; title: string; instructor: string };

export type LegacyEvaluationWithLectureDto = {
  id?: Int64 | null;
  userId?: string | null;
  content: string;
  gradeSatisfaction?: Double | null;
  teachingSkill?: Double | null;
  gains?: Double | null;
  lifeBalance?: Double | null;
  rating: Double;
  likeCount: Int64;
  fromSnuev: boolean;
  year: Int32;
  semester: Int32;
  lecture?: LegacyEvaluationCourseDto | null;
  hidden: boolean;
  reported: boolean;
  liked: boolean;
  modifiable: boolean;
  reportable: boolean;
};

export type LegacyMyLectureEvaluationsResponse = { evaluations: LegacyEvaluationWithSemesterDto[] };

export type LegacyEvCursorPageLegacyEvaluationWithSemesterDto = {
  content: LegacyEvaluationWithSemesterDto[];
  cursor?: string | null;
  size: Int32;
  last: boolean;
  totalCount?: Int64 | null;
};

export type LegacyEvAveragesDto = {
  avgGradeSatisfaction?: Double | null;
  avgTeachingSkill?: Double | null;
  avgGains?: Double | null;
  avgLifeBalance?: Double | null;
  avgRating?: Double | null;
  evaluationCount: Int64;
};

export type LegacyEvLectureSummaryResponse = {
  id?: Int64 | null;
  title: string;
  instructor?: string | null;
  department?: string | null;
  courseNumber: string;
  credit?: Int32 | null;
  academicYear?: string | null;
  category?: string | null;
  classification?: string | null;
  evaluation: LegacyEvAveragesDto;
};

export type LegacyCourseWithSemestersResponse = {
  id?: Int64 | null;
  title: string;
  instructor: string;
  department?: string | null;
  courseNumber: string;
  credit?: Int32 | null;
  academicYear?: string | null;
  category?: string | null;
  classification?: string | null;
  semesterLectures: LegacySemesterLectureDto[];
};

export type LegacySemesterLectureDto = {
  id: Int64;
  year: Int32;
  semester: Int32;
  credit: Int32;
  extraInfo: string;
  academicYear: string;
  category: string;
  classification: string;
  myEvaluationExists: boolean;
};

export type LegacyLectureIdResponse = { id: Int64; snuttId?: string | null; evLectureId: Int64 };

export type LegacyCourseDto = {
  id?: Int64 | null;
  title: string;
  instructor: string;
  department?: string | null;
  courseNumber: string;
  credit?: Int32 | null;
  academicYear?: string | null;
  category?: string | null;
  classification?: string | null;
  evaluation: LegacyCourseEvaluationSummaryDto;
};

export type LegacyCourseEvaluationSummaryDto = { avgRating?: Double | null; evaluationCount: Int64 };

export type LegacyCourseSearchResponse = {
  content: LegacyCourseDto[];
  page: Int32;
  size: Int32;
  last: boolean;
  totalCount: Int64;
};

export type LegacyDiarySemesterSubmissionsDto = {
  year: Int32;
  semester: Int32;
  submissions: LegacyDiarySubmissionDto[];
};

export type LegacyDiaryShortQuestionReplyDto = { question: string; answer: string };

export type LegacyDiarySubmissionDto = {
  id: string;
  lectureId: string;
  date: string;
  courseTitle: string;
  shortQuestionReplies: LegacyDiaryShortQuestionReplyDto[];
  comment: string;
};

export type LegacyDiaryDailyClassTypeDto = { id: string; name: string };

export type LegacyCoursebookDto = { updated_at: DateTime; year: Int32; semester: Int32; updatedAt: DateTime };

export type LegacyCoursebookOfficialResponse = { noProxyUrl: string; proxyUrl?: string | null; url: string };

export type LegacyGeoCoordinateDto = { latitude: Double; longitude: Double };

export type LegacyLectureBuildingDto = {
  locationInDMS: LegacyGeoCoordinateDto;
  id: string;
  buildingNumber: string;
  buildingNameKor: string;
  buildingNameEng: string;
  campus: string;
  locationInDms?: LegacyGeoCoordinateDto | null;
  locationInDecimal?: LegacyGeoCoordinateDto | null;
};

export type LegacyPageResponseLegacyLectureBuildingDto = { content: LegacyLectureBuildingDto[]; totalCount: Int32 };

export type LegacyBookmarkLectureDto = {
  _id: string;
  academic_year: string;
  class_time_json: LegacyClassPlaceAndTimeFullDto[];
  lecture_number: string;
  course_number: string;
  course_title: string;
  id?: string | null;
  academicYear?: string | null;
  category?: string | null;
  classPlaceAndTimes: LegacyClassPlaceAndTimeFullDto[];
  classification?: string | null;
  credit?: Int32 | null;
  department?: string | null;
  instructor?: string | null;
  lectureNumber?: string | null;
  quota?: Int32 | null;
  freshmanQuota?: Int32 | null;
  remark?: string | null;
  courseNumber?: string | null;
  courseTitle: string;
  snuttEvLecture?: LegacyEvSummary | null;
  categoryPre2025?: string | null;
};

export type LegacyBookmarksResponse = { year: Int32; semester: Int32; lectures: LegacyBookmarkLectureDto[] };

export type LegacyAdminUserSearchResponse = {
  id: string;
  email?: string | null;
  nickname: string;
  localId?: string | null;
  active: boolean;
  regDate: DateTime;
  lastLoginTimestamp: Int64;
  authProviders: ('LOCAL' | 'FACEBOOK' | 'APPLE' | 'GOOGLE' | 'KAKAO')[];
  socialAccounts: LegacySocialAccounts;
  admin: boolean;
  emailVerified: boolean;
};

export type LegacySocialAccounts = {
  googleEmail?: string | null;
  kakaoEmail?: string | null;
  appleEmail?: string | null;
  facebookName?: string | null;
};

export type SemesterRegistrationPeriod = {
  id?: Int64 | null;
  createdAt?: DateTime | null;
  updatedAt?: DateTime | null;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  registrationPeriodList: RegistrationDate[];
};

export type DiaryQuestion = {
  id?: Int64 | null;
  createdAt?: DateTime | null;
  updatedAt?: DateTime | null;
  question: string;
  shortQuestion: string;
  answerList: string[];
  shortAnswerList: string[];
  active: boolean;
};

export type DiaryDailyClassType = {
  id?: Int64 | null;
  createdAt?: DateTime | null;
  updatedAt?: DateTime | null;
  name: string;
  active: boolean;
};
