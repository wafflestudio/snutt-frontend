// 자동 생성 파일. 직접 수정하지 않는다. (yarn generate:snutt-timetable)
// 출처: https://snutt-api-dev.wafflestudio.com/v3/api-docs/v1compat
import { DateTime, Int64, Int32, Double, LocalDate } from '../types';

export type LegacyChangePasswordRequest = { old_password: string; new_password: string };

export type LegacyTokenResponse = { token: string };

export type LegacyTimetableModifyRequest = { title: string };

export type LegacyTimetableBriefDto = {
  _id: string;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  title: string;
  isPrimary: boolean;
  updated_at: DateTime;
  total_credit: Int32;
};

export type LegacyTimetableModifyThemeRequest = { theme?: Int32 | null; themeId?: Int64 | null };

export type LegacyClassPlaceAndTimeFullDto = {
  day: Int32;
  place: string;
  startMinute: Int32;
  endMinute: Int32;
  start_time: string;
  end_time: string;
  len: Double;
  start: Double;
};

export type LegacyColorSetDto = { bg?: string | null; fg?: string | null };

export type LegacyEvLectureIdDto = { evLectureId: Int64 };

export type LegacyTimetableDto = {
  _id?: string;
  user_id: string;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  lecture_list: LegacyTimetableLectureDto[];
  title: string;
  theme: Int32;
  themeId?: string | null;
  isPrimary: boolean;
  updated_at: DateTime;
};

export type LegacyTimetableLectureDto = {
  _id?: string;
  academic_year?: string;
  category?: string | null;
  class_time_json: LegacyClassPlaceAndTimeFullDto[];
  classification?: string | null;
  credit?: Int32 | null;
  department?: string | null;
  instructor?: string | null;
  lecture_number?: string;
  quota?: Int32 | null;
  freshman_quota?: Int32;
  remark?: string | null;
  course_number?: string;
  course_title: string;
  color?: LegacyColorSetDto | null;
  colorIndex: Int32;
  lecture_id?: string;
  snuttEvLecture?: LegacyEvLectureIdDto | null;
  categoryPre2025?: string | null;
};

export type LegacyClassTimeRequest = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  place?: string | null;
  startMinute: Int32;
  endMinute: Int32;
};

export type LegacyColorRequest = { bg?: string | null; fg?: string | null };

export type LegacyModifyLectureRequest = {
  course_title?: string;
  academic_year?: string;
  category?: string | null;
  classification?: string | null;
  categoryPre2025?: string | null;
  instructor?: string | null;
  credit?: Int32 | null;
  class_time_json?: LegacyClassTimeRequest[];
  remark?: string | null;
  color?: LegacyColorRequest | null;
  colorIndex?: Int32 | null;
  is_forced?: boolean;
};

export type LegacyForcedRequest = { is_forced?: boolean };

export type LegacyReminderModifyRequest = {
  option: 'NONE' | 'TEN_MINUTES_BEFORE' | 'ZERO_MINUTE' | 'TEN_MINUTES_AFTER';
};

export type LegacyReminderDto = {
  timetableLectureId: string;
  courseTitle: string;
  option: 'NONE' | 'TEN_MINUTES_BEFORE' | 'ZERO_MINUTE' | 'TEN_MINUTES_AFTER';
};

export type LegacySocialTokenRequest = { token: string };

export type LegacyAttachLocalRequest = { id: string; password: string };

export type SendVerificationEmailRequest = { email: string };

export type LegacyOkResponse = { message: string };

export type VerificationCodeRequest = { code: string };

export type LegacyEmailVerificationResponse = { is_email_verified: boolean };

export type LegacyThemeAddRequest = { name: string; colors: LegacyColorRequest[] };

export type LegacyThemeDto = {
  id?: string | null;
  userId: string;
  theme: Int32;
  name: string;
  colors?: LegacyColorSetDto[] | null;
  isDefault: boolean;
  isCustom: boolean;
  origin?: LegacyThemeOriginDto | null;
  status: 'BASIC' | 'PRIVATE' | 'PUBLISHED' | 'DOWNLOADED';
  publishInfo?: LegacyThemePublishInfoDto | null;
};

