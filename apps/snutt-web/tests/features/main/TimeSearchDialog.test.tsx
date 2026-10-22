// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DayTimeRange } from '@/domain/time';
import { EMPTY_TIME_FILTER, type TimeFilter } from '@/domain/time-filter';
import { TimeSearchDialog } from '@/features/main/components/TimeSearchDialog';
import { SAMPLE_TIMETABLES } from '@/features/main/sample-data';

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
