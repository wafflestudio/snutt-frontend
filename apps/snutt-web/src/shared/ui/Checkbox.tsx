'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { IconCheckCircleFill } from './icons';

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** 오른쪽의 글자. 누르면 함께 켜고 끈다 */
  children: ReactNode;
  className?: string;
};

/**
 * Figma `체크박스 버튼` (15px): 고르지 않으면 회색 테두리 원, 고르면 민트 체크 원. 글자와 한 줄로 쓴다 (필터 모달, 시간대 검색).
 * className 은 배치에만 쓴다.
 */
export function Checkbox({ checked, onCheckedChange, children, className }: CheckboxProps) {
  return (
    <label className={clsx('flex cursor-pointer items-center gap-2 text-14-regular text-plain', className)}>
      <BaseCheckbox.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="flex size-3.75 shrink-0 items-center justify-center rounded-full border border-line-divider text-snutt-mint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint data-checked:border-0"
      >
        <BaseCheckbox.Indicator render={<IconCheckCircleFill className="size-4.5 shrink-0" />} />
      </BaseCheckbox.Root>
      {children}
    </label>
  );
}
