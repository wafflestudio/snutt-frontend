// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DayTimeRange } from '@/domain/time';
import { EMPTY_TIME_FILTER, type TimeFilter } from '@/domain/time-filter';
import { SearchPanel } from '@/features/main/components/SearchPanel';
import { TimeSearchDialog } from '@/features/main/components/TimeSearchDialog';
import { SAMPLE_COURSEBOOK, SAMPLE_PALETTE, SAMPLE_SEMESTERS, SAMPLE_TIMETABLES } from '@/features/main/sample-data';
import { fakeSnutt } from '../../msw/fake-snutt';
import { server } from '../../msw/server';

// 시간표 1: 월 · 목 9:00~11:45, 화 · 목 15:00~16:50, 수 14:00~17:00, 금 14:30~17:00
const timetable = SAMPLE_TIMETABLES[0];
const occupied = timetable.lectures.flatMap(({ classTimes }) => classTimes);

const cell = (name: string) => screen.getByRole('button', { name });

/** 마우스로 from 칸을 누르고 to 칸까지 끌어서 뗀다 */
const drag = (from: string, to: string) => {
  fireEvent.pointerDown(cell(from), { button: 0 });
  fireEvent.pointerEnter(cell(to));
  fireEvent.pointerUp(window);
};

describe('TimeSearchDialog', () => {
  function Harness({
    initial = EMPTY_TIME_FILTER,
    onChange,
  }: {
    initial?: TimeFilter;
    onChange: (v: TimeFilter) => void;
  }) {
    const [open, setOpen] = useState(true);
    const [value, setValue] = useState(initial);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          열기
        </button>
        <TimeSearchDialog
          open={open}
          onOpenChange={setOpen}
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
          occupied={occupied}
        />
      </>
    );
  }

  it('안내는 확인을 누르면 사라진다', async () => {
    render(<Harness onChange={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { name: '시간대 검색' });
    expect(within(dialog).getByText('검색하고 싶은 시간을 드래그하세요.')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: '확인' }));
    expect(within(dialog).queryByText('검색하고 싶은 시간을 드래그하세요.')).not.toBeInTheDocument();
  });

  it('시간표의 수업 시간을 회색으로 보여 준다 (월~금 9~22시 그리드)', () => {
    render(<Harness onChange={vi.fn()} />);
    expect(document.querySelectorAll('[data-occupied-block]')).toHaveLength(occupied.length);
    expect(cell('금 21:30~22:00')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '토 09:00~09:30' })).not.toBeInTheDocument();
  });

  it('드래그한 시간과 빈 시간대만 검색을 완료하면 구간으로 바꿔 준다', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    drag('화 09:00~09:30', '화 10:30~11:00');
    drag('금 09:00~09:30', '금 09:00~09:30');
    await userEvent.click(screen.getByRole('checkbox', { name: '빈 시간대만 검색' }));
    await userEvent.click(screen.getByRole('button', { name: '완료' }));

    expect(onChange).toHaveBeenCalledWith({
      times: [
        { day: 1, startMinute: 540, endMinute: 660 },
        { day: 4, startMinute: 540, endMinute: 570 },
      ],
      emptyOnly: true,
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('다시 열면 적용한 조건이 골라져 있고, 초기화는 모두 지운다', async () => {
    const onChange = vi.fn();
    const times: DayTimeRange[] = [{ day: 2, startMinute: 600, endMinute: 660 }];
    render(<Harness initial={{ times, emptyOnly: true }} onChange={onChange} />);
    expect(cell('수 10:00~10:30')).toHaveAttribute('aria-pressed', 'true');
    expect(cell('수 10:30~11:00')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('checkbox', { name: '빈 시간대만 검색' })).toBeChecked();

    await userEvent.click(screen.getByRole('button', { name: '초기화' }));
    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
    expect(screen.getByRole('checkbox', { name: '빈 시간대만 검색' })).not.toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: '완료' }));
    expect(onChange).toHaveBeenCalledWith(EMPTY_TIME_FILTER);
  });

  it('닫기(×)로 닫으면 고친 것을 버린다', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    drag('화 09:00~09:30', '화 09:00~09:30');
    await userEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: '열기' }));
    expect(cell('화 09:00~09:30')).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('검색 패널의 시간대 검색', () => {
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

  it('필터 버튼으로 모달을 열어 고른 시간에 들어가는 강의만 찾고, 칩의 × 로 조건을 지운다', async () => {
    await renderPanel();
    expect(resultNames()).toEqual(['경영전략', '마케팅원론', '운영관리']);

    await userEvent.click(screen.getByRole('button', { name: '시간대 검색' }));
    // 운영관리는 금 9:00~10:15
    drag('금 09:00~09:30', '금 10:00~10:30');
    await userEvent.click(screen.getByRole('button', { name: '완료' }));

    await waitFor(() => expect(resultNames()).toEqual(['운영관리']));
    await userEvent.click(screen.getByRole('button', { name: '시간대 검색 제거' }));
    await waitFor(() => expect(resultNames()).toHaveLength(3));
  });

  it('빈 시간대만 검색하면 시간표의 강의와 겹치는 강의를 뺀다', async () => {
    await renderPanel();
    await userEvent.click(screen.getByRole('button', { name: '시간대 검색' }));
    await userEvent.click(screen.getByRole('checkbox', { name: '빈 시간대만 검색' }));
    await userEvent.click(screen.getByRole('button', { name: '완료' }));

    // 경영전략(담긴 강의) · 마케팅원론은 월 9:00~11:45 와 겹친다
    await waitFor(() => expect(resultNames()).toEqual(['운영관리']));
    expect(screen.getByRole('button', { name: '빈 시간대만 제거' })).toBeInTheDocument();
  });
});
