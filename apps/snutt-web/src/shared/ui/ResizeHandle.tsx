'use client';

import { clsx } from 'clsx';
import type { KeyboardEvent, PointerEvent } from 'react';

/** 방향키 한 번에 바뀌는 폭 */
const KEYBOARD_STEP = 16;

export type ResizeHandleProps = {
  /** 스크린 리더가 읽는 이름 (`패널 너비`) */
  label: string;
  value: number;
  min: number;
  max: number;
  /** 드래그 · 방향키로 바뀔 때마다 부른다. 범위 안으로 맞춘 값이다 */
  onChange: (value: number) => void;
  /** 드래그를 마치거나 방향키로 바꾼 뒤 부른다 (저장) */
  onCommit?: () => void;
  /** 더블클릭하면 부른다 (기본 폭으로) */
  onReset?: () => void;
  className?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(value)));

/**
 * 오른쪽 경계를 끌어 폭을 바꾸는 손잡이. 부모를 relative 로 두면 부모의 오른쪽 끝에 붙는다.
 * 키보드: 왼쪽 · 오른쪽 방향키로 16px 씩, Home · End 로 최소 · 최대.
 */
export function ResizeHandle({ label, value, min, max, onChange, onCommit, onReset, className }: ResizeHandleProps) {
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    const startX = event.clientX;
    const startValue = value;
    // 끄는 동안 글자가 선택되지 않고, 커서가 손잡이 밖으로 나가도 모양이 유지되게 한다
    const { cursor, userSelect } = document.body.style;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const move = (moveEvent: globalThis.PointerEvent) =>
      onChange(clamp(startValue + moveEvent.clientX - startX, min, max));
    const end = () => {
      document.body.style.cursor = cursor;
      document.body.style.userSelect = userSelect;
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      onCommit?.();
    };
    // jsdom 에는 setPointerCapture 가 없다
    handle.setPointerCapture?.(event.pointerId);
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = {
      ArrowLeft: value - KEYBOARD_STEP,
      ArrowRight: value + KEYBOARD_STEP,
      Home: min,
      End: max,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(clamp(next, min, max));
    onCommit?.();
  };

  return (
    <div
      role="separator"
      aria-label={label}
      aria-orientation="vertical"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onDoubleClick={onReset}
      // 잡기 쉽게 8px 폭으로 경계선 양쪽에 걸친다. 커서를 올리거나 포커스가 가면 민트 선을 보여 준다
      className={clsx(
        'group absolute inset-y-0 -right-1 z-10 flex w-2 cursor-col-resize touch-none justify-center outline-none',
        className,
      )}
    >
      <span className="w-0.5 bg-snutt-mint opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100" />
    </div>
  );
}
