import { describe, expect, it } from 'vitest';

import type { GridRange } from './grid-layout';
import {
  applyDragSelection,
  createTimeSelection,
  getSlotCount,
  rangesToSelection,
  selectionToRanges,
} from './time-filter';

// 월~수, 9~12시 → 3열 x 6칸(30분)
const range: GridRange = { days: [0, 1, 2], startMinute: 540, endMinute: 720 };

const selected = (selection: boolean[][]) =>
  selection.flatMap((rows, column) => rows.flatMap((v, row) => (v ? [`${column}:${row}`] : [])));

describe('createTimeSelection', () => {
  it('요일 수 x 30분 칸 수 만큼 빈 선택을 만든다', () => {
    expect(getSlotCount(range)).toBe(6);
    const selection = createTimeSelection(range);
    expect(selection).toHaveLength(3);
    expect(selection.every((rows) => rows.length === 6 && rows.every((v) => !v))).toBe(true);
  });
});

describe('applyDragSelection', () => {
  it('빈 칸에서 시작하면 사각형 영역을 선택한다', () => {
    const next = applyDragSelection(createTimeSelection(range), { column: 0, row: 1 }, { column: 1, row: 2 });
    expect(selected(next)).toEqual(['0:1', '0:2', '1:1', '1:2']);
  });

  it('역방향으로 드래그해도 같은 영역이다', () => {
    const next = applyDragSelection(createTimeSelection(range), { column: 1, row: 2 }, { column: 0, row: 1 });
    expect(selected(next)).toEqual(['0:1', '0:2', '1:1', '1:2']);
  });

  it('선택된 칸에서 시작하면 영역을 해제한다', () => {
    const all = applyDragSelection(createTimeSelection(range), { column: 0, row: 0 }, { column: 2, row: 5 });
    const next = applyDragSelection(all, { column: 1, row: 0 }, { column: 1, row: 5 });
    expect(next[1].every((v) => !v)).toBe(true);
    expect(next[0].every((v) => v)).toBe(true);
  });

  it('원본을 바꾸지 않는다', () => {
    const selection = createTimeSelection(range);
    applyDragSelection(selection, { column: 0, row: 0 }, { column: 0, row: 0 });
    expect(selected(selection)).toEqual([]);
  });
});

describe('selectionToRanges', () => {
  it('연속된 칸은 하나의 구간으로 합친다', () => {
    const selection = applyDragSelection(createTimeSelection(range), { column: 0, row: 1 }, { column: 0, row: 3 });
    expect(selectionToRanges(selection, range)).toEqual([{ day: 0, startMinute: 570, endMinute: 660 }]);
  });

  it('떨어진 칸은 따로 나눈다', () => {
    let selection = createTimeSelection(range);
    selection = applyDragSelection(selection, { column: 0, row: 0 }, { column: 0, row: 0 });
    selection = applyDragSelection(selection, { column: 0, row: 2 }, { column: 0, row: 2 });
    expect(selectionToRanges(selection, range)).toEqual([
      { day: 0, startMinute: 540, endMinute: 570 },
      { day: 0, startMinute: 600, endMinute: 630 },
    ]);
  });

  it('요일은 range.days 의 값으로 변환한다', () => {
    const custom: GridRange = { days: [4, 5], startMinute: 540, endMinute: 600 };
    const selection = applyDragSelection(createTimeSelection(custom), { column: 1, row: 0 }, { column: 1, row: 1 });
    expect(selectionToRanges(selection, custom)).toEqual([{ day: 5, startMinute: 540, endMinute: 600 }]);
  });

  it('선택이 없으면 빈 배열', () => {
    expect(selectionToRanges(createTimeSelection(range), range)).toEqual([]);
  });
});

describe('rangesToSelection', () => {
  it('selectionToRanges 의 결과를 되돌리면 원래 선택과 같다', () => {
    let selection = createTimeSelection(range);
    selection = applyDragSelection(selection, { column: 0, row: 1 }, { column: 1, row: 3 });
    selection = applyDragSelection(selection, { column: 2, row: 5 }, { column: 2, row: 5 });
    expect(rangesToSelection(selectionToRanges(selection, range), range)).toEqual(selection);
  });

  it('칸을 일부만 덮는 구간은 그 칸을 선택하지 않는다', () => {
    const selection = rangesToSelection([{ day: 0, startMinute: 550, endMinute: 600 }], range);
    expect(selected(selection)).toEqual(['0:1']); // 540~570 칸은 일부만 덮임, 570~600 은 전부 덮임
  });

  it('범위에 없는 요일의 구간은 무시한다', () => {
    expect(selected(rangesToSelection([{ day: 6, startMinute: 540, endMinute: 720 }], range))).toEqual([]);
  });
});