export type LegacyThemeOriginDto = { originId: string; authorId: string };

export type LegacyThemePublishInfoDto = { publishName: string; authorName?: string | null; downloads: Int64 };

export type LegacyThemePublishRequest = { publishName: string; isAnonymous: boolean };

export type LegacyThemeDownloadRequest = { name: string };

export type LegacyPageResponseLegacyThemeDto = { content: LegacyThemeDto[]; totalCount: Int32 };

export type LegacyTimetableAddRequest = { year: Int32; semester: 1 | 2 | 3 | 4; title: string };

export type LegacyCustomLectureRequest = {
  course_title: string;
  instructor?: string | null;
  credit?: Int32 | null;
  class_time_json?: LegacyClassTimeRequest[];
  remark?: string | null;
  color?: LegacyColorRequest | null;
  colorIndex?: Int32 | null;
  is_forced?: boolean;
};

export type LegacySearchQuery = {
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  title?: string | null;
  classification?: string[] | null;
  credit?: Int32[] | null;
  course_number?: string[];
  academic_year?: string[];
  department?: string[] | null;
  category?: string[] | null;
  times?: SearchTime[] | null;
  timesToExclude?: SearchTime[] | null;
  etc?: string[] | null;
  page: Int32;
  offset?: Int64 | null;
  limit: Int32;
  sortCriteria?: string | null;
  categoryPre2025?: string[] | null;
};

export type SearchTime = { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; startMinute: Int32; endMinute: Int32 };

export type LegacyEvSummary = { evLectureId: Int64; avgRating?: Double | null; evaluationCount: Int64 };

export type LegacyLectureDto = {
  _id?: string;
  academic_year?: string;
  category?: string | null;
  class_time_json: LegacyClassPlaceAndTimeFullDto[];
  classification?: string | null;
  credit?: Int32 | null;
  department?: string | null;
  instructor?: string | null;
  lecture_number?: string;
  quota?: Int32 | null;
  freshmanQuota?: Int32 | null;
  remark?: string | null;
  semester: Int32;
  year: Int32;
  course_number?: string;
  course_title: string;
  registrationCount: Int32;
  wasFull: boolean;
  snuttEvLecture?: LegacyEvSummary | null;
  categoryPre2025?: string | null;
};

export type PushPreferenceDto = { pushPreferences: PushPreferenceItem[] };

export type PushPreferenceItem = {
  type: 'NORMAL' | 'LECTURE_UPDATE' | 'VACANCY_NOTIFICATION' | 'DIARY';
  isEnabled: boolean;
};

export type LegacyFriendRequest = { nickname: string };

export type LegacyFriendDto = {
  id: string;
  userId: string;
  displayName?: string | null;
  nickname: LegacyFriendNicknameDto;
  createdAt: DateTime;
};

export type LegacyFriendNicknameDto = { nickname: string; tag?: string | null };

export type LegacyFeedbackRequest = { email?: string | null; message: string };

export type LegacyEvaluationWriteRequest = {
  content: string;
  grade_satisfaction: Double;
  teaching_skill: Double;
  gains: Double;
  life_balance: Double;
  rating: Double;
};

export type LegacyEvaluationCreateResponse = {
  id?: Int64 | null;
  user_id?: string;
  content: string;
  grade_satisfaction?: Double;
  teaching_skill?: Double;
  gains?: Double | null;
  life_balance?: Double;
  rating: Double;
  like_count: Int64;
  is_hidden: boolean;
  is_reported: boolean;
  from_snuev: boolean;
};

export type LegacyEvaluationReportRequest = { content: string };

export type LegacyEvaluationReportResponse = {
  id?: Int64 | null;
  lecture_evaluation_id: Int64;
  user_id?: string;
  content: string;
  is_hidden: boolean;
};

