import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

/**
 * 폼 입력칸 (직접 추가, 강의 편집). 라벨은 바깥에서 <label> 로 연결한다.
 * 값이 없는 필드는 domain 에서 null 이므로 `value={lecture.instructor ?? ''}` 처럼 넘긴다. (CLAUDE.md "API 층")
 */
export function TextField({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={clsx(
        'h-9 w-full min-w-0 rounded-md border border-line-light bg-normal px-3 text-body text-plain',
        'outline-none placeholder:text-assistive focus:border-snutt-mint',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    />
  );
}
