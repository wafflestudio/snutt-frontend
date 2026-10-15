// @vitest-environment jsdom
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { ApiError, callApi, clearAuthTokens, getAuthTokens, setAuthTokens } from '@/api/client';
import { problem, TIMETABLE_RESPONSE } from '../msw/fixtures';
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
