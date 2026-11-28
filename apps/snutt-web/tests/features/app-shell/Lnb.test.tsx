// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Lnb } from '@/features/app-shell/components/Lnb';

const location = vi.hoisted(() => ({ pathname: '/', search: '' }));
vi.mock('next/navigation', () => ({
  usePathname: () => location.pathname,
  useSearchParams: () => new URLSearchParams(location.search),
}));

const render = (ui: ReactElement) =>
  renderBase(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

beforeEach(() => {
  location.pathname = '/';
  location.search = '';
  document.documentElement.dataset.theme = 'light';
});

describe('Lnb', () => {
  it('지금 화면의 메뉴를 표시한다', () => {
    location.pathname = '/friends';
    render(<Lnb />);
    expect(screen.getByRole('link', { name: '친구 시간표' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '검색' })).not.toHaveAttribute('aria-current');
  });

  it('강의평은 강의평 탭(/reviews)으로 간다', () => {
    location.pathname = '/reviews';
    render(<Lnb />);
    expect(screen.getByRole('link', { name: '강의평' })).toHaveAttribute('href', '/reviews');
    expect(screen.getByRole('link', { name: '강의평' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '검색' })).not.toHaveAttribute('aria-current');
  });

  it('테마 버튼으로 라이트 / 다크를 바꾼다', async () => {
    render(<Lnb />);
    await userEvent.click(screen.getByRole('button', { name: '다크 모드로 전환' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    await userEvent.click(screen.getByRole('button', { name: '라이트 모드로 전환' }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('더보기는 메인 화면의 더보기 패널을 연다. 열려 있으면 검색 대신 더보기를 표시한다', () => {
    const { unmount } = render(<Lnb />);
    expect(screen.getByRole('link', { name: '더보기' })).toHaveAttribute('href', '/?panel=more');
    expect(screen.getByRole('link', { name: '검색' })).toHaveAttribute('aria-current', 'page');
    unmount();

    location.search = '?panel=more&page=account';
    render(<Lnb />);
    expect(screen.getByRole('link', { name: '더보기' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '검색' })).not.toHaveAttribute('aria-current');
  });

  it('패널을 접으면 검색도 더보기도 표시하지 않는다', () => {
    location.search = '?panel=closed';
    render(<Lnb />);
    for (const name of ['검색', '강의평', '친구 시간표', '더보기']) {
      expect(screen.getByRole('link', { name })).not.toHaveAttribute('aria-current');
    }
  });
});
