import { InternalClient } from '../httpClient';
import { ErrorResponse, SuccessResponse } from '../response';
import { LocalLoginRequest, LoginResponse, NotificationResponse } from './schemas';

type Api = (_: { body: never; token: string }) => Promise<{ status: number; data: unknown }>;

export const apis = (client: InternalClient) => {
  const callWithToken = <R extends { status: number; data: unknown }>(
    p: Parameters<InternalClient['call']>[0] & { token: string },
  ) => client.call<R | ErrorResponse<403, 8194>>(p);

  const callWithoutToken = <R extends { status: number; data: unknown }>(
    p: Omit<Parameters<InternalClient['call']>[0], 'token'> & { token?: never },
  ) => client.call<R>(p);

  return {
    'POST /v1/auth/login_local': ({ body }: { body: LocalLoginRequest }) =>
      callWithoutToken<SuccessResponse<LoginResponse> | ErrorResponse<403, 8197>>({
        method: 'post',
        path: '/v1/auth/login_local',
        body,
      }),
    'POST /auth/login_fb': ({ body }: { body: { fb_id: string; fb_token: string } }) =>
      callWithoutToken<SuccessResponse<{ token: string; user_id: string }> | ErrorResponse<403, 4097>>({
        method: 'post',
        path: `/auth/login_fb`,
        body,
      }),
    'POST /v1/auth/register_local': ({ body }: { body: { id: string; password: string } }) =>
      callWithoutToken<SuccessResponse<{ message: 'ok'; token: string; user_id: string }> | ErrorResponse<403, 1229>>({
        method: 'post',
        path: `/v1/auth/register_local`,
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
    'GET /v1/notification': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<NotificationResponse[]>>({
        method: 'get',
        path: `/v1/notification`,
        token,
      }),
    'GET /v1/course_books': ({ token }: { token: string }) =>
      callWithToken<SuccessResponse<{ year: number; semester: number; updated_at: string }[]>>({
        method: 'get',
        path: `/v1/course_books`,
        token,
      }),
  } satisfies Record<string, Api>;
};
