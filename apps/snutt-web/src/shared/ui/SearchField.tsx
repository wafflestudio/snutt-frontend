import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';
import { IconSearch } from '@/shared/ui/icons';

export type SearchFieldProps = Omit<ComponentProps<'input'>, 'type'> & {
  /** 오른쪽 끝에 두는 요소. 검색 패널의 필터 버튼 */
  trailing?: ReactNode;
};

/** 둥근 검색창 (검색 패널, 필터 모달의 학과 검색). className 은 배치에만 쓴다. */
export function SearchField({ trailing, className, ...props }: SearchFieldProps) {
  return (
    <div
      className={clsx(
        'flex h-10.5 items-center gap-2.5 rounded-full border border-line-light bg-light-field pr-2 pl-3.5 text-med',
        'focus-within:border-snutt-mint',
        className,
      )}
    >
      <IconSearch className="size-5 shrink-0" />
      <input
        type="search"
        className="h-full min-w-0 flex-1 bg-transparent text-body text-normal outline-none placeholder:text-med"
        {...props}
      />
      {trailing}
    </div>
  );
}
