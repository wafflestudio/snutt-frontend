import { InternalClient } from '../httpClient';
import { LocalLoginRequest, LoginResponse } from './schemas';

type Api = ({ body }: { body: never }) => Promise<{ status: number; data: unknown }>;

type Success<T> = { status: 200; data: T };

type Error<Status extends number, Errcode extends number, Ext extends Record<string, never> = Record<string, never>> = {
  status: Status;
  data: { errcode: Errcode; ext: Ext; message: string };
};

export const apis = (client: InternalClient) =>
  ({
    'POST /v1/auth/login_local': ({ body }: { body: LocalLoginRequest }) =>
      client.call<Success<LoginResponse>>({
        method: 'post',
        path: '/v1/auth/login_local',
        body,
      }),
    'POST /auth/login_fb': ({ body }: { body: { fb_id: string; fb_token: string } }) =>
      client.call<Success<{ token: string; user_id: string }>>({
        method: 'post',
        path: `/auth/login_fb`,
        body,
      }),
    'POST /v1/auth/register_local': ({ body }: { body: { id: string; password: string } }) =>
      client.call<Success<{ message: 'ok'; token: string; user_id: string }> | Error<403, 1229>>({
        method: 'post',
        path: `/v1/auth/register_local`,
        body,
      }),
    'POST /v1/auth/id/find': ({ body }: { body: { email: string } }) =>
      client.call<Success<{ message: 'ok' }>>({
        method: 'post',
        path: `/v1/auth/id/find`,
        body,
      }),
    'POST /v1/auth/password/reset/email/check': ({ body }: { body: { user_id: string } }) =>
      client.call<Success<{ email: string }>>({
        method: 'post',
        path: `/auth/login_fb`,
        body,
      }),
    'POST /v1/auth/password/reset/email/send': ({ body }: { body: { user_email: string } }) =>
      client.call<Success<{ message: 'ok' }>>({
        method: 'post',
        path: `/v1/auth/password/reset/email/send`,
        body,
      }),
    'POST /v1/auth/password/reset/verification/code': ({ body }: { body: { user_id: string; code: string } }) =>
      client.call<Success<{ message: 'ok' }>>({
        method: 'post',
        path: `/v1/auth/password/reset/verification/code`,
        body,
      }),
    'POST /v1/auth/password/reset': ({ body }: { body: { user_id: string; password: string } }) =>
      client.call<Success<{ message: 'ok' }>>({
        method: 'post',
        path: `/v1/auth/password/reset`,
        body,
      }),
  }) satisfies Record<string, Api>;
