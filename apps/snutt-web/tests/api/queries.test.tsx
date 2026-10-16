// @vitest-environment jsdom
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { useLocalLogin, useLogout, useRegister } from '@/api/auth';
import { ApiError, clearAuthTokens, getAuthTokens, setAuthTokens } from '@/api/client';
import { createQueryClient, shouldRetry } from '@/api/query-client';
import { themeQueries } from '@/api/themes';
import { timetableQueries } from '@/api/timetables';
import {
  problem,
  THEME_RESPONSE,
  TIMETABLE_BRIEF_RESPONSES,
  TIMETABLE_RESPONSE,
  TOKEN_RESPONSE,
} from '../msw/fixtures';
import { api, server } from '../msw/server';

afterEach(() => clearAuthTokens());

describe('queryOptions', () => {
  it('시간표 목록 · 상세 · 최근 · 테마를 domain 타입으로 받는다', async () => {
    server.use(
      http.get(api('/v2/timetables'), () => HttpResponse.json(TIMETABLE_BRIEF_RESPONSES)),
      http.get(api('/v2/timetables/recent'), () => HttpResponse.json(TIMETABLE_RESPONSE)),
      http.get(api('/v2/timetables/68391'), () => HttpResponse.json(TIMETABLE_RESPONSE)),
      http.get(api('/v2/themes'), () => HttpResponse.json([THEME_RESPONSE])),
    );
    const queryClient = createQueryClient();

    expect((await queryClient.fetchQuery(timetableQueries.list())).map(({ id }) => id)).toEqual(['68391', '68392']);
    expect(await queryClient.fetchQuery(timetableQueries.recent())).toMatchObject({ id: '68391', themeId: '1' });
    expect((await queryClient.fetchQuery(timetableQueries.detail('68391'))).lectures).toHaveLength(2);
    expect((await queryClient.fetchQuery(themeQueries.list()))[0].colors[1]).toEqual({ bg: '#F58D3D', fg: '#ffffff' });
  });

  it('상세의 query key 는 시간표마다 다르고, 모두 timetables 아래에 있다', () => {
    expect(timetableQueries.detail('1').queryKey).toEqual(['timetables', 'detail', '1']);
    expect(timetableQueries.detail('2').queryKey).not.toEqual(timetableQueries.detail('1').queryKey);
  });
});

describe('재시도', () => {
  it('4xx 는 다시 보내지 않고, 네트워크 오류 · 5xx 는 두 번까지', () => {
    expect(shouldRetry(0, new ApiError(401, null, '로그인 실패', null))).toBe(false);
    expect(shouldRetry(0, new ApiError(503, null, '점검 중', null))).toBe(true);
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true);
    expect(shouldRetry(2, new TypeError('Failed to fetch'))).toBe(false);
  });
});

describe('로그인 · 로그아웃', () => {
  const setup = () => {
    const queryClient = createQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { queryClient, wrapper };
  };

  it('로그인하면 토큰을 저장하고, 이전 데이터를 지운다', async () => {
    let body: unknown;
    server.use(
      http.post(api('/v2/auth/login'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(TOKEN_RESPONSE);
      }),
    );
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(timetableQueries.list().queryKey, []);

    const { result } = renderHook(() => useLocalLogin(), { wrapper });
    act(() => result.current.mutate({ localId: 'snutt', password: 'pw' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(body).toEqual({ localId: 'snutt', password: 'pw' });
    expect(getAuthTokens()).toEqual({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' });
    expect(queryClient.getQueryData(timetableQueries.list().queryKey)).toBeUndefined();
  });

  it('로그인 실패는 서버 메시지를 담은 에러 (dev 서버: 403 password-mismatch)', async () => {
    server.use(
      http.post(api('/v2/auth/login'), () =>
        HttpResponse.json(
          problem(403, 'password-mismatch', '로그인 실패', '잘못된 비밀번호입니다. 다시 입력해 주세요'),
          { status: 403 },
        ),
      ),
    );
    const { wrapper } = setup();
    const { result } = renderHook(() => useLocalLogin(), { wrapper });
    act(() => result.current.mutate({ localId: 'snutt', password: 'wrong' }));
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({ status: 403, detail: '잘못된 비밀번호입니다. 다시 입력해 주세요' });
    expect(getAuthTokens()).toBeNull();
  });

  it('가입하면 바로 로그인된다', async () => {
    let body: unknown;
    server.use(
      http.post(api('/v2/auth/register'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(TOKEN_RESPONSE);
      }),
    );
    const { wrapper } = setup();
    const { result } = renderHook(() => useRegister(), { wrapper });
    act(() => result.current.mutate({ localId: 'snutt', password: 'abc123', email: null }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(body).toEqual({ localId: 'snutt', password: 'abc123', email: null });
    expect(getAuthTokens()).toEqual({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' });
  });

  it('로그아웃하면 서버에서 refresh token 을 폐기하고, 토큰과 데이터를 지운다', async () => {
    let body: unknown;
    server.use(
      http.post(api('/v2/auth/logout'), async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 200 });
      }),
    );
    setAuthTokens({ accessToken: 'access', refreshToken: 'refresh' });
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(timetableQueries.list().queryKey, []);
    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(() => result.current());
    expect(body).toEqual({ refreshToken: 'refresh' });
    expect(getAuthTokens()).toBeNull();
    expect(queryClient.getQueryData(timetableQueries.list().queryKey)).toBeUndefined();
  });

  it('서버 로그아웃이 실패해도 이 브라우저에서는 로그아웃한다', async () => {
    server.use(http.post(api('/v2/auth/logout'), () => new HttpResponse(null, { status: 500 })));
    setAuthTokens({ accessToken: 'access', refreshToken: 'refresh' });
    const { wrapper } = setup();
    const { result } = renderHook(() => useLogout(), { wrapper });

    await act(() => result.current());
    expect(getAuthTokens()).toBeNull();
  });
});
