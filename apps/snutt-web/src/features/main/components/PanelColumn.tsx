import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type PanelColumnProps = {
  /** 스크린 리더가 읽는 패널 이름 */
  label: string;
  children: ReactNode;
  /** 안쪽 여백과 간격. 패널마다 Figma 값이 다르다 */
  className?: string;
};

/** 패널 한 칸: 폭 430px(Figma), 오른쪽 선. 목록 · 강의 상세 · 직접 추가가 함께 쓴다. */
export function PanelColumn({ label, children, className }: PanelColumnProps) {
  return (
    <aside
      aria-label={label}
      className={clsx('flex w-107.5 shrink-0 flex-col border-r border-line-light bg-normal', className)}
    >
      {children}
    </aside>
  );
}
