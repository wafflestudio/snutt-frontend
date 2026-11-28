// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAuthTokens, getAuthTokens, setAuthTokens } from '@/api/client';
import { KakaoCallback } from '@/features/auth/components/KakaoCallback';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SocialAuthCancelled, SocialAuthError } from '@/shared/lib/social-auth';
import { problem, TOKEN_RESPONSE } from '../../msw/fixtures';
import { api, server } from '../../msw/server';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

// SDK 팝업 · 카카오로의 이동은 브라우저 밖이라 가짜로 바꾼다. 나머지(state 저장, 코드 교환)는 그대로 쓴다
const { getPopupAccessToken, startKakaoAuth } = vi.hoisted(() => ({
  getPopupAccessToken: vi.fn(),
  startKakaoAuth: vi.fn(),
}));
vi.mock('@/shared/lib/social-auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/social-auth')>()),
  getPopupAccessToken,
  startKakaoAuth,
}));

const KAKAO_STATE_KEY = 'snutt-web:kakao-auth';

beforeEach(() => window.history.replaceState(null, '', '/'));
afterEach(() => {
  clearAuthTokens();
  window.sessionStorage.clear();
  replace.mockReset();
  getPopupAccessToken.mockReset();
  startKakaoAuth.mockReset();
});

const renderWithQuery = (ui: ReactNode) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );

describe('LoginForm 소셜 로그인', () => {
  it('구글 팝업에서 받은 토큰으로 로그인한다', async () => {
    const body = vi.fn();
    getPopupAccessToken.mockResolvedValue('google-access');
    server.use(
      http.post(api('/v2/auth/login/GOOGLE'), async ({ request }) => {
        body(await request.json());
        return HttpResponse.json(TOKEN_RESPONSE);
      }),
    );
    renderWithQuery(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: '구글로 로그인' }));

    await waitFor(() => expect(getAuthTokens()).toEqual({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' }));
    expect(getPopupAccessToken).toHaveBeenCalledWith('google');
    expect(body).toHaveBeenCalledWith({ token: 'google-access' });
  });

  it('팝업을 닫으면 아무것도 알리지 않고, 막히면 이유를 알린다', async () => {
    getPopupAccessToken.mockRejectedValueOnce(new SocialAuthCancelled());
    renderWithQuery(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: '페이스북으로 로그인' }));
    await waitFor(() => expect(screen.getByRole('button', { name: '페이스북으로 로그인' })).toBeEnabled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    getPopupAccessToken.mockRejectedValueOnce(new SocialAuthError('팝업이 막혀 있습니다'));
    await userEvent.click(screen.getByRole('button', { name: '구글로 로그인' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('팝업이 막혀 있습니다');
  });

  it('카카오는 돌아갈 곳(next)을 담아 카카오 화면으로 보낸다', async () => {
    window.history.replaceState(null, '', '/login?next=%2Ffriends');
    renderWithQuery(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: '카카오로 로그인' }));
    expect(startKakaoAuth).toHaveBeenCalledWith({ purpose: 'login', next: '/friends' });
  });

  it('timetable-picker 의 인라인 로그인에는 소셜 로그인이 없다', () => {
    renderWithQuery(<LoginForm next="/timetable-picker" socialLogin={false} />);
    expect(screen.queryByRole('button', { name: '카카오로 로그인' })).not.toBeInTheDocument();
  });
});

describe('카카오에서 돌아왔을 때 (/oauth/kakao)', () => {
  const arrive = (request: object, query: string) => {
    window.sessionStorage.setItem(KAKAO_STATE_KEY, JSON.stringify({ state: 's1', ...request }));
    window.history.replaceState(null, '', `/oauth/kakao?${query}`);
  };
  const kakaoToken = () =>
    http.post('https://kauth.kakao.com/oauth/token', () => HttpResponse.json({ access_token: 'kakao-access' }));

  it('로그인: 코드를 토큰으로 바꿔 로그인하고 next 로 간다', async () => {
    const body = vi.fn();
    server.use(
      kakaoToken(),
      http.post(api('/v2/auth/login/KAKAO'), async ({ request }) => {
        body(await request.json());
        return HttpResponse.json(TOKEN_RESPONSE);
      }),
    );
    arrive({ purpose: 'login', next: '/friends' }, 'code=c1&state=s1');
    renderWithQuery(<KakaoCallback />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/friends'));
    expect(body).toHaveBeenCalledWith({ token: 'kakao-access' });
    expect(getAuthTokens()).toEqual({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' });
  });

  it('연동: 지금 계정에 연동하고 새 토큰을 저장한 뒤 시작한 화면으로 돌아간다', async () => {
    setAuthTokens({ accessToken: 'old', refreshToken: 'old-r' });
    server.use(
      kakaoToken(),
      http.post(api('/v2/users/me/social/KAKAO'), () =>
        HttpResponse.json({ authProviders: ['LOCAL', 'KAKAO'], accessToken: 'new', refreshToken: 'new-r' }),
      ),
    );
    arrive({ purpose: 'link', next: '/?panel=more&page=account' }, 'code=c1&state=s1');
    renderWithQuery(<KakaoCallback />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/?panel=more&page=account'));
    expect(getAuthTokens()).toEqual({ accessToken: 'new', refreshToken: 'new-r' });
  });

  it('동의 화면에서 취소하면 로그인 화면으로 돌아간다', async () => {
    arrive({ purpose: 'login', next: '/friends' }, 'error=access_denied&state=s1');
    renderWithQuery(<KakaoCallback />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login?next=%2Ffriends'));
  });

  it('state 가 다르면 처리하지 않는다', async () => {
    arrive({ purpose: 'login', next: '/' }, 'code=c1&state=forged');
    renderWithQuery(<KakaoCallback />);
    expect(await screen.findByRole('alert')).toHaveTextContent('잘못된 요청입니다');
    expect(screen.getByRole('link', { name: '돌아가기' })).toHaveAttribute('href', '/login');
  });

  it('다른 사이트 주소인 next 로는 보내지 않는다', async () => {
    server.use(kakaoToken(), http.post(api('/v2/auth/login/KAKAO'), () => HttpResponse.json(TOKEN_RESPONSE)));
    arrive({ purpose: 'login', next: '//evil.test' }, 'code=c1&state=s1');
    renderWithQuery(<KakaoCallback />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
  });

  it('서버가 거절하면 이유와 돌아갈 링크를 보여 준다', async () => {
    server.use(
      kakaoToken(),
      http.post(api('/v2/users/me/social/KAKAO'), () =>
        HttpResponse.json(problem(409, 'duplicate-social-account', '연동 실패', '이미 다른 계정에 연동된 카카오 계정입니다'), {
          status: 409,
        }),
      ),
    );
    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
    arrive({ purpose: 'link', next: '/?panel=more' }, 'code=c1&state=s1');
    renderWithQuery(<KakaoCallback />);
    expect(await screen.findByRole('alert')).toHaveTextContent('이미 다른 계정에 연동된 카카오 계정입니다');
    expect(screen.getByRole('link', { name: '돌아가기' })).toHaveAttribute('href', '/?panel=more');
  });
});
