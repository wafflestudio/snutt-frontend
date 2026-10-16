// @vitest-environment jsdom
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, callApi, clearAuthTokens, getAuthTokens, setAuthTokens, subscribeAuthTokens } from '@/api/client';
import { problem, TIMETABLE_RESPONSE, TOKEN_RESPONSE } from '../msw/fixtures';
import { api, server } from '../msw/server';

/** 받은 요청을 기록하고 body 를 돌려준다 */
const capture = (method: 'get' | 'post', path: string, body: unknown = TIMETABLE_RESPONSE) => {
  const requests: Request[] = [];
  server.use(
    http[method](api(path), ({ request }) => {
      requests.push(request.clone());
      return HttpResponse.json(body as object);
    }),
  );
  return requests;
};

afterEach(() => clearAuthTokens());

describe('callApi', () => {
  it('v2 앱 식별 헤더를 붙이고, 로그인 전에는 Authorization 이 없다', async () => {
    const requests = capture('get', '/v2/timetables/recent');
    await callApi('GET /v2/timetables/recent');

    const [request] = requests;
    expect(request.headers.get('x-os-type')).toBe('web');
    expect(request.headers.get('x-client-key')).toBe('test-client-key');
    expect(request.headers.get('authorization')).toBeNull();
  });

  it('로그인하면 Bearer 토큰을 붙인다', async () => {
    setAuthTokens({ accessToken: 'access', refreshToken: 'refresh' });
    const requests = capture('get', '/v2/timetables/recent');
    await callApi('GET /v2/timetables/recent');

    expect(requests[0].headers.get('authorization')).toBe('Bearer access');
  });

  it('경로 파라미터와 body 를 보내고 응답 본문을 돌려준다', async () => {
    const requests = capture('post', '/v2/timetables/68391/lectures');
    const data = await callApi('POST /v2/timetables/:timetableId/lectures', {
      params: { timetableId: '68391' },
      body: { lectureId: 74272, isForced: false },
    });

    expect(await requests[0].json()).toEqual({ lectureId: 74272, isForced: false });
    expect(data).toEqual(TIMETABLE_RESPONSE);
  });

  it('본문이 없는 성공 응답은 null', async () => {
    server.use(http.post(api('/v2/bookmarks/lectures/1'), () => new HttpResponse(null, { status: 200 })));
    await expect(callApi('POST /v2/bookmarks/lectures/:lectureId', { params: { lectureId: '1' } })).resolves.toBeNull();
  });

  it('2xx 가 아니면 problem detail 을 담은 ApiError 를 던진다', async () => {
    server.use(
      http.get(api('/v2/timetables/1'), () =>
        HttpResponse.json(problem(404, 'timetable-not-found', '시간표 없음', '존재하지 않는 시간표입니다'), {
          status: 404,
        }),
      ),
    );

    const error = await callApi('GET /v2/timetables/:timetableId', { params: { timetableId: '1' } }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      type: '/problems/timetable-not-found',
      title: '시간표 없음',
      detail: '존재하지 않는 시간표입니다',
      message: '존재하지 않는 시간표입니다',
    });
  });

  it('에러 본문이 없어도 상태 코드로 ApiError 를 만든다', async () => {
    server.use(http.get(api('/v2/timetables'), () => new HttpResponse(null, { status: 502 })));
    await expect(callApi('GET /v2/timetables')).rejects.toMatchObject({ status: 502, title: '요청 실패 (502)' });
  });
});

describe('토큰 저장', () => {
  it('저장 · 읽기 · 지우기', () => {
    expect(getAuthTokens()).toBeNull();
    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
    expect(getAuthTokens()).toEqual({ accessToken: 'a', refreshToken: 'r' });
    clearAuthTokens();
    expect(getAuthTokens()).toBeNull();
  });
});

