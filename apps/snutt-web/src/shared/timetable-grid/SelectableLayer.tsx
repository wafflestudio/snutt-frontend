'use client';

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { layoutGridBlocks } from '@/domain/grid-layout';
import { DAY_LABELS, formatMinute } from '@/domain/time';
import {
  applyDragSelection,
  getSlotCount,
  selectionToRanges,
  TIME_FILTER_SLOT_MINUTES,
  type TimeSelection,
  type TimeSlot,
} from '@/domain/time-filter';
import { getBlockStyle, useGridRange } from './TimetableGrid';

export type SelectableLayerProps = {
  /** 그리드 범위와 같은 크기의 선택 (createTimeSelection, rangesToSelection 으로 만든다) */
  selection: TimeSelection;
  onSelectionChange: (selection: TimeSelection) => void;
  /** 칸 묶음의 이름. 스크린 리더가 읽는다 */
  label: string;
};

type Drag = { from: TimeSlot; to: TimeSlot };

/**
 * 30분 칸을 드래그해서 고르는 레이어 (시간대 검색). 고른 칸은 민트 블록으로 그리고, 이어진 칸은 블록 하나로 합친다.
 * 드래그를 시작한 칸이 골라져 있었으면 드래그한 사각형을 해제하고, 아니면 고른다. 손을 떼야 onSelectionChange 를 부른다.
 *
 * 칸마다 버튼(aria-pressed)이 있어 키보드로도 고를 수 있다. 화살표로 칸을 옮기고 Enter · Space 로 한 칸씩 고르거나 해제한다.
 * 칸 버튼은 하나만 Tab 으로 들어오고(roving tabindex), 처음에는 첫 칸이다.
 */
export function SelectableLayer({ selection, onSelectionChange, label }: SelectableLayerProps) {
  const range = useGridRange();
  const slotCount = getSlotCount(range);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [focused, setFocused] = useState<TimeSlot>({ column: 0, row: 0 });
  const cellsRef = useRef<HTMLDivElement>(null);

  // 드래그하는 동안에는 손을 뗐을 때의 결과를 미리 그린다
  const blocks = useMemo(() => {
    const shown = drag ? applyDragSelection(selection, drag.from, drag.to) : selection;
    return layoutGridBlocks(
      selectionToRanges(shown, range).map((time) => ({ item: null, time })),
      range,
    );
  }, [selection, drag, range]);

  // 그리드 밖에서 손을 떼도 드래그를 끝낸다
  useEffect(() => {
    if (!drag) return;
    const finish = () => {
      onSelectionChange(applyDragSelection(selection, drag.from, drag.to));
      setDrag(null);
    };
    const cancel = () => setDrag(null);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [drag, selection, onSelectionChange]);

  const moveFocus = (event: KeyboardEvent) => {
    const delta = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = {
      column: clamp(focused.column + delta[0], range.days.length - 1),
      row: clamp(focused.row + delta[1], slotCount - 1),
    };
    setFocused(next);
    cellsRef.current?.querySelector<HTMLElement>(`[data-slot="${next.column}-${next.row}"]`)?.focus();
  };

  return (
    <div className="absolute inset-0 touch-none select-none">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {blocks.map((block) => (
          <div
            key={`${block.time.day}-${block.time.startMinute}`}
            data-selected-block
            // Figma `시간대 검색`: SNUTT/mint · 50%. 아래의 회색(찬 시간) 블록과 겹치면 진하게 보인다
            className="absolute bg-snutt-mint/50"
            style={getBlockStyle(block, range.days.length)}
          />
        ))}
      </div>

      <div
        ref={cellsRef}
        role="group"
        aria-label={label}
        onKeyDown={moveFocus}
        className="absolute inset-0 grid grid-flow-col"
        style={{
          gridTemplateColumns: `repeat(${range.days.length}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${slotCount}, minmax(0, 1fr))`,
        }}
      >
        {range.days.flatMap((day, column) =>
          Array.from({ length: slotCount }, (_, row) => {
            const slot = { column, row };
            const startMinute = range.startMinute + row * TIME_FILTER_SLOT_MINUTES;
            const isFocused = focused.column === column && focused.row === row;
            return (
              <button
                key={`${column}-${row}`}
                type="button"
                data-slot={`${column}-${row}`}
                tabIndex={isFocused ? 0 : -1}
                aria-pressed={selection[column]?.[row] ?? false}
                aria-label={`${DAY_LABELS[day]} ${formatMinute(startMinute)}~${formatMinute(startMinute + TIME_FILTER_SLOT_MINUTES)}`}
                className="cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-snutt-dark-mint1"
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  // 드래그하는 동안 글자가 선택되지 않게 한다
                  event.preventDefault();
                  setFocused(slot);
                  setDrag({ from: slot, to: slot });
                }}
                onPointerEnter={() => drag && setDrag({ ...drag, to: slot })}
                onFocus={() => setFocused(slot)}
                // 마우스로 누르면 pointerup 에서 이미 바뀌었으므로, 키보드로 누를 때(detail 0)만 한 칸을 바꾼다
                onClick={(event) => event.detail === 0 && onSelectionChange(applyDragSelection(selection, slot, slot))}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);