export type LegacyDiarySubmissionRequest = {
  lectureId: Int64;
  dailyClassTypes: string[];
  questionAnswers: QuestionAnswer[];
  comment: string;
};

export type QuestionAnswer = { questionId: Int64; answerIndex: Int32 };

export type LegacyDiaryQuestionnaireRequest = { lectureId: Int64; dailyClassTypes: string[] };

export type LegacyDiaryQuestionDto = { id: string; question: string; answers: string[] };

export type LegacyDiaryQuestionnaireResponse = {
  courseTitle: string;
  questions: LegacyDiaryQuestionDto[];
  nextLecture?: LegacyDiaryTargetLectureDto | null;
};

export type LegacyDiaryTargetLectureDto = { lectureId?: string | null; courseTitle: string };

export type LegacyBookmarkLectureRequest = { lecture_id: Int64 };

export type LegacyTokenExchangeRequest = { legacyToken: string };

export type LegacyTokenExchangeResponse = { userId: string; accessToken: string; refreshToken: string };

export type LegacyLocalRegisterRequest = { id: string; password: string; email?: string | null };

export type LegacyLoginResponse = { user_id: string; token: string; message: string };

export type LegacyResetPasswordRequest = { user_id: string; password: string; code: string };

export type LegacyVerifyResetCodeRequest = { user_id?: string; code: string };

export type LegacySendEmailRequest = { email: string };

export type LegacyMaskedEmailRequest = { user_id: string };

export type LegacyMaskedEmailResponse = { email: string };

export type LegacyLogoutRequest = { registration_id?: string };

export type LegacyLocalLoginRequest = { id: string; password: string };

export type LegacySocialLoginRequest = { token: string };

export type LegacyUpdateUserRequest = { nickname?: string | null };

export type LegacyNicknameDto = { nickname: string; tag?: string | null };

export type LegacyUserDto = {
  id: string;
  isAdmin: boolean;
  regDate: DateTime;
  notificationCheckedAt: DateTime;
  email?: string | null;
  localId?: string | null;
  fbName?: string | null;
  nickname: LegacyNicknameDto;
};

export type LegacyThemeModifyRequest = { name?: string | null; colors?: LegacyColorRequest[] | null };

export type LegacyFriendDisplayNameRequest = { displayName: string };

export type LegacyEvaluationUpdateRequest = {
  content?: string | null;
  grade_satisfaction?: Double;
  teaching_skill?: Double;
  gains?: Double | null;
  life_balance?: Double;
  rating?: Double | null;
  semester_lecture_id?: string;
};

export type LegacyEvaluationWithSemesterDto = {
  id?: Int64 | null;
  user_id?: string;
  content: string;
  grade_satisfaction?: Double;
  teaching_skill?: Double;
  gains?: Double | null;
  life_balance?: Double;
  rating: Double;
  like_count: Int64;
  is_hidden: boolean;
  is_reported: boolean;
  is_liked: boolean;
  from_snuev: boolean;
  year: Int32;
  semester: Int32;
  lecture_id: Int64;
  is_modifiable: boolean;
  is_reportable: boolean;
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
  isAdmin: boolean;
  regDate: DateTime;
  notificationCheckedAt: DateTime;
  email?: string | null;
  local_id?: string;
  fb_name?: string;
};

