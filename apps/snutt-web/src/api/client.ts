import { implSnuttV2Api, type SnuttV2Api } from '@sf/snutt-api';

/**
 * 서버와 통신하는 곳은 여기 하나다. 토큰 저장 · 인증 헤더 · 에러 변환을 모두 여기서 한다.
 * (BFF 로 바꾸게 되면 이 파일만 고친다. 개발 플랜 "BFF 여부")
 */

/** v2 의 에러 응답 (RFC 7807 problem detail). `type` 은 `/problems/timetable-not-found` 같은 값 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly type: string | null,
    readonly title: string,
    readonly detail: string | null,
  ) {
    super(detail ?? title);
    this.name = 'ApiError';
  }
}

const toApiError = (status: number, data: unknown) => {
  const problem = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const text = (value: unknown) => (typeof value === 'string' ? value : null);
  return new ApiError(status, text(problem.type), text(problem.title) ?? `요청 실패 (${status})`, text(problem.detail));
};

// ── 토큰 ─────────────────────────────────────────────────────────────────────
// 로그인 흐름과 refresh 는 3-1 에서 붙인다

export type AuthTokens = { accessToken: string; refreshToken: string };

const TOKENS_KEY = 'snutt-web:auth-tokens';

export const getAuthTokens = (): AuthTokens | null => {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    // 서버 렌더링 중이거나 저장소를 쓸 수 없는 경우
    return null;
  }
};

export const setAuthTokens = (tokens: AuthTokens) => {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // 저장하지 못해도 이번 요청은 진행한다
  }
};

export const clearAuthTokens = () => {
  try {
    localStorage.removeItem(TOKENS_KEY);
  } catch {
    // 지울 것이 없다
  }
};

// ── 호출 ─────────────────────────────────────────────────────────────────────

const api = implSnuttV2Api({
  osType: 'web',
  // NEXT_PUBLIC_ 값은 빌드 때 그대로 박힌다 (apps/snutt-web/.env.local)
  clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY ?? '',
  httpClient: {
    call: async ({ method, path, body, headers }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
        method: method.toUpperCase(),
        headers,
        body: body && JSON.stringify(body),
      });
      const text = await response.text();
      return { status: response.status, data: text ? JSON.parse(text) : null };
    },
  },
});

type Endpoint = keyof SnuttV2Api;

/** 엔드포인트 인자에서 토큰을 뺀 것. 토큰은 callApi 가 넣는다 */
type Input<E extends Endpoint> = Parameters<SnuttV2Api[E]> extends [infer A, ...unknown[]] ? Omit<A, 'token'> : object;

type Output<E extends Endpoint> = Extract<Awaited<ReturnType<SnuttV2Api[E]>>, { status: 200 }>['data'];

/**
 * v2 엔드포인트를 부른다. 로그인되어 있으면 토큰을 붙이고, 2xx 가 아니면 ApiError 를 던진다.
 * `callApi('GET /v2/timetables/:timetableId', { params: { timetableId } })`
 */
export const callApi = async <E extends Endpoint>(
  endpoint: E,
  ...[input]: keyof Input<E> extends never ? [] : [Input<E>]
): Promise<Output<E>> => {
  const call = api[endpoint] as (args: object) => Promise<{ status: number; data: unknown }>;
  const { status, data } = await call({ ...input, token: getAuthTokens()?.accessToken });
  if (status < 200 || status >= 300) throw toApiError(status, data);
  return data as Output<E>;
};
