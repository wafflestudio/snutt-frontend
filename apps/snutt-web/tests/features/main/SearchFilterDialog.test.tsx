// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchPanel } from '@/features/main/components/SearchPanel';
import { SAMPLE_COURSEBOOK, SAMPLE_PALETTE, SAMPLE_SEMESTERS, SAMPLE_TIMETABLES } from '@/features/main/sample-data';
import { fakeSnutt } from '../../msw/fake-snutt';
import { server } from '../../msw/server';

// 시간표 1: 월 · 목 9:00~11:45, 화 · 목 15:00~16:50, 수 14:00~17:00, 금 14:30~17:00
const timetable = SAMPLE_TIMETABLES[0];

beforeEach(() => {
  server.use(
    ...fakeSnutt({
      timetables: SAMPLE_TIMETABLES,
      semesters: SAMPLE_SEMESTERS,
      palette: SAMPLE_PALETTE,
      coursebook: SAMPLE_COURSEBOOK,
    }).handlers,
  );
});

afterEach(() => window.localStorage.clear());

// 예시 수강편람: 경영전략(3학년 · ★4.2) · 마케팅원론(2학년) · 운영관리(3학년 · 전필). 모두 경영대학 경영학과
const renderPanel = async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <SearchPanel
        semester={timetable.semester}
        timetable={timetable}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onOpen={vi.fn()}
        onFailure={vi.fn()}
        onGoToBookmarks={vi.fn()}
      />
    </QueryClientProvider>,
  );
  await screen.findAllByRole('article');
};

const resultNames = () => screen.queryAllByRole('article').map((article) => article.getAttribute('aria-label'));
const dialog = () => within(screen.getByRole('dialog', { name: '검색 필터' }));
const openFilter = async (page: string) => {
  await userEvent.click(screen.getByRole('button', { name: '검색 필터' }));
  await userEvent.click(dialog().getByRole('button', { name: page }));
};
const apply = () => userEvent.click(dialog().getByRole('button', { name: '필터 적용' }));

describe('검색 필터', () => {
  it('고른 값의 강의만 찾고, 칩의 × 로 그 조건만 지운다', async () => {
    await renderPanel();
    expect(resultNames()).toEqual(['경영전략', '마케팅원론', '운영관리']);

    await openFilter('학년');
    await userEvent.click(await dialog().findByRole('checkbox', { name: '3학년' }));
    // 모달 아래에 고른 필터를 칩으로 보여 준다
    expect(dialog().getByRole('button', { name: '3학년 제거' })).toBeInTheDocument();
    await apply();
    await waitFor(() => expect(resultNames()).toEqual(['경영전략', '운영관리']));

    await openFilter('분류');
    await userEvent.click(await dialog().findByRole('checkbox', { name: '전필' }));
    await apply();
    await waitFor(() => expect(resultNames()).toEqual(['운영관리']));

    await userEvent.click(screen.getByRole('button', { name: '전필 제거' }));
    await waitFor(() => expect(resultNames()).toEqual(['경영전략', '운영관리']));
  });

  it('필터 적용을 누르지 않고 닫으면 고른 것을 버린다', async () => {
    await renderPanel();
    await openFilter('학년');
    await userEvent.click(await dialog().findByRole('checkbox', { name: '2학년' }));
    await userEvent.click(dialog().getByRole('button', { name: '닫기' }));

    expect(screen.queryByRole('button', { name: '2학년 제거' })).not.toBeInTheDocument();
    await openFilter('학년');
    expect(await dialog().findByRole('checkbox', { name: '2학년' })).not.toBeChecked();
  });

  it('정렬기준은 하나만 고르고, 다시 누르면 기본 순서로 돌아간다', async () => {
    await renderPanel();
    await openFilter('정렬기준');
    const rating = dialog().getByRole('checkbox', { name: '평점 높은 순' });
    const count = dialog().getByRole('checkbox', { name: '강의평 많은 순' });
    await userEvent.click(count);
    await userEvent.click(rating);
    expect(rating).toBeChecked();
    expect(count).not.toBeChecked();
    await userEvent.click(rating);
    expect(rating).not.toBeChecked();
  });

  it('학과는 이름으로 찾고, ★ 를 누르면 즐겨찾기에 따로 보여 준다', async () => {
    await renderPanel();
    await openFilter('학과');
    expect(await dialog().findByRole('checkbox', { name: '경영대학 경영학과' })).toBeInTheDocument();
    expect(dialog().queryByRole('region', { name: '즐겨찾기' })).not.toBeInTheDocument();

    await userEvent.click(dialog().getByRole('button', { name: '경영대학 경영학과 즐겨찾기' }));
    const favorites = within(dialog().getByRole('region', { name: '즐겨찾기' }));
    expect(favorites.getByRole('checkbox', { name: '경영대학 경영학과' })).toBeInTheDocument();

    await userEvent.type(dialog().getByRole('searchbox', { name: '학과 검색' }), '철학');
    expect(dialog().queryByRole('checkbox', { name: '경영대학 경영학과' })).not.toBeInTheDocument();
  });
});

describe('검색 필터의 시간', () => {
  const cell = (name: string) => screen.getByRole('button', { name });
  /** 마우스로 from 칸을 누르고 to 칸까지 끌어서 뗀다 */
  const drag = (from: string, to: string) => {
    fireEvent.pointerDown(cell(from), { button: 0 });
    fireEvent.pointerEnter(cell(to));
    fireEvent.pointerUp(window);
  };

  it('시간대 직접 선택하기로 시간대 검색 모달을 열어 고른 시간에 들어가는 강의만 찾는다', async () => {
    await renderPanel();
    await openFilter('시간');
    await userEvent.click(dialog().getByRole('checkbox', { name: '시간대 직접 선택하기' }));
    // 운영관리는 금 9:00~10:15
    drag('금 09:00~09:30', '금 10:00~10:30');
    await userEvent.click(screen.getByRole('button', { name: '완료' }));
    expect(dialog().getByRole('checkbox', { name: '시간대 직접 선택하기' })).toBeChecked();
    await apply();

    await waitFor(() => expect(resultNames()).toEqual(['운영관리']));
    await userEvent.click(screen.getByRole('button', { name: '시간대 검색 제거' }));
    await waitFor(() => expect(resultNames()).toHaveLength(3));
  });

  it('빈시간대만 검색하면 시간표의 강의와 겹치는 강의를 뺀다', async () => {
    await renderPanel();
    await openFilter('시간');
    await userEvent.click(dialog().getByRole('checkbox', { name: '빈시간대만 검색하기' }));
    await apply();

    // 경영전략(담긴 강의) · 마케팅원론은 월 9:00~11:45 와 겹친다
    await waitFor(() => expect(resultNames()).toEqual(['운영관리']));
    expect(screen.getByRole('button', { name: '빈 시간대만 제거' })).toBeInTheDocument();
  });
});