export type LegacyTagListResponse = {
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

export type LegacyTagUpdateTimeResponse = { updated_at: Int64 };

export type LegacySemesterStatusResponse = {
  current?: LegacyYearAndSemesterDto | null;
  next: LegacyYearAndSemesterDto;
};

export type LegacyYearAndSemesterDto = { year: Int32; semester: 1 | 2 | 3 | 4 };

export type LegacyPageResponseLegacyPopupDto = { content: LegacyPopupDto[]; totalCount: Int32 };

export type LegacyPopupDto = {
  id: string;
  key: string;
  imageUri: string;
  image_url: string;
  linkUrl?: string | null;
  hiddenDays?: Int32 | null;
  hidden_days?: Int32;
};

export type LegacyNotificationDto = {
  _id: string;
  user_id?: string;
  title: string;
  message: string;
  type: Int32;
  deeplink?: string | null;
  created_at: DateTime;
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

export type LegacyFriendTimetableDto = {
  id?: string | null;
  userId: string;
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  lectures: LegacyFriendTimetableLectureDto[];
  title: string;
  theme: Int32;
  themeId?: string | null;
  isPrimary: boolean;
  updatedAt: DateTime;
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
  categoryPre2025?: string | null;
};

export type LegacyFriendLinkResponse = { requestToken: string };

export type LegacyTakenLectureDto = {
  id?: Int64 | null;
  title: string;
  instructor: string;
  department?: string | null;
  course_number: string;
  credit?: Int32 | null;
  academic_year?: string;
  category?: string | null;
  classification?: string | null;
  taken_year: Int32;
  taken_semester: Int32;
};

export type LegacyTakenLecturesResponse = { content: LegacyTakenLectureDto[]; total_count: Int32 };

export type LegacyEvTagDto = { id: Int64; name: string; description?: string | null; ordering: Int32 };

export type LegacyEvTagGroupDto = {
  id: Int32;
  name: string;
  ordering: Int32;
  color?: string | null;
  tags: LegacyEvTagDto[];
};

export type LegacySearchTagGroupsResponse = { tag_groups: LegacyEvTagGroupDto[] };

export type LegacyEvCursorPageLegacyEvaluationWithLectureDto = {
  content: LegacyEvaluationWithLectureDto[];
  cursor?: string | null;
  size: Int32;
  last: boolean;
  total_count?: Int64;
};

export type LegacyEvaluationCourseDto = { id?: Int64 | null; title: string; instructor: string };

export type LegacyEvaluationWithLectureDto = {
  id?: Int64 | null;
  user_id?: string;
  content: string;
  grade_satisfaction?: Double;
  teaching_skill?: Double;
  gains?: Double | null;
  life_balance?: Double;
  rating: Double;
  like_count: Int64;
  is_hidden: boolean;
  is_reported: boolean;
  is_liked: boolean;
  from_snuev: boolean;
  year: Int32;
  semester: Int32;
  lecture?: LegacyEvaluationCourseDto | null;
  is_modifiable: boolean;
  is_reportable: boolean;
};

export type LegacyMyLectureEvaluationsResponse = { evaluations: LegacyEvaluationWithSemesterDto[] };

export type LegacyEvCursorPageLegacyEvaluationWithSemesterDto = {
  content: LegacyEvaluationWithSemesterDto[];
  cursor?: string | null;
  size: Int32;
  last: boolean;
  total_count?: Int64;
};

export type LegacyEvAveragesDto = {
  avg_grade_satisfaction?: Double;
  avg_teaching_skill?: Double;
  avg_gains?: Double;
  avg_life_balance?: Double;
  avg_rating?: Double;
  evaluation_count: Int64;
};

export type LegacyEvLectureSummaryResponse = {
  id?: Int64 | null;
  title: string;
  instructor?: string | null;
  department?: string | null;
  course_number: string;
  credit?: Int32 | null;
  academic_year?: string;
  category?: string | null;
  classification?: string | null;
  evaluation: LegacyEvAveragesDto;
};

export type LegacyCourseWithSemestersResponse = {
  id?: Int64 | null;
  title: string;
  instructor: string;
  department?: string | null;
  course_number: string;
  credit?: Int32 | null;
  academic_year?: string;
  category?: string | null;
  classification?: string | null;
  semester_lectures: LegacySemesterLectureDto[];
};

export type LegacySemesterLectureDto = {
  id: Int64;
  year: Int32;
  semester: Int32;
  credit: Int32;
  extra_info: string;
  academic_year: string;
  category: string;
  classification: string;
  my_evaluation_exists: boolean;
};

export type LegacyLectureIdResponse = { id: Int64; snuttId?: string | null; evLectureId: Int64 };

export type LegacyCourseDto = {
  id?: Int64 | null;
  title: string;
  instructor: string;
  department?: string | null;
  course_number: string;
  credit?: Int32 | null;
  academic_year?: string;
  category?: string | null;
  classification?: string | null;
  evaluation: LegacyCourseEvaluationSummaryDto;
};

export type LegacyCourseEvaluationSummaryDto = { avg_rating?: Double; evaluation_count: Int64 };

export type LegacyCourseSearchResponse = {
  content: LegacyCourseDto[];
  page: Int32;
  size: Int32;
  last: boolean;
  total_count: Int64;
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

export type LegacyCoursebookDto = { year: Int32; semester: Int32; updated_at: DateTime };

export type LegacyCoursebookOfficialResponse = { noProxyUrl: string; proxyUrl?: string | null; url: string };

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

export type LegacyGeoCoordinateDto = { latitude: Double; longitude: Double };

export type LegacyLectureBuildingDto = {
  id: string;
  buildingNumber: string;
  buildingNameKor: string;
  buildingNameEng: string;
  campus: string;
  locationInDMS?: LegacyGeoCoordinateDto;
  locationInDecimal?: LegacyGeoCoordinateDto | null;
};

export type LegacyPageResponseLegacyLectureBuildingDto = { content: LegacyLectureBuildingDto[]; totalCount: Int32 };

export type LegacyBookmarkLectureDto = {
  _id?: string;
  academic_year?: string;
  category?: string | null;
  class_time_json: LegacyClassPlaceAndTimeFullDto[];
  classification?: string | null;
  credit?: Int32 | null;
  department?: string | null;
  instructor?: string | null;
  lecture_number?: string;
  quota?: Int32 | null;
  freshmanQuota?: Int32 | null;
  remark?: string | null;
  course_number?: string;
  course_title: string;
  snuttEvLecture?: LegacyEvSummary | null;
  categoryPre2025?: string | null;
};

export type LegacyBookmarksResponse = { year: Int32; semester: Int32; lectures: LegacyBookmarkLectureDto[] };

export type LegacyAdminUserSearchResponse = {
  id: string;
  email?: string | null;
  isEmailVerified: boolean;
  nickname: string;
  localId?: string | null;
  isAdmin: boolean;
  active: boolean;
  regDate: DateTime;
  lastLoginTimestamp: Int64;
  authProviders: ('LOCAL' | 'FACEBOOK' | 'APPLE' | 'GOOGLE' | 'KAKAO')[];
  socialAccounts: LegacySocialAccounts;
};

export type LegacySocialAccounts = {
  googleEmail?: string | null;
  kakaoEmail?: string | null;
  appleEmail?: string | null;
  facebookName?: string | null;
};

export type RegistrationDate = {
  date: LocalDate;
  vacantSeatRegistrationTimes: RegistrationTimeSlot[];
  phase: 'CURRENT_STUDENT' | 'FRESHMAN' | 'COURSE_CHANGE';
};

export type RegistrationTimeSlot = { startMinute: Int32; endMinute: Int32 };

export type SemesterRegistrationPeriod = {
  year: Int32;
  semester: 1 | 2 | 3 | 4;
  registrationPeriodList: RegistrationDate[];
  id?: Int64 | null;
  createdAt?: DateTime | null;
  updatedAt?: DateTime | null;
};

export type DiaryQuestion = {
  question: string;
  shortQuestion: string;
  answerList: string[];
  shortAnswerList: string[];
  active: boolean;
  id?: Int64 | null;
  createdAt?: DateTime | null;
  updatedAt?: DateTime | null;
};

export type DiaryDailyClassType = {
  name: string;
  active: boolean;
  id?: Int64 | null;
  createdAt?: DateTime | null;
  updatedAt?: DateTime | null;
};
