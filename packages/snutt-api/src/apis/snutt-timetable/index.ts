import { Api, GetApiSpecsParameter } from '..';
import { SuccessResponse, ErrorResponse } from '../../response';
import {
  LocalLoginRequest,
  LoginResponse,
  NotificationResponse,
  SearchQueryLegacy,
  LectureDto,
  UserLegacyDto,
  OkResponse,
  TimetableBriefDto,
  TimetableLegacyDto,
  TimetableAddRequestDto,
  TimetableLectureModifyLegacyRequestDto,
  CustomTimetableLectureAddLegacyRequestDto,
  TimetableModifyRequestDto,
  BookmarkResponse,
  TimetableDto,
} from './schemas';

export const getSnuttTimetableApis = ({ callWithToken, callWithoutToken }: GetApiSpecsParameter) =>
  ({
    'POST /v1/auth/login_local': ({ body }: { body: LocalLoginRequest }) =>
      callWithoutToken<SuccessResponse<LoginResponse> | ErrorResponse<403, 8197>>({
        method: 'post',
        path: '/v1/auth/login_local',
        body,
      }),
    'POST /v1/auth/register_local': ({ body }: { body: { id: string; password: string } }) =>
      callWithoutToken<SuccessResponse<LoginResponse> | ErrorResponse<403, 1229>>({
        method: 'post',
        path: `/v1/auth/register_local`,
        body,
      }),
    'DELETE /v1/user/account': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<OkResponse>>({
        method: 'delete',
        path: `/v1/user/account`,
        token,
      }),
    'GET /v1/user/info': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<UserLegacyDto>>({
        method: 'get',
        path: `/v1/user/info`,
        token,
      }),
    'GET /v1/notification': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<NotificationResponse[]>>({
        method: 'get',
        path: `/v1/notification`,
        token,
      }),
    'POST /v1/search_query': ({ body, token }: { body: SearchQueryLegacy; token: string }) =>
      callWithToken<SuccessResponse<LectureDto[]>>({
        method: 'post',
        path: `/v1/search_query`,
        body,
        token,
      }),
    'GET /v1/bookmarks': ({ token, query }: { token: string; query: { year: string; semester: string } }) =>
      callWithToken<SuccessResponse<BookmarkResponse>>({
        method: 'get',
        path: `/v1/bookmarks?${new URLSearchParams(query)}`,
        token,
      }),
    'POST /v1/bookmarks/lecture': ({ token, body }: { token: string; body: { lecture_id: string } }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'post',
        path: `/v1/bookmarks/lecture`,
        body,
        token,
      }),
    'DELETE /v1/bookmarks/lecture': ({ token, body }: { token: string; body: { lecture_id: string } }) =>
      callWithToken<SuccessResponse<never>>({
        method: 'delete',
        path: `/v1/bookmarks/lecture`,
        body,
        token,
      }),
    'GET /v1/tables': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<TimetableBriefDto[]>>({
        method: 'get',
        path: `/v1/tables`,
        token,
      }),
    'GET /v1/tables/:timetableId': ({ token, params }: { token: string; params: { timetableId: string } }) =>
      callWithToken<SuccessResponse<TimetableDto>>({
        method: 'get',
        path: `/v1/tables/${params.timetableId}`,
        token,
      }),
    'DELETE /v1/tables/:timetableId': ({ token, params }: { token: string; params: { timetableId: string } }) =>
      callWithToken<SuccessResponse<TimetableBriefDto[]>>({
        method: 'delete',
        path: `/v1/tables/${params.timetableId}`,
        token,
      }),
    'POST /v1/tables': ({ body, token }: { body: TimetableAddRequestDto; token: string }) =>
      callWithToken<SuccessResponse<TimetableBriefDto[]>>({
        method: 'post',
        path: `/v1/tables`,
        body,
        token,
      }),
    'PUT /v1/tables/:timetableId/lecture/:timetableLectureId': ({
      body,
      token,
      params,
    }: {
      body: TimetableLectureModifyLegacyRequestDto;
      token: string;
      params: { timetableId: string; timetableLectureId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableLegacyDto>>({
        method: 'put',
        path: `/v1/tables/${params.timetableId}/lecture/${params.timetableLectureId}`,
        body,
        token,
      }),
    'POST /v1/tables/:timetableId/lecture': ({
      body,
      token,
      params,
    }: {
      body: CustomTimetableLectureAddLegacyRequestDto;
      token: string;
      params: { timetableId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableLegacyDto>>({
        method: 'post',
        path: `/v1/tables/${params.timetableId}/lecture`,
        body,
        token,
      }),
    'DELETE /v1/tables/:timetableId/lecture/:timetableLectureId': ({
      token,
      params,
    }: {
      token: string;
      params: { timetableId: string; timetableLectureId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableLegacyDto>>({
        method: 'delete',
        path: `/v1/tables/${params.timetableId}/lecture/${params.timetableLectureId}`,
        token,
      }),
    'POST /v1/tables/:timetableId/lecture/:timetableLectureId': ({
      token,
      params,
    }: {
      token: string;
      params: { timetableId: string; timetableLectureId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableLegacyDto>>({
        method: 'post',
        path: `/v1/tables/${params.timetableId}/lecture/${params.timetableLectureId}`,
        token,
      }),
    'PUT /v1/tables/:timetableId': ({
      body,
      token,
      params,
    }: {
      body: TimetableModifyRequestDto;
      token: string;
      params: { timetableId: string };
    }) =>
      callWithToken<SuccessResponse<TimetableBriefDto[]>>({
        method: 'put',
        path: `/v1/tables/${params.timetableId}`,
        body,
        token,
      }),
  }) satisfies Record<string, Api>;
