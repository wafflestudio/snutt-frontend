import { Api, GetApiSpecsParameter } from '../..';
import { SuccessResponse } from '../../../response';
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
      params: { provider: string };
    }) =>
      callWithToken<SuccessResponse<AuthProvidersResponse>>({
        method: 'post',
        path: `/v2/users/me/social/${params.provider}`,
        body,
        token,
      }),
    'DELETE /v2/users/me/social/:provider': ({ token, params }: { token: string; params: { provider: string } }) =>
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
    'POST /v2/timetables': ({
      token,
      body,
      query,
    }: {
      token: string;
      body: TimetableAddRequest;
      query?: { source?: string };
    }) =>
      callWithToken<SuccessResponse<TimetableBriefResponse[]>>({
        method: 'post',
        path: `/v2/timetables${toQueryString(query)}`,
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
      callWithToken<SuccessResponse<never>>({
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
      callWithToken<SuccessResponse<never>>({
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
    'POST /v2/lectures/search': ({ body, token }: { body: LectureSearchRequest; token: string }) =>
      callWithToken<SuccessResponse<CursorPageLectureResponse>>({
        method: 'post',
        path: '/v2/lectures/search',
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
      query?: { cursor?: string; limit?: string; explicit?: string };
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
    'GET /v2/themes': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<ThemeResponse[]>>({
        method: 'get',
        path: `/v2/themes`,
        token,
      }),
    'POST /v2/themes': ({ token, body }: { token: string; body: ThemeAddRequest }) =>
      callWithToken<SuccessResponse<ThemeResponse>>({
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
      callWithToken<SuccessResponse<ThemeResponse>>({
        method: 'patch',
        path: `/v2/themes/${params.themeId}`,
        body,
        token,
      }),
    'DELETE /v2/themes/:themeId': ({ token, params }: { token: string; params: { themeId: string } }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v2/themes/${params.themeId}`,
        token,
      }),
    'POST /v2/themes/:themeId/copy': ({ token, params }: { token: string; params: { themeId: string } }) =>
      callWithToken<SuccessResponse<ThemeResponse>>({
        method: 'post',
        path: `/v2/themes/${params.themeId}/copy`,
        token,
      }),
    'POST /v2/themes/:themeId/default': ({ token, params }: { token: string; params: { themeId: string } }) =>
      callWithToken<SuccessResponse<ThemeResponse>>({
        method: 'post',
        path: `/v2/themes/${params.themeId}/default`,
        token,
      }),
    'DELETE /v2/themes/:themeId/default': ({ token, params }: { token: string; params: { themeId: string } }) =>
      callWithToken<SuccessResponse<ThemeResponse>>({
        method: 'delete',
        path: `/v2/themes/${params.themeId}/default`,
        token,
      }),
  }) satisfies Record<string, Api>;
