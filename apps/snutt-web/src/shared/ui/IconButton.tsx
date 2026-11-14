import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

export type IconButtonVariant = 'circle' | 'ghost';

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  // 검색 결과의 관심강좌 · 담기 (Figma `관심강좌 버튼` · `Add button`: 30px 원, 아이콘 16px). 아이콘 크기는 아이콘에 준다.
  // `기본` 은 배경 Background/Normal · 아이콘 Icon/nomal, `선택` 은 배경 Background/deem2 · 아이콘 Icon/onItem, 테두리는 둘 다 Line/light (11-09).
  // `선택` 을 호버와 눌린 상태(관심강좌에 담김)에 함께 쓴다 (디자인 문의 4-26)
  circle:
    'size-7.5 rounded-full border border-line-light bg-normal text-icon-normal hover:bg-deem2 hover:text-icon-on-item aria-pressed:bg-deem2 aria-pressed:text-icon-on-item',
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
