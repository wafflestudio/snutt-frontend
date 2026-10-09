// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
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
const tabList = (name: string) => within(screen.getByRole('tablist', { name }));
/** 시간표 탭 이름. 기본 시간표는 `시간표 1, 기본 시간표(15학점)` 처럼 읽힌다 */
const tabNames = (name: string) =>
  tabList(name)
    .queryAllByRole('tab')
    .map((tab) => tab.textContent);
const openTimetableMenu = async (item: string) => {
  await userEvent.click(screen.getByRole('button', { name: '시간표 메뉴' }));
  await userEvent.click(await screen.findByRole('menuitem', { name: item }));
};

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

  describe('시간표 탭', () => {
    it('학기의 기본 시간표를 먼저 보여 주고, 고른 탭에만 학점을 쓴다', async () => {
      render(<MainScreen />);
      expect(tabNames('시간표')).toEqual(['시간표 1, 기본 시간표(15학점)', '시간표 2', '시간표 3']);
      expect(screen.getByText('경영전략')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('tab', { name: '시간표 2' }));
      expect(tabNames('시간표')).toEqual(['시간표 1, 기본 시간표', '시간표 2(9학점)', '시간표 3']);
      expect(screen.getAllByText('자료구조')).toHaveLength(2); // 월 · 수 블록
      expect(screen.queryByText('경영전략')).not.toBeInTheDocument();
    });

    it('+ 로 이름을 정해 새 시간표를 만들면 그 시간표를 고른다', async () => {
      render(<MainScreen />);
      await userEvent.click(screen.getByRole('button', { name: '새 시간표' }));
      expect(await screen.findByRole('textbox', { name: '새 시간표 이름' })).toHaveValue('시간표 4');

      await userEvent.click(screen.getByRole('button', { name: '만들기' }));
      expect(screen.getByRole('tab', { name: '시간표 4(0학점)', selected: true })).toBeInTheDocument();
    });

    it('··· 메뉴로 이름을 바꾸고, 기본 시간표로 지정하고, 삭제한다', async () => {
      render(<MainScreen />);
      await userEvent.click(screen.getByRole('tab', { name: '시간표 2' }));

      await openTimetableMenu('이름 변경');
      await userEvent.clear(await screen.findByRole('textbox', { name: '시간표 이름 변경' }));
      await userEvent.keyboard('전공{Enter}');
      expect(tabNames('시간표')).toEqual(['시간표 1, 기본 시간표', '전공(9학점)', '시간표 3']);

      await openTimetableMenu('기본 시간표로 지정');
      expect(tabNames('시간표')).toEqual(['시간표 1', '전공, 기본 시간표(9학점)', '시간표 3']);

      await openTimetableMenu('삭제');
      expect(await screen.findByText('‘전공’ 시간표를 삭제하시겠습니까?')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: '삭제' }));
      // 기본 시간표가 없으면 첫 시간표를 고른다
      expect(tabNames('시간표')).toEqual(['시간표 1(15학점)', '시간표 3']);
    });

    it('기본 시간표를 해제할 수 있다', async () => {
      render(<MainScreen />);
      await openTimetableMenu('기본 시간표 해제');
      expect(tabNames('시간표')).toEqual(['시간표 1(15학점)', '시간표 2', '시간표 3']);
    });
  });

  describe('학기 선택', () => {
    it('학기를 바꾸면 그 학기의 시간표를 보여 준다', async () => {
      render(<MainScreen />);
      const semester = screen.getByRole('combobox', { name: '학기' });
      expect(semester).toHaveTextContent('2026년 2학기');

      await userEvent.click(semester);
      await userEvent.click(await screen.findByRole('option', { name: '2026년 1학기' }));
      expect(tabNames('시간표')).toEqual(['나의 시간표, 기본 시간표(5학점)']);
    });

    it('여름 · 겨울학기도 고를 수 있고, 시간표가 없는 학기에는 + 만 있다', async () => {
      render(<MainScreen />);
      await userEvent.click(screen.getByRole('combobox', { name: '학기' }));
      await userEvent.click(await screen.findByRole('option', { name: '2026년 여름학기' }));

      expect(screen.queryByRole('tablist', { name: '시간표' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '시간표 메뉴' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '새 시간표' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '시간표 비교' })).toBeDisabled();
    });
  });

  it('비교하는 쪽에는 왼쪽에서 고른 시간표가 없고, 왼쪽에서 그 시간표를 고르면 다른 시간표로 바뀐다', async () => {
    render(<MainScreen />);
    await userEvent.click(screen.getByRole('button', { name: '시간표 비교' }));
    expect(tabNames('비교할 시간표')).toEqual(['시간표 2(9학점)', '시간표 3']);
    // 시간표 2 는 10시부터지만 시간표 1 에 맞춰 두 그리드 모두 9시부터 그린다
    expect(screen.getAllByText('9')).toHaveLength(2);

    await userEvent.click(tabList('시간표').getByRole('tab', { name: '시간표 2' }));
    expect(tabNames('비교할 시간표')).toEqual(['시간표 1, 기본 시간표(15학점)', '시간표 3']);
  });
});
