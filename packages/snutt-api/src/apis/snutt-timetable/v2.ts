import { Api, GetApiSpecsParameter } from '..';
import { SuccessResponse } from '../../response';
import {
  // 인증
  LoginLocalRequest,
  SocialLoginRequest,
  RegisterLocalRequest,
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
} from './schemas';

export const getSnuttTimetableV2Apis = ({ callWithToken, callWithoutToken }: GetApiSpecsParameter) =>
  ({
    // ── 인증 ─────────────────────────────────────────────────────────────────
    'POST /v2/auth/login': ({ body }: { body: LoginLocalRequest }) =>
      callWithoutToken<SuccessResponse<TokenResponse>>({
        method: 'post',
        path: '/v2/auth/login',
        body,
      }),
    'POST /v2/auth/login/:provider': ({ body, params }: { body: SocialLoginRequest; params: { provider: string } }) =>
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

    // ── 유저 ─────────────────────────────────────────────────────────────────
    'GET /v2/users/me': ({ token, query }: { token: string; query: { userId: string } }) =>
      callWithToken<SuccessResponse<UserResponse>>({
        method: 'get',
        path: `/v2/users/me?${new URLSearchParams(query)}`,
        token,
      }),
    'PATCH /v2/users/me': ({
      token,
      body,
      query,
    }: {
      token: string;
      body: UpdateUserRequest;
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<UserResponse>>({
        method: 'patch',
        path: `/v2/users/me?${new URLSearchParams(query)}`,
        body,
        token,
      }),
    'DELETE /v2/users/me': ({ token, query }: { token: string; query: { userId: string } }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v2/users/me?${new URLSearchParams(query)}`,
        token,
      }),
    'POST /v2/users/me/social/:provider': ({
      token,
      body,
      params,
      query,
    }: {
      token: string;
      body: SocialTokenRequest;
      params: { provider: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<AuthProvidersResponse>>({
        method: 'post',
        path: `/v2/users/me/social/${params.provider}?${new URLSearchParams(query)}`,
        body,
        token,
      }),
    'DELETE /v2/users/me/social/:provider': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { provider: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<AuthProvidersResponse>>({
        method: 'delete',
        path: `/v2/users/me/social/${params.provider}?${new URLSearchParams(query)}`,
        token,
      }),
    'POST /v2/users/me/password': ({
      token,
      body,
      query,
    }: {
      token: string;
      body: AttachLocalRequest;
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<AuthProvidersResponse>>({
        method: 'post',
        path: `/v2/users/me/password?${new URLSearchParams(query)}`,
        body,
        token,
      }),
    'PATCH /v2/users/me/password': ({
      token,
      body,
      query,
    }: {
      token: string;
      body: ChangePasswordRequest;
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<ChangePasswordResponse>>({
        method: 'patch',
        path: `/v2/users/me/password?${new URLSearchParams(query)}`,
        body,
        token,
      }),

    // ── 시간표 ───────────────────────────────────────────────────────────────
    'GET /v2/timetables': ({ token, query }: { token: string; query: { userId: string } }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'get',
        path: `/v2/timetables?${new URLSearchParams(query)}`,
        token,
      }),
    'POST /v2/timetables': ({
      token,
      body,
      query,
    }: {
      token: string;
      body: TimetableAddRequest;
      query: { userId: string; source?: string };
    }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'post',
        path: `/v2/timetables?${new URLSearchParams(query)}`,
        body,
        token,
      }),
    'GET /v2/timetables/recent': ({ token, query }: { token: string; query: { userId: string } }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'get',
        path: `/v2/timetables/recent?${new URLSearchParams(query)}`,
        token,
      }),
    'GET /v2/timetables/:timetableId': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { timetableId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'get',
        path: `/v2/timetables/${params.timetableId}?${new URLSearchParams(query)}`,
        token,
      }),
    'PATCH /v2/timetables/:timetableId': ({
      token,
      body,
      params,
      query,
    }: {
      token: string;
      body: TimetableModifyRequest;
      params: { timetableId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'patch',
        path: `/v2/timetables/${params.timetableId}?${new URLSearchParams(query)}`,
        body,
        token,
      }),
    'DELETE /v2/timetables/:timetableId': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { timetableId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'delete',
        path: `/v2/timetables/${params.timetableId}?${new URLSearchParams(query)}`,
        token,
      }),
    'GET /v2/timetables/:year/:semester': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { year: string; semester: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse[]>>({
        method: 'get',
        path: `/v2/timetables/${params.year}/${params.semester}?${new URLSearchParams(query)}`,
        token,
      }),
    'PUT /v2/timetables/:timetableId/primary': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { timetableId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'put',
        path: `/v2/timetables/${params.timetableId}/primary?${new URLSearchParams(query)}`,
        token,
      }),
    'DELETE /v2/timetables/:timetableId/primary': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { timetableId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v2/timetables/${params.timetableId}/primary?${new URLSearchParams(query)}`,
        token,
      }),
    'POST /v2/timetables/:timetableId/copy': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { timetableId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'post',
        path: `/v2/timetables/${params.timetableId}/copy?${new URLSearchParams(query)}`,
        token,
      }),
    'PUT /v2/timetables/:timetableId/theme': ({
      token,
      body,
      params,
      query,
    }: {
      token: string;
      body: TimetableModifyThemeRequest;
      params: { timetableId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'put',
        path: `/v2/timetables/${params.timetableId}/theme?${new URLSearchParams(query)}`,
        body,
        token,
      }),

    // ── 시간표 강의 ──────────────────────────────────────────────────────────
    'POST /v2/timetables/:timetableId/lectures': ({
      token,
      body,
      params,
      query,
    }: {
      token: string;
      body: TimetableLectureAddRequest;
      params: { timetableId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'post',
        path: `/v2/timetables/${params.timetableId}/lectures?${new URLSearchParams(query)}`,
        body,
        token,
      }),
    'POST /v2/timetables/:timetableId/lectures/custom': ({
      token,
      body,
      params,
      query,
    }: {
      token: string;
      body: CustomTimetableLectureAddRequest;
      params: { timetableId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'post',
        path: `/v2/timetables/${params.timetableId}/lectures/custom?${new URLSearchParams(query)}`,
        body,
        token,
      }),
    'PATCH /v2/timetables/:timetableId/lectures/:timetableLectureId': ({
      token,
      body,
      params,
      query,
    }: {
      token: string;
      body: TimetableLectureModifyRequest;
      params: { timetableId: string; timetableLectureId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'patch',
        path: `/v2/timetables/${params.timetableId}/lectures/${params.timetableLectureId}?${new URLSearchParams(query)}`,
        body,
        token,
      }),
    'DELETE /v2/timetables/:timetableId/lectures/:timetableLectureId': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { timetableId: string; timetableLectureId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'delete',
        path: `/v2/timetables/${params.timetableId}/lectures/${params.timetableLectureId}?${new URLSearchParams(query)}`,
        token,
      }),
    'POST /v2/timetables/:timetableId/lectures/:timetableLectureId/reset': ({
      token,
      body,
      params,
      query,
    }: {
      token: string;
      body: ResetLectureRequestBody;
      params: { timetableId: string; timetableLectureId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableResponse>>({
        method: 'post',
        path: `/v2/timetables/${params.timetableId}/lectures/${params.timetableLectureId}/reset?${new URLSearchParams(query)}`,
        body,
        token,
      }),

    // ── 강의 검색 ────────────────────────────────────────────────────────────
    'POST /v2/lectures/search': ({ body, token }: { body: LectureSearchRequest; token: string }) =>
      callWithToken<SuccessResponse<CursorPageLectureResponse>>({
        method: 'post',
        path: '/v2/lectures/search',
        body,
        token,
      }),

    // ── 즐겨찾기 ─────────────────────────────────────────────────────────────
    'GET /v2/bookmarks': ({
      token,
      query,
    }: {
      token: string;
      query: { userId: string; year: string; semester: string };
    }) =>
      callWithToken<SuccessResponse<BookmarkResponse>>({
        method: 'get',
        path: `/v2/bookmarks?${new URLSearchParams(query)}`,
        token,
      }),
    'POST /v2/bookmarks/lectures/:lectureId': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { lectureId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'post',
        path: `/v2/bookmarks/lectures/${params.lectureId}?${new URLSearchParams(query)}`,
        token,
      }),
    'DELETE /v2/bookmarks/lectures/:lectureId': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { lectureId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v2/bookmarks/lectures/${params.lectureId}?${new URLSearchParams(query)}`,
        token,
      }),
    'GET /v2/bookmarks/lectures/:lectureId/state': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { lectureId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<boolean>>({
        method: 'get',
        path: `/v2/bookmarks/lectures/${params.lectureId}/state?${new URLSearchParams(query)}`,
        token,
      }),

    // ── 빈자리 알림 ──────────────────────────────────────────────────────────
    'GET /v2/vacancy-notifications/lectures': ({ token, query }: { token: string; query: { userId: string } }) =>
      callWithToken<SuccessResponse<VacancyNotificationLecturesResponse>>({
        method: 'get',
        path: `/v2/vacancy-notifications/lectures?${new URLSearchParams(query)}`,
        token,
      }),
    'POST /v2/vacancy-notifications/lectures/:lectureId': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { lectureId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'post',
        path: `/v2/vacancy-notifications/lectures/${params.lectureId}?${new URLSearchParams(query)}`,
        token,
      }),
    'DELETE /v2/vacancy-notifications/lectures/:lectureId': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { lectureId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v2/vacancy-notifications/lectures/${params.lectureId}?${new URLSearchParams(query)}`,
        token,
      }),
    'GET /v2/vacancy-notifications/lectures/:lectureId/state': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { lectureId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<boolean>>({
        method: 'get',
        path: `/v2/vacancy-notifications/lectures/${params.lectureId}/state?${new URLSearchParams(query)}`,
        token,
      }),

    // ── 알림 ─────────────────────────────────────────────────────────────────
    'GET /v2/notifications': ({
      token,
      query,
    }: {
      token: string;
      query: { userId: string; cursor?: string; limit?: string; explicit?: string };
    }) =>
      callWithToken<SuccessResponse<CursorPageNotificationResponse>>({
        method: 'get',
        path: `/v2/notifications?${new URLSearchParams(query)}`,
        token,
      }),
    'GET /v2/notifications/count': ({ token, query }: { token: string; query: { userId: string } }) =>
      callWithToken<SuccessResponse<NotificationCountResponse>>({
        method: 'get',
        path: `/v2/notifications/count?${new URLSearchParams(query)}`,
        token,
      }),

    // ── 검색 태그 ────────────────────────────────────────────────────────────
    'GET /v2/tags/:year/:semester': ({ params }: { params: { year: string; semester: string } }) =>
      callWithoutToken<SuccessResponse<TagListResponse>>({
        method: 'get',
        path: `/v2/tags/${params.year}/${params.semester}`,
      }),
    'GET /v2/tags/courses': () =>
      callWithoutToken<SuccessResponse<CourseTagListResponse>>({
        method: 'get',
        path: '/v2/tags/courses',
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
    'GET /v2/themes': ({ token, query }: { token: string; query: { userId: string } }) =>
      callWithToken<SuccessResponse<ThemeResponse[]>>({
        method: 'get',
        path: `/v2/themes?${new URLSearchParams(query)}`,
        token,
      }),
    'POST /v2/themes': ({ token, body, query }: { token: string; body: ThemeAddRequest; query: { userId: string } }) =>
      callWithToken<SuccessResponse<ThemeResponse>>({
        method: 'post',
        path: `/v2/themes?${new URLSearchParams(query)}`,
        body,
        token,
      }),
    'GET /v2/themes/:themeId': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { themeId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<ThemeResponse>>({
        method: 'get',
        path: `/v2/themes/${params.themeId}?${new URLSearchParams(query)}`,
        token,
      }),
    'PATCH /v2/themes/:themeId': ({
      token,
      body,
      params,
      query,
    }: {
      token: string;
      body: ThemeModifyRequest;
      params: { themeId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<ThemeResponse>>({
        method: 'patch',
        path: `/v2/themes/${params.themeId}?${new URLSearchParams(query)}`,
        body,
        token,
      }),
    'DELETE /v2/themes/:themeId': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { themeId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v2/themes/${params.themeId}?${new URLSearchParams(query)}`,
        token,
      }),
    'POST /v2/themes/:themeId/copy': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { themeId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<ThemeResponse>>({
        method: 'post',
        path: `/v2/themes/${params.themeId}/copy?${new URLSearchParams(query)}`,
        token,
      }),
    'POST /v2/themes/:themeId/default': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { themeId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<ThemeResponse>>({
        method: 'post',
        path: `/v2/themes/${params.themeId}/default?${new URLSearchParams(query)}`,
        token,
      }),
    'DELETE /v2/themes/:themeId/default': ({
      token,
      params,
      query,
    }: {
      token: string;
      params: { themeId: string };
      query: { userId: string };
    }) =>
      callWithToken<SuccessResponse<ThemeResponse>>({
        method: 'delete',
        path: `/v2/themes/${params.themeId}/default?${new URLSearchParams(query)}`,
        token,
      }),
  }) satisfies Record<string, Api>;
