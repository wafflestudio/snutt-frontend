import { Api, GetApiSpecsParameter } from '..';
import { SuccessResponse, ErrorResponse } from '../../response';
import { LocalLoginRequest, LoginResponse, NotificationResponse, SearchQueryLegacy, LectureDto } from './schemas';

export const getSnuttTimetableApis = ({ callWithToken, callWithoutToken }: GetApiSpecsParameter) =>
  ({
    'POST /v1/auth/login_local': ({ body }: { body: LocalLoginRequest }) =>
      callWithoutToken<SuccessResponse<LoginResponse> | ErrorResponse<403, 8197>>({
        method: 'post',
        path: '/v1/auth/login_local',
        body,
      }),
    'POST /v1/auth/register_local': ({ body }: { body: { id: string; password: string } }) =>
      callWithoutToken<SuccessResponse<{ message: 'ok'; token: string; user_id: string }> | ErrorResponse<403, 1229>>({
        method: 'post',
        path: `/v1/auth/register_local`,
        body,
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
  }) satisfies Record<string, Api>;
