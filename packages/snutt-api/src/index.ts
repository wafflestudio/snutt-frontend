/**
 * @link https://snu4t-api-dev.wafflestudio.com/webjars/swagger-ui/index.html
 */

import { apis } from './apis';
import { getSnuttTimetableV2Apis } from './apis/snutt-timetable/v2';

export const implSnuttApi = ({
  httpClient,
  apiKey,
}: {
  httpClient: {
    call: (_: {
      method: string;
      path: string;
      body?: Record<string, unknown>;
      headers?: Record<string, string>;
    }) => Promise<{ status: number; data: unknown }>;
  };
  apiKey: string;
}) =>
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

export type SnuttApiSuccessResponseData<T extends keyof SnuttApi> = (Awaited<ReturnType<SnuttApi[T]>> & {
  status: 200;
})['data'];

export type SnuttApiResponse<T extends keyof SnuttApi> = Awaited<ReturnType<SnuttApi[T]>>;

type HttpClient = Parameters<typeof implSnuttApi>[0]['httpClient'];

/**
 * v2 엔드포인트만 쓰는 클라이언트. v1 과 인증 헤더가 다르다.
 * - 앱 식별: `x-os-type` + `x-client-key`
 * - 사용자 토큰: `Authorization: Bearer <accessToken>`
 */
export const implSnuttV2Api = ({
  httpClient,
  osType,
  clientKey,
}: {
  httpClient: HttpClient;
  osType: 'ios' | 'android' | 'web';
  clientKey: string;
}) => {
  const call = async <R extends { status: number; data: unknown }>(_: {
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
        'x-os-type': osType,
        'x-client-key': clientKey,
        ...(_.token ? { authorization: `Bearer ${_.token}` } : {}),
      },
    });
    return response as R;
  };

  return getSnuttTimetableV2Apis({ callWithToken: call, callWithoutToken: call });
};

export type SnuttV2Api = ReturnType<typeof implSnuttV2Api>;

/** v2 명세에서 생성한 타입. `SnuttV2.TimetableResponse` 처럼 쓴다 */
export type * as SnuttV2 from './apis/snutt-timetable/v2/schemas';
