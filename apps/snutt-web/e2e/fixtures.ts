import { test as base, expect } from '@playwright/test';
import { getResponse, http, HttpResponse, type RequestHandler } from 'msw';
import { SAMPLE_COURSEBOOK, SAMPLE_PALETTE, SAMPLE_SEMESTERS, SAMPLE_TIMETABLES } from '@/features/main/sample-data';
import { fakeFriends } from '../tests/msw/fake-friends';
import { fakeSnutt } from '../tests/msw/fake-snutt';
import { FRIEND_RESPONSES, problem, TOKEN_RESPONSE } from '../tests/msw/fixtures';
import { api, API_BASE_URL } from '../tests/msw/server';

/** 가짜 서버의 계정 */
export const ACCOUNT = { localId: 'snutt', password: 'password1' };

const authHandlers = [
  http.post(api('/v2/auth/login'), async ({ request }) => {
    const { localId, password } = (await request.json()) as typeof ACCOUNT;
    return localId === ACCOUNT.localId && password === ACCOUNT.password
      ? HttpResponse.json(TOKEN_RESPONSE)
      : HttpResponse.json(problem(401, 'wrong-password', 'Unauthorized', '아이디 또는 비밀번호가 올바르지 않습니다'), {
          status: 401,
        });
  }),
  http.post(api('/v2/auth/logout'), () => new HttpResponse(null, { status: 200 })),
];

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': '*',
  'access-control-allow-headers': '*',
};

/**
 * 테스트마다 새 가짜 서버(tests/msw 의 fakeSnutt 와 fakeFriends, 예시 시간표 · 친구)를 두고 브라우저의 서버 요청을 받는다.
 * 가짜 서버가 모르는 요청은 501 로 답하고 테스트를 실패시킨다 (vitest 의 "정하지 않은 요청은 실패" 와 같게)
 */
export const test = base.extend<{ fakeApi: void }>({
  fakeApi: [
    async ({ context }, use) => {
      const handlers: RequestHandler[] = [
        ...authHandlers,
        ...fakeSnutt({
          timetables: SAMPLE_TIMETABLES,
          semesters: SAMPLE_SEMESTERS,
          palette: SAMPLE_PALETTE,
          coursebook: SAMPLE_COURSEBOOK,
        }).handlers,
        ...fakeFriends({ ACTIVE: FRIEND_RESPONSES }).handlers,
      ];
      const unhandled: string[] = [];

      await context.route(`${API_BASE_URL}/**`, async (route) => {
        const request = route.request();
        if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS_HEADERS });

        const body = request.postData();
        const response = await getResponse(
          handlers,
          new Request(request.url(), { method: request.method(), headers: await request.allHeaders(), body }),
        );
        if (!response) {
          unhandled.push(`${request.method()} ${request.url()}`);
          return route.fulfill({ status: 501, headers: CORS_HEADERS });
        }
        await route.fulfill({
          status: response.status,
          headers: { ...Object.fromEntries(response.headers), ...CORS_HEADERS },
          body: Buffer.from(await response.arrayBuffer()),
        });
      });

      await use();
      expect(unhandled, '가짜 서버가 받지 못한 요청').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
