import { Api, GetApiSpecsParameter } from '../..';
import { SuccessResponse } from '../../../response';
import {
  // 인증
  LoginLocalRequest,
  SocialLoginRequest,
  RegisterLocalRequest,
  RefreshRequest,
  LogoutRequest,
  TokenResponse,
  // 유저
  UserResponse,
  UpdateUserRequest,
  AuthProvidersResponse,
  SocialTokenRequest,
  AttachLocalRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  // 시간표
  TimetableBriefResponse,
  TimetableResponse,
  TimetableAddRequest,
  TimetableModifyRequest,
  TimetableModifyThemeRequest,
  TimetableLectureAddRequest,
  TimetableLectureModifyRequest,
  CustomTimetableLectureAddRequest,
  ResetLectureRequestBody,
  // 강의 검색
  LectureSearchRequest,
  CursorPageLectureResponse,
  // 강의평
  CourseEvaluationDetailsResponse,
  CursorPageEvaluationResponse,
  EvaluationResponse,
  EvaluationWriteRequestBody,
  EvaluationUpdateRequestBody,
  EvaluationReportRequestBody,
  // 즐겨찾기
  BookmarkResponse,
  // 빈자리 알림
  VacancyNotificationLecturesResponse,
  // 알림
  CursorPageNotificationResponse,
  NotificationCountResponse,
  // 검색 태그 / 학기 / 수강편람
  TagListResponse,
  CourseTagListResponse,
  CoursebookResponse,
  SemesterStatusResponse,
  // 테마
  ThemeResponse,
  ThemeAddRequest,
  ThemeModifyRequest,
  // 친구
  FriendRequest,
  FriendResponse,
  UpdateFriendDisplayNameRequest,
  FriendRequestLinkResponse,
  YearAndSemesterResponse,
} from './schemas';

type AuthProvider = AuthProvidersResponse['authProviders'][number];

/** 친구 목록의 상태. ACTIVE: 친구, REQUESTED: 받은 요청, REQUESTING: 보낸 요청 */
type FriendState = 'ACTIVE' | 'REQUESTED' | 'REQUESTING';

const toQueryString = (query?: Record<string, string | undefined>) => {
  const entries = Object.entries(query ?? {}).filter((entry): entry is [string, string] => entry[1] !== undefined);
  return entries.length > 0 ? `?${new URLSearchParams(entries)}` : '';
};

