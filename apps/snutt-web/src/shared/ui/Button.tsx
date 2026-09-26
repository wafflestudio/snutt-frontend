import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'md' | 'sm';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-snutt-mint text-on-bg',
  secondary: 'bg-light text-med',
  outline: 'border border-line-border text-med',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  // 직접 추가 폼의 추가 / 취소, 팝업의 확인 / 취소
  md: 'h-9.5 gap-1.5 rounded-md px-4 text-headline font-medium [&>svg]:size-5',
  // 헤더의 직접 추가 · 시간표 비교
  sm: 'h-6 gap-1 rounded-xs px-2 text-caption1 [&>svg]:size-4',
};

export type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/**
 * 글자가 있는 버튼. 아이콘을 함께 넣으려면 children 에 아이콘 컴포넌트를 앞에 둔다.
 * className 은 여백 · 너비 같은 배치에만 쓴다. 색과 크기는 variant / size 로 바꾼다.
 */
export function Button({ variant = 'primary', size = 'md', type = 'button', className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-opacity',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}
