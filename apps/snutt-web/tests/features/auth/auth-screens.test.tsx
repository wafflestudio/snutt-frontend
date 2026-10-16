// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAuthTokens, getAuthTokens, setAuthTokens } from '@/api/client';
import { RedirectIfSignedIn, RequireSignIn } from '@/features/auth/components/AuthGuard';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { problem, TOKEN_RESPONSE } from '../../msw/fixtures';
import { api, server } from '../../msw/server';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => window.history.replaceState(null, '', '/'));
afterEach(() => {
  clearAuthTokens();
  replace.mockReset();
});

const renderWithQuery = (ui: ReactNode) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );

describe('RequireSignIn', () => {
  it('로그인했으면 화면을 보여 준다', () => {
    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
    render(<RequireSignIn>메인</RequireSignIn>);
    expect(screen.getByText('메인')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('로그인하지 않았으면 보던 곳을 next 에 담아 로그인 화면으로 보낸다', () => {
    window.history.replaceState(null, '', '/friends');
    render(<RequireSignIn>친구</RequireSignIn>);
    expect(screen.queryByText('친구')).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith('/login?next=%2Ffriends');
  });

  it('보는 중에 토큰이 지워지면(로그아웃 · 갱신 실패) 로그인 화면으로 보낸다', () => {
    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
    render(<RequireSignIn>메인</RequireSignIn>);
    act(() => clearAuthTokens());
    expect(screen.queryByText('메인')).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith('/login');
  });
});

describe('RedirectIfSignedIn', () => {
  it('이미 로그인했으면 next 로 보낸다', () => {
    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
    window.history.replaceState(null, '', '/login?next=%2Ffriends');
    render(<RedirectIfSignedIn>로그인</RedirectIfSignedIn>);
    expect(screen.queryByText('로그인')).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith('/friends');
  });
});

describe('LoginForm', () => {
  it('로그인하면 토큰을 저장하고 돌아갈 곳으로 보낸다', async () => {
    server.use(http.post(api('/v2/auth/login'), () => HttpResponse.json(TOKEN_RESPONSE)));
    renderWithQuery(
      <RedirectIfSignedIn>
        <LoginForm />
      </RedirectIfSignedIn>,
    );
    expect(screen.getByRole('button', { name: '로그인' })).toBeDisabled();

    await userEvent.type(screen.getByRole('textbox', { name: '아이디' }), 'snutt');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'abc123');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(getAuthTokens()).toEqual({ accessToken: 'test-access-token', refreshToken: 'test-refresh-token' });
  });

  it('서버가 거절하면 그 이유를 보여 준다', async () => {
    server.use(
      http.post(api('/v2/auth/login'), () =>
        HttpResponse.json(
          problem(403, 'unregistered-local-id', '로그인 실패', '등록되지 않은 아이디입니다. 다시 입력해 주세요'),
          { status: 403 },
        ),
      ),
    );
    renderWithQuery(<LoginForm />);
    await userEvent.type(screen.getByRole('textbox', { name: '아이디' }), 'nobody');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'abc123');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('등록되지 않은 아이디입니다. 다시 입력해 주세요');
    expect(getAuthTokens()).toBeNull();
  });
});

describe('RegisterForm', () => {
  const fill = async ({ password, confirm }: { password: string; confirm: string }) => {
    await userEvent.type(screen.getByRole('textbox', { name: '아이디' }), 'snutt');
    await userEvent.type(screen.getByLabelText('비밀번호'), password);
    await userEvent.type(screen.getByLabelText('비밀번호 확인'), confirm);
  };

  it('비밀번호 확인이 다르면 알리고 가입할 수 없다', async () => {
    renderWithQuery(<RegisterForm />);
    await fill({ password: 'abc123', confirm: 'abc124' });
    expect(screen.getByRole('alert')).toHaveTextContent('비밀번호가 서로 다릅니다');
    expect(screen.getByRole('button', { name: '가입하기' })).toBeDisabled();
  });

  it('가입하면 빈 이메일은 null 로 보내고 로그인된다', async () => {
    let body: unknown;
    server.use(
      http.post(api('/v2/auth/register'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(TOKEN_RESPONSE);
      }),
    );
    renderWithQuery(<RegisterForm />);
    await fill({ password: 'abc123', confirm: 'abc123' });
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    await waitFor(() => expect(getAuthTokens()).not.toBeNull());
    expect(body).toEqual({ localId: 'snutt', password: 'abc123', email: null });
  });

  it('서버가 거절한 이유(비밀번호 규칙 등)를 보여 준다', async () => {
    server.use(
      http.post(api('/v2/auth/register'), () =>
        HttpResponse.json(
          problem(
            400,
            'invalid-password',
            '올바르지 않은 비밀번호',
            '비밀번호는 영문과 숫자 모두를 포함하는 6~20자여야 합니다',
          ),
          { status: 400 },
        ),
      ),
    );
    renderWithQuery(<RegisterForm />);
    await fill({ password: 'abc', confirm: 'abc' });
    await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('영문과 숫자 모두를 포함하는 6~20자');
  });
});
