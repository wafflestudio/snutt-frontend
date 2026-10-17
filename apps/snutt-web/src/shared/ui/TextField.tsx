import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

/**
 * - outline: 흰 바탕에 테두리 (직접 추가). 높이 36
 * - filled: 테두리 없이 Background/light 바탕 (강의 편집). 높이 28
 */
export type TextFieldVariant = 'outline' | 'filled';

const FIELD_CLASSES = clsx(
  'w-full min-w-0 border text-14-regular text-plain',
  'outline-none placeholder:text-assistive focus:border-snutt-mint',
  'disabled:cursor-not-allowed disabled:opacity-40',
);

const VARIANT_CLASSES: Record<TextFieldVariant, string> = {
  // Figma (직접 추가): 글자 왼쪽 여백 약 8
  outline: 'rounded-md border-line-light bg-normal px-2',
  // Figma (강의 편집의 강의명): 둥글기 5, 여백 좌우 6
  filled: 'rounded-[5px] border-transparent bg-light px-1.5',
};

type TextFieldProps = ComponentProps<'input'> & { variant?: TextFieldVariant };

/**
 * 폼 입력칸 (직접 추가, 강의 편집). 라벨은 바깥에서 <label> 로 연결한다.
 * 값이 없는 필드는 domain 에서 null 이므로 `value={lecture.instructor ?? ''}` 처럼 넘긴다. (CLAUDE.md "API 층")
 */
export function TextField({ variant = 'outline', className, ...props }: TextFieldProps) {
  return (
    <input
      className={clsx(variant === 'outline' ? 'h-9' : 'h-7', FIELD_CLASSES, VARIANT_CLASSES[variant], className)}
      {...props}
    />
  );
}

type TextAreaProps = ComponentProps<'textarea'> & { variant?: TextFieldVariant };

/** 여러 줄 입력칸 (비고). 모양은 TextField 와 같고 높이만 두 줄이다. */
export function TextArea({ variant = 'outline', className, rows = 2, ...props }: TextAreaProps) {
  return (
    <textarea
      rows={rows}
      className={clsx(
        'resize-none',
        variant === 'outline' ? 'py-2' : 'py-1',
        FIELD_CLASSES,
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
