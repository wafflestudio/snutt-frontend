/**
 * @link https://snu4t-api-dev.wafflestudio.com/webjars/swagger-ui/index.html
 */

import { apis } from './apis';

export const implSnuttApi = ({ httpClient, apiKey }: { httpClient: SnuttBackendHttpClient; apiKey: string }) =>
  apis({
    call: async <R extends { status: number; data: unknown }>(_: {
      method: string;
      path: string;
      body?: Record<string, unknown>;
      token?: string;
    }) => {
      const response = await httpClient.call({
        method: _.method,
        path: _.path,
        body: _.body,
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          ...(_.token ? { 'x-access-token': _.token } : {}),
          'x-access-apikey': apiKey,
        },
      });

      return response as R;
    },
  });

export type SnuttApi = ReturnType<typeof implSnuttApi>;

type SnuttBackendHttpClient = {
  call: (_: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  }) => Promise<{ status: number; data: unknown }>;
};
