// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MainScreen } from '@/features/main/components/MainScreen';

// Next 라우터 대신 window.location 을 읽는다. pushState 로 URL 이 바뀌면 다시 그린다. (실제 Next 와 같은 동작)
vi.mock('next/navigation', async () => {
  const { useMemo, useSyncExternalStore } = await import('react');
  const subscribe = (onChange: () => void) => {
    window.addEventListener('test-navigate', onChange);
    return () => window.removeEventListener('test-navigate', onChange);
  };
  return {
    useSearchParams: () => {
      const search = useSyncExternalStore(subscribe, () => window.location.search);
      return useMemo(() => new URLSearchParams(search), [search]);
    },
  };
});

const originalPushState = window.history.pushState.bind(window.history);

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  vi.spyOn(window.history, 'pushState').mockImplementation((...args) => {
    originalPushState(...args);
    window.dispatchEvent(new Event('test-navigate'));
  });
});

afterEach(() => vi.restoreAllMocks());

const panel = (name: string) => screen.queryByRole('complementary', { name });

describe('MainScreen', () => {
  it('처음에는 검색 탭 목록과 시간표를 보여 준다', () => {
    render(<MainScreen />);
    expect(panel('강의 목록')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '검색', selected: true })).toBeInTheDocument();
    expect(screen.getAllByText('월')).toHaveLength(1);
  });

  it('패널을 접었다 펼치면 보던 탭으로 돌아온다', async () => {
    render(<MainScreen />);
    await userEvent.click(screen.getByRole('tab', { name: '강의 목록' }));
    expect(window.location.search).toBe('?tab=lectures');

    await userEvent.click(screen.getByRole('button', { name: '패널 접기' }));
    expect(panel('강의 목록')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '패널 펼치기' }));
    expect(screen.getByRole('tab', { name: '강의 목록', selected: true })).toBeInTheDocument();
  });

  it('직접 추가는 목록 자리를 대신하고, 취소하면 목록으로 돌아온다', async () => {
    render(<MainScreen />);
    await userEvent.click(screen.getByRole('button', { name: '직접 추가' }));
    expect(panel('직접 추가')).toBeInTheDocument();
    expect(panel('강의 목록')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(panel('강의 목록')).toBeInTheDocument();
  });

  it('시간표 비교를 열면 시간표가 두 개가 되고, 패널은 그대로다', async () => {
    render(<MainScreen />);
    await userEvent.click(screen.getByRole('button', { name: '시간표 비교' }));
    expect(screen.getAllByText('월')).toHaveLength(2);
    expect(panel('강의 목록')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '비교 종료' }));
    expect(screen.getAllByText('월')).toHaveLength(1);
  });

  it('URL 에 강의가 있으면 목록 옆에 강의 상세를 열고, 닫을 수 있다', async () => {
    window.history.replaceState(null, '', '/?lecture=l1');
    render(<MainScreen />);
    expect(panel('강의 목록')).toBeInTheDocument();
    expect(panel('강의 상세')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: '강의평' }));
    expect(window.location.search).toBe('?lecture=l1&view=review');

    await userEvent.click(screen.getByRole('button', { name: '강의 상세 닫기' }));
    expect(panel('강의 상세')).not.toBeInTheDocument();
  });
});
