// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthTokens, setAuthTokens } from '@/api/client';
import { Lnb } from '@/features/app-shell/components/Lnb';
import { api, server } from '../../msw/server';

const pathname = vi.hoisted(() => ({ current: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }));

const render = (ui: ReactElement) =>
  renderBase(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

beforeEach(() => {
  pathname.current = '/';
  document.documentElement.dataset.theme = 'light';
});

describe('Lnb', () => {
  it('지금 화면의 메뉴를 표시한다', () => {
    pathname.current = '/friends';
    render(<Lnb />);
    expect(screen.getByRole('link', { name: '친구 시간표' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '검색' })).not.toHaveAttribute('aria-current');
  });

  it('화면이 아직 없는 메뉴는 링크가 아니다', () => {
    render(<Lnb />);
    expect(screen.queryByRole('link', { name: '강의평' })).not.toBeInTheDocument();
    expect(screen.getByText('강의평').closest('[aria-disabled]')).toBeInTheDocument();
  });

  it('테마 버튼으로 라이트 / 다크를 바꾼다', async () => {
    render(<Lnb />);
    await userEvent.click(screen.getByRole('button', { name: '다크 모드로 전환' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    await userEvent.click(screen.getByRole('button', { name: '라이트 모드로 전환' }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('더보기의 로그아웃은 토큰을 지운다 (RequireSignIn 이 로그인 화면으로 보낸다)', async () => {
    const logout = vi.fn(() => new HttpResponse(null, { status: 200 }));
    server.use(http.post(api('/v2/auth/logout'), logout));
    setAuthTokens({ accessToken: 'a', refreshToken: 'r' });
    render(<Lnb />);

    await userEvent.click(screen.getByRole('button', { name: '더보기' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: '로그아웃' }));
    expect(getAuthTokens()).toBeNull();
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });
});
