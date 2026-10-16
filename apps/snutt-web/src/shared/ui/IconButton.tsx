import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

export type IconButtonVariant = 'circle' | 'ghost';

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  // 검색 결과의 관심강좌 · 담기 (Figma `관심강좌 버튼`: 30px 원). 아이콘 크기는 버튼마다 달라서(16 · 22) 아이콘에 준다.
  // 배경 #FFFFFF · 60% 는 토큰이 없어 Background/normal 로, 호버 배경 #000000 · 10% 는 같은 값인 Line/cellBorder 로 쓴다 (디자인 문의 2-1, 2-2)
  circle:
    'size-7.5 rounded-full border border-line-border bg-normal hover:bg-line-cell-border hover:text-icon-normal aria-pressed:text-icon-normal',
  // 닫기 · 뒤로 · 더보기처럼 테두리 없는 아이콘
  ghost: 'size-7 rounded-sm hover:bg-light [&>svg]:size-5',
};

export type IconButtonProps = Omit<ComponentProps<'button'>, 'children' | 'aria-label'> & {
  /** 화면에 보이지 않는 버튼 이름. 스크린 리더가 읽는다. */
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
};

/** 아이콘만 있는 버튼. className 은 배치에만 쓴다. */
export function IconButton({ label, icon, variant = 'ghost', type = 'button', className, ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center text-med transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
