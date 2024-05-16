/**
 * @link https://snu4t-api-dev.wafflestudio.com/webjars/swagger-ui/index.html
 */

import { postV1AuthLoginLocal } from './apis/post-v1-auth-login-local';
import { InternalClient } from './httpClient';

export const implSnuttApi = ({ httpClient, apiKey }: { httpClient: SnuttBackendHttpClient; apiKey: string }) =>
  apis({
    call: async <R>(_: { method: string; path: string; body?: Record<string, unknown>; token?: string }) =>
      httpClient.call<R>({
        method: _.method,
        path: _.path,
        body: _.body,
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          ...(_.token ? { 'x-access-token': _.token } : {}),
          'x-access-apikey': apiKey,
        },
      }),
  });

export type SnuttApi = ReturnType<typeof implSnuttApi>;

type SnuttBackendHttpClient = {
  call: <R>(_: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  }) => Promise<R>;
};

const apis = (client: InternalClient) => ({
  'POST /v1/login/local': postV1AuthLoginLocal(client),
});
