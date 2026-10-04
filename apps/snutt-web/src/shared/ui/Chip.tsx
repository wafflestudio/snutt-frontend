import { clsx } from 'clsx';
import { IconClose } from '@/shared/ui/icons';

/** Figma `검색 필터칩` 의 8가지. 필터 종류마다 어떤 색을 쓰는지는 디자이너에게 확인 중이다. (docs/snutt-web-design-questions.md) */
export type ChipColor = 'gray' | 'red' | 'orange' | 'lime' | 'mint' | 'blue' | 'navy' | 'purple';

// Tailwind 가 클래스를 찾을 수 있게 전체 이름으로 적는다
const COLOR_CLASSES: Record<ChipColor, string> = {
  // Figma 가 회색 칩 배경에 글자 색 토큰 Text/Assistive 를 쓴다. 글자 색 토큰은 bg-* 로 쓸 수 없어 변수를 직접 쓴다
  gray: 'bg-(--text-color-assistive)',
  red: 'bg-snutt-red',
  orange: 'bg-snutt-orange',
  lime: 'bg-snutt-lime',
  mint: 'bg-snutt-mint',
  blue: 'bg-snutt-blue',
  navy: 'bg-snutt-navy',
  purple: 'bg-snutt-purple',
};

export type ChipProps = {
  label: string;
  color: ChipColor;
  /** 있으면 × 버튼을 보여 준다 */
  onRemove?: () => void;
  className?: string;
};

/** 적용된 검색 필터 (`3학점 ×`). className 은 배치에만 쓴다. */
export function Chip({ label, color, onRemove, className }: ChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex h-6.5 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-12-medium whitespace-nowrap text-on-bg',
        COLOR_CLASSES[color],
        className,
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${label} 제거`}
          className="-mr-1 inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-current"
        >
          <IconClose className="size-3.5" />
        </button>
      )}
    </span>
  );
}
