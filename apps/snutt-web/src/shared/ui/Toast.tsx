'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/** 저절로 닫히기까지. Figma 에 정해진 값이 없다 (디자인 문의 4-17) */
const TOAST_DURATION = 4000;

export type ToastProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  /** 글자 오른쪽의 버튼 (`보기`). 누르면 부르고 토스트를 닫는다 */
  action?: { label: string; onClick: () => void };
};

/**
 * 잠깐 떴다 사라지는 알림. Figma `관심강좌 추가` 프레임(10-17): 화면 위 가운데, 336 × 41, 둥글기 10, 여백 12 · 16,
 * 검정 50% · 흐림 4, 글자 Text/onBG, 버튼 SNUTT/milkMint. 커서를 올리거나 포커스가 있는 동안은 닫히지 않는다.
 */
export function Toast({ open, onOpenChange, message, action }: ToastProps) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!open || paused) return;
    const timer = window.setTimeout(() => onOpenChange(false), TOAST_DURATION);
    return () => window.clearTimeout(timer);
  }, [open, paused, onOpenChange]);

  if (!open) return null;
  return createPortal(
    <div
      role="status"
      className="fixed top-5 left-1/2 z-50 flex w-84 -translate-x-1/2 items-center justify-between rounded-[10px] bg-guide px-4 py-3 text-14-medium text-on-bg backdrop-blur-xs"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p>{message}</p>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            onOpenChange(false);
          }}
          className="text-snutt-milk-mint"
        >
          {action.label}
        </button>
      )}
    </div>,
    document.body,
  );
}