describe('토큰 갱신', () => {
  const expired = () =>
    HttpResponse.json(problem(401, 'invalid-access-token', '로그인 실패', '다시 로그인해 주세요'), { status: 401 });

  /** 'fresh' 토큰만 받는 시간표 목록과, 갱신 요청 기록 */
  const setup = (
    refresh: () => Response = () =>
      HttpResponse.json({ ...TOKEN_RESPONSE, accessToken: 'fresh', refreshToken: 'refresh-2' }),
  ) => {
    const refreshBodies: unknown[] = [];
    server.use(
      http.get(api('/v2/timetables'), ({ request }) =>
        request.headers.get('authorization') === 'Bearer fresh' ? HttpResponse.json([]) : expired(),
      ),
      http.post(api('/v2/auth/refresh'), async ({ request }) => {
        refreshBodies.push(await request.json());
        return refresh();
      }),
    );
    return refreshBodies;
  };

  it('401 이면 refresh token 으로 갱신해 저장하고, 한 번 다시 보낸다', async () => {
    const refreshBodies = setup();
    setAuthTokens({ accessToken: 'old', refreshToken: 'refresh-1' });

    await expect(callApi('GET /v2/timetables')).resolves.toEqual([]);
    expect(refreshBodies).toEqual([{ refreshToken: 'refresh-1' }]);
    expect(getAuthTokens()).toEqual({ accessToken: 'fresh', refreshToken: 'refresh-2' });
  });

  it('여러 요청이 한꺼번에 401 을 받아도 한 번만 갱신한다 (쓴 refresh token 은 다시 쓸 수 없다)', async () => {
    const refreshBodies = setup();
    setAuthTokens({ accessToken: 'old', refreshToken: 'refresh-1' });

    await Promise.all([callApi('GET /v2/timetables'), callApi('GET /v2/timetables'), callApi('GET /v2/timetables')]);
    expect(refreshBodies).toHaveLength(1);
  });

  it('갱신하지 못하면 토큰을 지우고 401 을 던진다 (로그아웃했거나 refresh token 이 만료됨)', async () => {
    setup(() =>
      HttpResponse.json(problem(401, 'invalid-refresh-token', '로그인 만료', '다시 로그인해 주세요'), { status: 401 }),
    );
    setAuthTokens({ accessToken: 'old', refreshToken: 'refresh-1' });

    await expect(callApi('GET /v2/timetables')).rejects.toMatchObject({ status: 401 });
    expect(getAuthTokens()).toBeNull();
  });

  it('다른 탭이 먼저 갱신했으면 저장소의 새 토큰으로 다시 보낸다', async () => {
    const refreshBodies: unknown[] = [];
    server.use(
      http.get(api('/v2/timetables'), ({ request }) => {
        if (request.headers.get('authorization') === 'Bearer fresh') return HttpResponse.json([]);
        // 이 요청이 401 을 받는 사이에 다른 탭이 갱신했다
        setAuthTokens({ accessToken: 'fresh', refreshToken: 'refresh-2' });
        return expired();
      }),
      http.post(api('/v2/auth/refresh'), () => {
        refreshBodies.push('called');
        return HttpResponse.json(TOKEN_RESPONSE);
      }),
    );
    setAuthTokens({ accessToken: 'old', refreshToken: 'refresh-1' });

    await expect(callApi('GET /v2/timetables')).resolves.toEqual([]);
    expect(refreshBodies).toEqual([]);
  });

  it('로그인하지 않았거나 인증 요청이면 갱신하지 않는다', async () => {
    const refreshBodies = setup();
    await expect(callApi('GET /v2/timetables')).rejects.toMatchObject({ status: 401 });

    server.use(http.post(api('/v2/auth/login'), expired));
    setAuthTokens({ accessToken: 'old', refreshToken: 'refresh-1' });
    await expect(callApi('POST /v2/auth/login', { body: { localId: 'a', password: 'b' } })).rejects.toMatchObject({
      status: 401,
    });
    expect(refreshBodies).toEqual([]);
  });

  it('토큰이 바뀌면 구독한 쪽에 알린다', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAuthTokens(listener);
    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
    clearAuthTokens();
    unsubscribe();
    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