export const getSnuttTimetableV2Apis = ({ callWithToken, callWithoutToken }: GetApiSpecsParameter) =>
  ({
    // ── 인증 ─────────────────────────────────────────────────────────────────
    'POST /v2/auth/login': ({ body }: { body: LoginLocalRequest }) =>
      callWithoutToken<SuccessResponse<TokenResponse>>({
        method: 'post',
        path: '/v2/auth/login',
        body,
      }),
    'POST /v2/auth/login/:provider': ({
      body,
      params,
    }: {
      body: SocialLoginRequest;
      params: { provider: AuthProvider };
    }) =>
      callWithoutToken<SuccessResponse<TokenResponse>>({
        method: 'post',
        path: `/v2/auth/login/${params.provider}`,
        body,
      }),
    'POST /v2/auth/register': ({ body }: { body: RegisterLocalRequest }) =>
      callWithoutToken<SuccessResponse<TokenResponse>>({
        method: 'post',
        path: '/v2/auth/register',
        body,
      }),
    // refresh token 은 쓸 때마다 새것으로 바뀌고, 쓴 것은 다시 쓸 수 없다
    'POST /v2/auth/refresh': ({ body }: { body: RefreshRequest }) =>
      callWithoutToken<SuccessResponse<TokenResponse>>({
        method: 'post',
        path: '/v2/auth/refresh',
        body,
      }),
    // refresh token 을 폐기한다. 응답 본문은 없다
    'POST /v2/auth/logout': ({ body }: { body: LogoutRequest }) =>
      callWithoutToken<SuccessResponse<never>>({
        method: 'post',
        path: '/v2/auth/logout',
        body,
      }),

    // ── 유저 ─────────────────────────────────────────────────────────────────
    'GET /v2/users/me': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<UserResponse>>({
        method: 'get',
        path: `/v2/users/me`,
        token,
      }),
    'PATCH /v2/users/me': ({ token, body }: { token: string; body: UpdateUserRequest }) =>
      callWithToken<SuccessResponse<UserResponse>>({
        method: 'patch',
        path: `/v2/users/me`,
        body,
        token,
      }),
    'DELETE /v2/users/me': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v2/users/me`,
        token,
      }),
    'POST /v2/users/me/social/:provider': ({
      token,
      body,
      params,
    }: {
      token: string;
      body: SocialTokenRequest;
      params: { provider: AuthProvider };
    }) =>
      callWithToken<SuccessResponse<AuthProvidersResponse>>({
        method: 'post',
        path: `/v2/users/me/social/${params.provider}`,
        body,
        token,
      }),
    'DELETE /v2/users/me/social/:provider': ({
      token,
      params,
    }: {
      token: string;
      params: { provider: AuthProvider };
    }) =>
      callWithToken<SuccessResponse<AuthProvidersResponse>>({
        method: 'delete',
        path: `/v2/users/me/social/${params.provider}`,
        token,
      }),
    'POST /v2/users/me/password': ({ token, body }: { token: string; body: AttachLocalRequest }) =>
      callWithToken<SuccessResponse<AuthProvidersResponse>>({
        method: 'post',
        path: `/v2/users/me/password`,
        body,
        token,
      }),
    'PATCH /v2/users/me/password': ({ token, body }: { token: string; body: ChangePasswordRequest }) =>
      callWithToken<SuccessResponse<ChangePasswordResponse>>({
        method: 'patch',
        path: `/v2/users/me/password`,
        body,
        token,
      }),

    // ── 시간표 ───────────────────────────────────────────────────────────────
    'GET /v2/timetables': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'get',
        path: `/v2/timetables`,
        token,
      }),
    'POST /v2/timetables': ({ token, body }: { token: string; body: TimetableAddRequest }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'post',
        path: `/v2/timetables`,
        body,
        token,
      }),
    'GET /v2/timetables/recent': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'get',
        path: `/v2/timetables/recent`,
        token,
      }),
    'GET /v2/timetables/:timetableId': ({ token, params }: { token: string; params: { timetableId: string } }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'get',
        path: `/v2/timetables/${params.timetableId}`,
        token,
      }),
    'PATCH /v2/timetables/:timetableId': ({
      token,
      body,
      params,
    }: {
      token: string;
      body: TimetableModifyRequest;
      params: { timetableId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'patch',
        path: `/v2/timetables/${params.timetableId}`,
        body,
        token,
      }),
    'DELETE /v2/timetables/:timetableId': ({ token, params }: { token: string; params: { timetableId: string } }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'delete',
        path: `/v2/timetables/${params.timetableId}`,
        token,
      }),
    'GET /v2/timetables/:year/:semester': ({
      token,
      params,
    }: {
      token: string;
      params: { year: string; semester: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse[]>>({
        method: 'get',
        path: `/v2/timetables/${params.year}/${params.semester}`,
        token,
      }),
    'PUT /v2/timetables/:timetableId/primary': ({
      token,
      params,
    }: {
      token: string;
      params: { timetableId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'put',
        path: `/v2/timetables/${params.timetableId}/primary`,
        token,
      }),
    'DELETE /v2/timetables/:timetableId/primary': ({
      token,
      params,
    }: {
      token: string;
      params: { timetableId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'delete',
        path: `/v2/timetables/${params.timetableId}/primary`,
        token,
      }),
    'POST /v2/timetables/:timetableId/copy': ({ token, params }: { token: string; params: { timetableId: string } }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'post',
        path: `/v2/timetables/${params.timetableId}/copy`,
        token,
      }),
    'PUT /v2/timetables/:timetableId/theme': ({
      token,
      body,
      params,
    }: {
      token: string;
      body: TimetableModifyThemeRequest;
      params: { timetableId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'put',
        path: `/v2/timetables/${params.timetableId}/theme`,
        body,
        token,
      }),

    // ── 시간표 강의 ──────────────────────────────────────────────────────────
    'POST /v2/timetables/:timetableId/lectures': ({
      token,
      body,
      params,
    }: {
      token: string;
      body: TimetableLectureAddRequest;
      params: { timetableId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'post',
        path: `/v2/timetables/${params.timetableId}/lectures`,
        body,
        token,
      }),
    'POST /v2/timetables/:timetableId/lectures/custom': ({
      token,
      body,
      params,
    }: {
      token: string;
      body: CustomTimetableLectureAddRequest;
      params: { timetableId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'post',
        path: `/v2/timetables/${params.timetableId}/lectures/custom`,
        body,
        token,
      }),
    'PATCH /v2/timetables/:timetableId/lectures/:timetableLectureId': ({
      token,
      body,
      params,
    }: {
      token: string;
      body: TimetableLectureModifyRequest;
      params: { timetableId: string; timetableLectureId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'patch',
        path: `/v2/timetables/${params.timetableId}/lectures/${params.timetableLectureId}`,
        body,
        token,
      }),
    'DELETE /v2/timetables/:timetableId/lectures/:timetableLectureId': ({
      token,
      params,
    }: {
      token: string;
      params: { timetableId: string; timetableLectureId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'delete',
        path: `/v2/timetables/${params.timetableId}/lectures/${params.timetableLectureId}`,
        token,
      }),
    'POST /v2/timetables/:timetableId/lectures/:timetableLectureId/reset': ({
      token,
      body,
      params,
    }: {
      token: string;
      body: ResetLectureRequestBody;
      params: { timetableId: string; timetableLectureId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'post',
        path: `/v2/timetables/${params.timetableId}/lectures/${params.timetableLectureId}/reset`,
        body,
        token,
      }),

    // ── 강의 검색 ────────────────────────────────────────────────────────────
    'POST /v2/lectures/search': ({ body }: { body: LectureSearchRequest }) =>
      callWithoutToken<SuccessResponse<CursorPageLectureResponse>>({
        method: 'post',
        path: '/v2/lectures/search',
        body,
      }),

    // ── 강의평 ───────────────────────────────────────────────────────────────
    // 강의평은 강좌(courseId, 같은 과목 · 교수의 여러 학기 강의를 묶은 것) 단위로 모인다. 쓸 때만 강의(lectureId)를 고른다
    'GET /v2/courses/:courseId/evaluation-summary': ({
      token,
      params,
    }: {
      token: string;
      params: { courseId: string };
    }) =>
      callWithToken<SuccessResponse<CourseEvaluationDetailsResponse>>({
        method: 'get',
        path: `/v2/courses/${params.courseId}/evaluation-summary`,
        token,
      }),
    'GET /v2/courses/:courseId/evaluations': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { courseId: string };
      query?: { cursor?: string; sort?: 'LATEST' | 'RECOMMENDED'; year?: string; semester?: string };
    }) =>
      callWithToken<SuccessResponse<CursorPageEvaluationResponse>>({
        method: 'get',
        path: `/v2/courses/${params.courseId}/evaluations${toQueryString(query)}`,
        token,
      }),
    'GET /v2/courses/:courseId/evaluations/me': ({ token, params }: { token: string; params: { courseId: string } }) =>
      callWithToken<SuccessResponse<EvaluationResponse[]>>({
        method: 'get',
        path: `/v2/courses/${params.courseId}/evaluations/me`,
        token,
      }),
    'POST /v2/lectures/:lectureId/evaluations': ({
      token,
      params,
      body,
    }: {
      token: string;
      params: { lectureId: string };
      body: EvaluationWriteRequestBody;
    }) =>
      callWithToken<SuccessResponse<EvaluationResponse>>({
        method: 'post',
        path: `/v2/lectures/${params.lectureId}/evaluations`,
        body,
        token,
      }),
    'PATCH /v2/evaluations/:evaluationId': ({
      token,
      params,
      body,
    }: {
      token: string;
      params: { evaluationId: string };
      body: EvaluationUpdateRequestBody;
    }) =>
      callWithToken<SuccessResponse<EvaluationResponse>>({
        method: 'patch',
        path: `/v2/evaluations/${params.evaluationId}`,
        body,
        token,
      }),
    'DELETE /v2/evaluations/:evaluationId': ({ token, params }: { token: string; params: { evaluationId: string } }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v2/evaluations/${params.evaluationId}`,
        token,
      }),
    'POST /v2/evaluations/:evaluationId/like': ({
      token,
      params,
    }: {
      token: string;
      params: { evaluationId: string };
    }) =>
      callWithToken<SuccessResponse<EvaluationResponse>>({
        method: 'post',
        path: `/v2/evaluations/${params.evaluationId}/like`,
        token,
      }),
    'DELETE /v2/evaluations/:evaluationId/like': ({
      token,
      params,
    }: {
      token: string;
      params: { evaluationId: string };
    }) =>
      callWithToken<SuccessResponse<EvaluationResponse>>({
        method: 'delete',
        path: `/v2/evaluations/${params.evaluationId}/like`,
        token,
      }),
    'POST /v2/evaluations/:evaluationId/report': ({
      token,
      params,
      body,
    }: {
      token: string;
      params: { evaluationId: string };
      body: EvaluationReportRequestBody;
    }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'post',
        path: `/v2/evaluations/${params.evaluationId}/report`,
        body,
        token,
      }),

    // ── 즐겨찾기 ─────────────────────────────────────────────────────────────
    'GET /v2/bookmarks': ({ token, query }: { token: string; query: { year: string; semester: string } }) =>
      callWithToken<SuccessResponse<BookmarkResponse>>({
        method: 'get',
        path: `/v2/bookmarks${toQueryString(query)}`,
        token,
      }),
    'POST /v2/bookmarks/lectures/:lectureId': ({ token, params }: { token: string; params: { lectureId: string } }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'post',
        path: `/v2/bookmarks/lectures/${params.lectureId}`,
        token,
      }),
    'DELETE /v2/bookmarks/lectures/:lectureId': ({ token, params }: { token: string; params: { lectureId: string } }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v2/bookmarks/lectures/${params.lectureId}`,
        token,
      }),
    'GET /v2/bookmarks/lectures/:lectureId/state': ({
      token,
      params,
    }: {
      token: string;
      params: { lectureId: string };
    }) =>
      callWithToken<SuccessResponse<boolean>>({
        method: 'get',
        path: `/v2/bookmarks/lectures/${params.lectureId}/state`,
        token,
      }),

    // ── 빈자리 알림 ──────────────────────────────────────────────────────────
    'GET /v2/vacancy-notifications/lectures': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<VacancyNotificationLecturesResponse>>({
        method: 'get',
        path: `/v2/vacancy-notifications/lectures`,
        token,
      }),
    'POST /v2/vacancy-notifications/lectures/:lectureId': ({
      token,
      params,
    }: {
      token: string;
      params: { lectureId: string };
    }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'post',
        path: `/v2/vacancy-notifications/lectures/${params.lectureId}`,
        token,
      }),
    'DELETE /v2/vacancy-notifications/lectures/:lectureId': ({
      token,
      params,
    }: {
      token: string;
      params: { lectureId: string };
    }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v2/vacancy-notifications/lectures/${params.lectureId}`,
        token,
      }),
    'GET /v2/vacancy-notifications/lectures/:lectureId/state': ({
      token,
      params,
    }: {
      token: string;
      params: { lectureId: string };
    }) =>
      callWithToken<SuccessResponse<boolean>>({
        method: 'get',
        path: `/v2/vacancy-notifications/lectures/${params.lectureId}/state`,
        token,
      }),

    // ── 알림 ─────────────────────────────────────────────────────────────────
    'GET /v2/notifications': ({
      token,
      query,
    }: {
      token: string;
      query?: { cursor?: string; limit?: string; explicit?: 'true' | 'false' };
    }) =>
      callWithToken<SuccessResponse<CursorPageNotificationResponse>>({
        method: 'get',
        path: `/v2/notifications${toQueryString(query)}`,
        token,
      }),
    'GET /v2/notifications/count': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<NotificationCountResponse>>({
        method: 'get',
        path: `/v2/notifications/count`,
        token,
      }),

    // ── 검색 태그 ────────────────────────────────────────────────────────────
    'GET /v2/tags/:year/:semester': ({
      token,
      params,
    }: {
      token: string;
      params: { year: string; semester: string };
    }) =>
      callWithToken<SuccessResponse<TagListResponse>>({
        method: 'get',
        path: `/v2/tags/${params.year}/${params.semester}`,
        token,
      }),
    'GET /v2/tags/courses': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<CourseTagListResponse>>({
        method: 'get',
        path: '/v2/tags/courses',
        token,
      }),

    // ── 수강편람 / 학기 ──────────────────────────────────────────────────────
    'GET /v2/coursebooks': () =>
      callWithoutToken<SuccessResponse<CoursebookResponse[]>>({
        method: 'get',
        path: '/v2/coursebooks',
      }),
    'GET /v2/coursebooks/recent': () =>
      callWithoutToken<SuccessResponse<CoursebookResponse>>({
        method: 'get',
        path: '/v2/coursebooks/recent',
      }),
    'GET /v2/semesters/status': () =>
      callWithoutToken<SuccessResponse<SemesterStatusResponse>>({
        method: 'get',
        path: '/v2/semesters/status',
      }),

    // ── 테마 ─────────────────────────────────────────────────────────────────
    'GET /v2/themes': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<ThemeResponse[]>>({
        method: 'get',
        path: `/v2/themes`,
        token,
      }),
    'POST /v2/themes': ({ token, body }: { token: string; body: ThemeAddRequest }) =>
      callWithToken<SuccessResponse<ThemeResponse[]>>({
        method: 'post',
        path: `/v2/themes`,
        body,
        token,
      }),
    'GET /v2/themes/:themeId': ({ token, params }: { token: string; params: { themeId: string } }) =>
      callWithToken<SuccessResponse<ThemeResponse>>({
        method: 'get',
        path: `/v2/themes/${params.themeId}`,
        token,
      }),
    'PATCH /v2/themes/:themeId': ({
      token,
      body,
      params,
    }: {
      token: string;
      body: ThemeModifyRequest;
      params: { themeId: string };
    }) =>
      callWithToken<SuccessResponse<ThemeResponse[]>>({
        method: 'patch',
        path: `/v2/themes/${params.themeId}`,
        body,
        token,
      }),
    'DELETE /v2/themes/:themeId': ({ token, params }: { token: string; params: { themeId: string } }) =>
      callWithToken<SuccessResponse<ThemeResponse[]>>({
        method: 'delete',
        path: `/v2/themes/${params.themeId}`,
        token,
      }),
    'POST /v2/themes/:themeId/copy': ({ token, params }: { token: string; params: { themeId: string } }) =>
      callWithToken<SuccessResponse<ThemeResponse[]>>({
        method: 'post',
        path: `/v2/themes/${params.themeId}/copy`,
        token,
      }),
    'POST /v2/themes/:themeId/default': ({ token, params }: { token: string; params: { themeId: string } }) =>
      callWithToken<SuccessResponse<ThemeResponse[]>>({
        method: 'post',
        path: `/v2/themes/${params.themeId}/default`,
        token,
      }),
    'DELETE /v2/themes/:themeId/default': ({ token, params }: { token: string; params: { themeId: string } }) =>
      callWithToken<SuccessResponse<ThemeResponse[]>>({
        method: 'delete',
        path: `/v2/themes/${params.themeId}/default`,
        token,
      }),
    // ── 친구 ─────────────────────────────────────────────────────────────────
    'GET /v2/friends': ({ token, query }: { token: string; query: { state: FriendState } }) =>
      callWithToken<SuccessResponse<FriendResponse[]>>({
        method: 'get',
        path: `/v2/friends${toQueryString(query)}`,
        token,
      }),
    // 닉네임(`닉네임#0000` 의 이름과 태그)으로 친구 요청을 보낸다
    'POST /v2/friends': ({ token, body }: { token: string; body: FriendRequest }) =>
      callWithToken<SuccessResponse<FriendResponse>>({
        method: 'post',
        path: `/v2/friends`,
        body,
        token,
      }),
    // 친구 끊기. 보낸 요청을 취소할 때도 쓴다. 응답 본문은 없다
    'DELETE /v2/friends/:friendId': ({ token, params }: { token: string; params: { friendId: string } }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v2/friends/${params.friendId}`,
        token,
      }),
    'POST /v2/friends/:friendId/accept': ({ token, params }: { token: string; params: { friendId: string } }) =>
      callWithToken<SuccessResponse<FriendResponse>>({
        method: 'post',
        path: `/v2/friends/${params.friendId}/accept`,
        token,
      }),
    // 응답 본문은 없다
    'POST /v2/friends/:friendId/decline': ({ token, params }: { token: string; params: { friendId: string } }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'post',
        path: `/v2/friends/${params.friendId}/decline`,
        token,
      }),
    'PATCH /v2/friends/:friendId/display-name': ({
      token,
      body,
      params,
    }: {
      token: string;
      body: UpdateFriendDisplayNameRequest;
      params: { friendId: string };
    }) =>
      callWithToken<SuccessResponse<FriendResponse>>({
        method: 'patch',
        path: `/v2/friends/${params.friendId}/display-name`,
        body,
        token,
      }),
    // 카카오 링크로 보낼 친구 요청 토큰
    'GET /v2/friends/generate-link': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<FriendRequestLinkResponse>>({
        method: 'get',
        path: `/v2/friends/generate-link`,
        token,
      }),
    'POST /v2/friends/accept-link/:requestToken': ({
      token,
      params,
    }: {
      token: string;
      params: { requestToken: string };
    }) =>
      callWithToken<SuccessResponse<FriendResponse>>({
        method: 'post',
        path: `/v2/friends/accept-link/${params.requestToken}`,
        token,
      }),
    // 친구의 학기 기본 시간표
    'GET /v2/friends/:friendId/primary-table': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { friendId: string };
      query: { year: string; semester: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'get',
        path: `/v2/friends/${params.friendId}/primary-table${toQueryString(query)}`,
        token,
      }),
    // 친구가 기본 시간표를 가진 학기 목록
    'GET /v2/friends/:friendId/coursebooks': ({ token, params }: { token: string; params: { friendId: string } }) =>
      callWithToken<SuccessResponse<YearAndSemesterResponse[]>>({
        method: 'get',
        path: `/v2/friends/${params.friendId}/coursebooks`,
        token,
      }),
  }) satisfies Record<string, Api>;
