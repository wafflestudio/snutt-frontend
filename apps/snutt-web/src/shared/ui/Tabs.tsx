'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { clsx } from 'clsx';
import { createContext, type ReactNode, use } from 'react';

/**
 * - underline: 밑줄 탭 (검색 패널의 검색 · 강의 목록 · 관심강좌)
 * - segmented: 회색 배경 위 버튼형 (강의 상세 / 강의평 전환)
 */
export type TabsVariant = 'underline' | 'segmented';

const VariantContext = createContext<TabsVariant>('underline');

const LIST_CLASSES: Record<TabsVariant, string> = {
  underline: 'flex gap-4 border-b border-line-light',
  segmented: 'inline-flex gap-0.75 rounded-md bg-light-field p-0.75',
};

const TAB_CLASSES: Record<TabsVariant, string> = {
  // 선택된 탭 밑줄은 글자색(text-normal)을 따른다. 글자 색 토큰은 border 에 쓸 수 없어서 border-current 를 쓴다
  underline:
    '-mb-px border-b-2 border-transparent pb-1 text-title3 font-semibold text-med data-active:border-current data-active:font-bold data-active:text-normal',
  segmented:
    'rounded-sm px-2.5 py-0.5 text-body font-semibold text-assistive data-active:bg-normal data-active:text-alternative',
};

export type TabsProps<Value extends string> = {
  value: Value;
  onValueChange: (value: Value) => void;
  variant?: TabsVariant;
  children: ReactNode;
  className?: string;
};

/**
 * 탭 묶음. 선택 상태는 부모가 가진다. (메인 화면에서는 MainView 와 URL 에 둔다)
 * 키보드: 좌우 방향키로 이동, Enter / Space 로 선택.
 */
export function Tabs<Value extends string>({
  value,
  onValueChange,
  variant = 'underline',
  children,
  className,
}: TabsProps<Value>) {
  return (
    <VariantContext value={variant}>
      <BaseTabs.Root
        value={value}
        // Tab 에 넘긴 값만 들어오므로 Value 로 좁혀도 안전하다
        onValueChange={(next) => onValueChange(next as Value)}
        className={className}
      >
        {children}
      </BaseTabs.Root>
    </VariantContext>
  );
}

export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  const variant = use(VariantContext);
  return <BaseTabs.List className={clsx(LIST_CLASSES[variant], className)}>{children}</BaseTabs.List>;
}

export function Tab({ value, children }: { value: string; children: ReactNode }) {
  const variant = use(VariantContext);
  return (
    <BaseTabs.Tab
      value={value}
      className={clsx(
        'shrink-0 whitespace-nowrap outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint',
        TAB_CLASSES[variant],
      )}
    >
      {children}
    </BaseTabs.Tab>
  );
}

export function TabPanel({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  return (
    <BaseTabs.Panel value={value} className={clsx('outline-none', className)}>
      {children}
    </BaseTabs.Panel>
  );
}
