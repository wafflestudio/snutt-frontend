// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { GridRange } from '@/domain/grid-layout';
import { createTimeSelection, selectionToRanges, type TimeSelection } from '@/domain/time-filter';
import { OccupiedLayer } from '@/shared/timetable-grid/OccupiedLayer';
import { SelectableLayer } from '@/shared/timetable-grid/SelectableLayer';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';

// 월~수, 9~11시 → 3열 x 4칸(30분)
const range: GridRange = { days: [0, 1, 2], startMinute: 540, endMinute: 660 };

function Selectable({ onChange }: { onChange?: (selection: TimeSelection) => void }) {
  const [selection, setSelection] = useState(() => createTimeSelection(range));
  return (
    <TimetableGrid range={range}>
      <SelectableLayer
        selection={selection}
        onSelectionChange={(next) => {
          setSelection(next);
          onChange?.(next);
        }}
        label="검색할 시간"
      />
    </TimetableGrid>
  );
}

const cell = (name: string) => screen.getByRole('button', { name });
const pressed = () =>
  screen
    .getAllByRole('button', { pressed: true })
    .map((button) => button.getAttribute('aria-label'))
    .sort();

/** 마우스로 from 칸을 누르고 to 칸까지 끌어서 뗀다 */
const drag = (from: string, to: string) => {
  fireEvent.pointerDown(cell(from), { button: 0 });
  fireEvent.pointerEnter(cell(to));
  fireEvent.pointerUp(window);
};

describe('SelectableLayer', () => {
  it('요일 · 30분마다 칸이 있다', () => {
    render(<Selectable />);
    expect(screen.getAllByRole('button')).toHaveLength(12);
    expect(cell('월 09:00~09:30')).toHaveAttribute('aria-pressed', 'false');
    expect(cell('수 10:30~11:00')).toBeInTheDocument();
  });

  it('드래그한 사각형을 고르고, 손을 뗄 때 onSelectionChange 를 부른다', () => {
    const onChange = vi.fn();
    render(<Selectable onChange={onChange} />);

    fireEvent.pointerDown(cell('월 09:30~10:00'), { button: 0 });
    fireEvent.pointerEnter(cell('화 10:00~10:30'));
    // 끄는 동안에는 블록만 미리 그린다
    expect(document.querySelectorAll('[data-selected-block]')).toHaveLength(2);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.pointerUp(window);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(selectionToRanges(onChange.mock.calls[0][0], range)).toEqual([
      { day: 0, startMinute: 570, endMinute: 630 },
      { day: 1, startMinute: 570, endMinute: 630 },
    ]);
    expect(pressed()).toEqual(['월 09:30~10:00', '월 10:00~10:30', '화 09:30~10:00', '화 10:00~10:30']);
  });

  it('고른 칸에서 드래그를 시작하면 해제한다', () => {
    render(<Selectable />);
    drag('월 09:00~09:30', '월 10:30~11:00');
    drag('월 09:30~10:00', '월 10:00~10:30');
    expect(pressed()).toEqual(['월 09:00~09:30', '월 10:30~11:00']);
  });

  it('왼쪽 버튼이 아니면 드래그하지 않는다', () => {
    const onChange = vi.fn();
    render(<Selectable onChange={onChange} />);
    fireEvent.pointerDown(cell('월 09:00~09:30'), { button: 2 });
    fireEvent.pointerUp(window);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('키보드: 화살표로 칸을 옮기고 Enter · Space 로 한 칸씩 고른다', async () => {
    render(<Selectable />);
    await userEvent.tab();
    expect(cell('월 09:00~09:30')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    expect(cell('화 09:30~10:00')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(pressed()).toEqual(['화 09:30~10:00']);
    await userEvent.keyboard(' ');
    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);

    // 끝에서는 더 가지 않는다
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowLeft}{ArrowLeft}');
    expect(cell('월 09:00~09:30')).toHaveFocus();
  });
});

describe('OccupiedLayer', () => {
  it('찬 시간을 범위 안에서만 회색 블록으로 그린다', () => {
    render(
      <TimetableGrid range={range}>
        <OccupiedLayer
          times={[
            { day: 0, startMinute: 540, endMinute: 600 },
            { day: 4, startMinute: 540, endMinute: 600 }, // 금요일은 범위 밖
          ]}
        />
      </TimetableGrid>,
    );
    expect(document.querySelectorAll('[data-occupied-block]')).toHaveLength(1);
  });
});
