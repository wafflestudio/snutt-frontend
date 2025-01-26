import { Api, GetApiSpecsParameter } from '..';
import { SuccessResponse, ErrorResponse } from '../../response';
import { UserAuthProviderInfo } from './schemas';

export const getSnuttApis = ({ callWithToken, callWithoutToken }: GetApiSpecsParameter) =>
  ({
    'POST /auth/login/facebook': ({ body }: { body: { token: string } }) =>
      callWithoutToken<SuccessResponse<{ token: string; user_id: string }> | ErrorResponse<403, 4097>>({
        method: 'post',
        path: `/v1/auth/login/facebook`,
        body,
      }),
    'POST /auth/login/google': ({ body }: { body: { token: string } }) =>
      callWithoutToken<SuccessResponse<{ token: string; user_id: string }> | ErrorResponse<403, 4097>>({
        method: 'post',
        path: `/v1/auth/login/google`,
        body,
      }),
    'POST /auth/login/kakao': ({ body }: { body: { token: string } }) =>
      callWithoutToken<SuccessResponse<{ token: string; user_id: string }> | ErrorResponse<403, 4097>>({
        method: 'post',
        path: `/v1/auth/login/kakao`,
        body,
      }),
    'POST /auth/login_fb': ({ body }: { body: { fb_id: string; fb_token: string } }) =>
      callWithoutToken<SuccessResponse<{ token: string; user_id: string }> | ErrorResponse<403, 4097>>({
        method: 'post',
        path: `/v1/auth/login_fb`,
        body,
      }),

    'POST /v1/auth/id/find': ({ body }: { body: { email: string } }) =>
      callWithoutToken<SuccessResponse<{ message: 'ok' }> | ErrorResponse<400, 12303>>({
        method: 'post',
        path: `/v1/auth/id/find`,
        body,
      }),
    'POST /v1/auth/password/reset/email/check': ({ body }: { body: { user_id: string } }) =>
      callWithoutToken<SuccessResponse<{ email: string }> | ErrorResponse<404, 16388>>({
        method: 'post',
        path: `/v1/auth/password/reset/email/check`,
        body,
      }),
    'POST /v1/auth/password/reset/email/send': ({ body }: { body: { user_email: string } }) =>
      callWithoutToken<SuccessResponse<{ message: 'ok' }>>({
        method: 'post',
        path: `/v1/auth/password/reset/email/send`,
        body,
      }),
    'POST /v1/auth/password/reset/verification/code': ({ body }: { body: { user_id: string; code: string } }) =>
      callWithoutToken<SuccessResponse<{ message: 'ok' }> | ErrorResponse<401, 8209>>({
        method: 'post',
        path: `/v1/auth/password/reset/verification/code`,
        body,
      }),
    'POST /v1/auth/password/reset': ({ body }: { body: { user_id: string; password: string } }) =>
      callWithoutToken<SuccessResponse<{ message: 'ok' }>>({
        method: 'post',
        path: `/v1/auth/password/reset`,
        body,
      }),
    'GET /v1/colors/vivid_ios': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<{ colors: { bg: string; fg: string }[]; names: string[]; message: 'ok' }>>({
        method: 'get',
        path: `/v1/colors/vivid_ios`,
        token,
      }),
    'POST /v1/feedback': ({ body }: { body: { email: string; message: string } }) =>
      callWithoutToken<SuccessResponse<{ message: 'ok' }>>({
        method: 'post',
        path: `/v1/feedback`,
        body,
      }),
    'GET /v1/course_books': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<{ year: number; semester: number; updated_at: string }[]>>({
        method: 'get',
        path: `/v1/course_books`,
        token,
      }),
    'GET /v1/tags/:year/:semester': ({
      token,
      params,
    }: {
      token: string;
      params: { year: number; semester: number };
    }) =>
      callWithToken<
        SuccessResponse<{
          academic_year: string[];
          category: string[];
          categoryPre2025?: string[];
          classification: string[];
          credit: string[];
          department: string[];
          instructor: string[];
          updated_at: number;
        }>
      >({
        method: 'get',
        path: `/v1/tags/${params.year}/${params.semester}`,
        token,
      }),
    'PUT /v1/user/password': ({
      body,
      token,
    }: {
      body: { old_password: string; new_password: string };
      token: string;
    }) =>
      callWithToken<SuccessResponse<{ token: string }>>({
        method: 'put',
        path: `/v1/user/password`,
        body,
        token,
      }),
    'POST /v1/user/password': ({ body, token }: { body: { id: string; password: string }; token: string }) =>
      callWithToken<SuccessResponse<{ token: string }>>({
        method: 'post',
        path: `/v1/user/password`,
        body,
        token,
      }),
    'POST /v1/user/facebook': ({ body, token }: { body: { fb_id: string; fb_token: string }; token: string }) =>
      callWithToken<SuccessResponse<{ token: string }>>({
        method: 'post',
        path: `/v1/user/facebook`,
        body,
        token,
      }),
    'DELETE /v1/user/facebook': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<{ token: string }>>({
        method: 'delete',
        path: `/v1/user/facebook`,
        token,
      }),
    'GET /v1/users/me/auth-providers': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<UserAuthProviderInfo>>({
        method: 'GET',
        path: '/v1/users/me/auth-providers',
        token,
      }),
  }) satisfies Record<string, Api>;
