import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { IconButton } from '@/shared/ui/IconButton';
import { IconChevronLeft, IconClose } from '@/shared/ui/icons';

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

type PanelNavProps = {
  /** `<` 의 이름. 무엇으로 돌아가는지 쓴다 (`목록으로`) */
  backLabel: string;
  onBack: () => void;
  /** `×`: 패널을 접는다 */
  onClose: () => void;
};

/** 패널 맨 위의 `<` 와 `×` (Figma 강의 상세 · 직접 추가). 둘의 뜻은 디자인 문의 4-8 */
export function PanelNav({ backLabel, onBack, onClose }: PanelNavProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <IconButton label={backLabel} icon={<IconChevronLeft />} onClick={onBack} />
      <IconButton label="패널 접기" icon={<IconClose />} onClick={onClose} />
    </div>
  );
}
