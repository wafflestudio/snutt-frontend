// @vitest-environment jsdom
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  exchangeKakaoCode,
  getKakaoAuthorizeUrl,
  SocialAuthError,
  startKakaoAuth,
  takeKakaoAuthRequest,
} from '@/shared/lib/social-auth';
import { server } from '../../msw/server';

const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';

afterEach(() => {
  window.sessionStorage.clear();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

/** startKakaoAuth 가 저장한 state (이동은 jsdom 에서 일어나지 않는다) */
const startAndGetState = (request: Parameters<typeof startKakaoAuth>[0]) => {
  vi.spyOn(crypto, 'randomUUID').mockReturnValue('0000-state' as ReturnType<typeof crypto.randomUUID>);
  try {
    startKakaoAuth(request);
  } catch {
    // jsdom 은 다른 사이트로의 이동을 지원하지 않는다
  }
  return '0000-state';
};

describe('카카오 로그인 화면 주소', () => {
  it('REST API 키, 이 사이트의 /oauth/kakao, state 를 담는다', () => {
    const url = new URL(getKakaoAuthorizeUrl('abc'));
    expect(url.origin + url.pathname).toBe('https://kauth.kakao.com/oauth/authorize');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: 'test-kakao-rest-key',
      redirect_uri: `${window.location.origin}/oauth/kakao`,
      response_type: 'code',
      state: 'abc',
    });
  });

  it('키가 없으면 시작하지 않는다', () => {
    vi.stubEnv('NEXT_PUBLIC_KAKAO_REST_API_KEY', '');
    expect(() => startKakaoAuth({ purpose: 'login', next: '/' })).toThrow(SocialAuthError);
  });
});

describe('돌아왔을 때 요청 꺼내기', () => {
  it('state 가 같으면 시작할 때의 요청을 한 번만 돌려준다', () => {
    const state = startAndGetState({ purpose: 'link', next: '/?panel=more' });
    expect(takeKakaoAuthRequest(state)).toEqual({ purpose: 'link', next: '/?panel=more' });
    expect(takeKakaoAuthRequest(state)).toBeNull();
  });

  it('state 가 다르거나 없으면 null 이다 (다른 사이트가 보낸 요청)', () => {
    startAndGetState({ purpose: 'login', next: '/' });
    expect(takeKakaoAuthRequest('other')).toBeNull();
    startAndGetState({ purpose: 'login', next: '/' });
    expect(takeKakaoAuthRequest(null)).toBeNull();
  });
});

describe('인가 코드 → access token', () => {
  it('REST API 키와 코드로 토큰을 받는다', async () => {
    const body = vi.fn();
    server.use(
      http.post(KAKAO_TOKEN_URL, async ({ request }) => {
        body(Object.fromEntries(new URLSearchParams(await request.text())));
        return HttpResponse.json({ access_token: 'kakao-access', token_type: 'bearer' });
      }),
    );
    await expect(exchangeKakaoCode('the-code')).resolves.toBe('kakao-access');
    expect(body).toHaveBeenCalledWith({
      grant_type: 'authorization_code',
      client_id: 'test-kakao-rest-key',
      redirect_uri: `${window.location.origin}/oauth/kakao`,
      code: 'the-code',
    });
  });

  it('카카오가 거절하면 이유를 담아 알린다', async () => {
    server.use(
      http.post(KAKAO_TOKEN_URL, () =>
        HttpResponse.json({ error: 'invalid_grant', error_description: 'authorization code not found' }, { status: 400 }),
      ),
    );
    await expect(exchangeKakaoCode('used-code')).rejects.toThrow('authorization code not found');
  });
});
