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
// access token 은 2시간 짜리 JWT, refresh token 은 갱신할 때마다 새것으로 바뀐다 (dev 서버에서 확인)

export type AuthTokens = { accessToken: string; refreshToken: string };

const TOKENS_KEY = 'snutt-web:auth-tokens';
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

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
  notify();
};

export const clearAuthTokens = () => {
  try {
    localStorage.removeItem(TOKENS_KEY);
  } catch {
    // 지울 것이 없다
  }
  notify();
};

/** 토큰이 바뀌면(로그인 · 로그아웃 · 갱신 실패, 다른 탭 포함) listener 를 부른다. 해제 함수를 돌려준다 */
export const subscribeAuthTokens = (listener: () => void) => {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => event.key === TOKENS_KEY && listener();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

// ── 호출 ─────────────────────────────────────────────────────────────────────

/** 응답 본문. 게이트웨이의 502 HTML 처럼 JSON 이 아니면 null 로 두고 상태 코드로 ApiError 를 만든다 */
const parseBody = (text: string): unknown => {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

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
      return { status: response.status, data: parseBody(text) };
    },
  },
});

type Endpoint = keyof SnuttV2Api;

/** 엔드포인트 인자에서 토큰을 뺀 것. 토큰은 callApi 가 넣는다 */
type Input<E extends Endpoint> = Parameters<SnuttV2Api[E]> extends [infer A, ...unknown[]] ? Omit<A, 'token'> : object;

type Output<E extends Endpoint> = Extract<Awaited<ReturnType<SnuttV2Api[E]>>, { status: 200 }>['data'];

const send = (endpoint: Endpoint, input: object | undefined, accessToken: string | undefined) => {
  const call = api[endpoint] as (args: object) => Promise<{ status: number; data: unknown }>;
  return call({ ...input, token: accessToken });
};

// 갱신 중인 요청. 여러 요청이 한꺼번에 401 을 받아도 한 번만 갱신한다 (쓴 refresh token 은 다시 쓸 수 없어서)
let refreshing: Promise<boolean> | null = null;

/**
 * used 의 refresh token 으로 토큰을 갱신한다. 새 토큰을 쓸 수 있으면 true.
 * 서버가 refresh token 을 거절하면(4xx: 로그아웃했거나 만료) 토큰을 지워서 로그인 화면으로 보낸다.
 * 서버 오류(5xx)나 네트워크 오류는 토큰 탓이 아니므로 토큰을 남기고 그 오류를 던진다. 잠깐의 장애로 로그아웃되지 않게.
 * 다른 탭이 먼저 갱신했으면 저장소의 새 토큰을 쓴다.
 */
const refreshTokens = (used: AuthTokens) => {
  const changedElsewhere = () => {
    const current = getAuthTokens();
    return current !== null && current.refreshToken !== used.refreshToken;
  };
  refreshing ??= (async () => {
    if (changedElsewhere()) return true;
    const { status, data } = await send(
      'POST /v2/auth/refresh',
      { body: { refreshToken: used.refreshToken } },
      undefined,
    );
    if (status === 200) {
      const { accessToken, refreshToken } = data as AuthTokens;
      setAuthTokens({ accessToken, refreshToken });
      return true;
    }
    if (changedElsewhere()) return true;
    if (status >= 500) throw toApiError(status, data);
    clearAuthTokens();
    return false;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
};

/**
 * v2 엔드포인트를 부른다. 로그인되어 있으면 토큰을 붙이고, 2xx 가 아니면 ApiError 를 던진다.
 * 토큰을 붙인 요청이 401 이면 토큰을 갱신하고 한 번 다시 보낸다. (인증 요청 자체는 다시 보내지 않는다)
 * `callApi('GET /v2/timetables/:timetableId', { params: { timetableId } })`
 */
export const callApi = async <E extends Endpoint>(
  endpoint: E,
  ...[input]: keyof Input<E> extends never ? [] : [Input<E>]
): Promise<Output<E>> => {
  const tokens = getAuthTokens();
  let { status, data } = await send(endpoint, input, tokens?.accessToken);
  if (status === 401 && tokens && !endpoint.startsWith('POST /v2/auth/') && (await refreshTokens(tokens))) {
    ({ status, data } = await send(endpoint, input, getAuthTokens()?.accessToken));
  }
  if (status < 200 || status >= 300) throw toApiError(status, data);
  return data as Output<E>;
};
