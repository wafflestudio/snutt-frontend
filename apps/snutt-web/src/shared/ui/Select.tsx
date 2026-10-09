'use client';

import { Select as BaseSelect } from '@base-ui/react/select';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { IconChevronDown } from './icons';
import { POPUP_CLASSES, POPUP_ITEM_CLASSES } from './popup';

export type SelectOption<Value extends string | number> = {
  value: Value;
  label: string;
  /** 글자 오른쪽에 붙는 것 (색상 견본 등). 버튼과 목록에 함께 보인다. */
  trailing?: ReactNode;
};

/**
 * - field: 테두리 있는 입력칸 (직접 추가의 요일 · 시간, 색상)
 * - title: 테두리 없는 제목 글자 (패널 위의 학기 선택, Figma `연도 선택`)
 */
export type SelectVariant = 'field' | 'title';

const TRIGGER_CLASSES: Record<SelectVariant, string> = {
  field: clsx(
    'flex h-9 w-full min-w-0 justify-between gap-2 rounded-md border border-line-light bg-normal px-3 text-14-regular text-plain',
    'focus-visible:border-snutt-mint data-popup-open:border-snutt-mint',
  ),
  // Figma: 22/Bold, 화살표(Text/Normal)와 간격 10px. 아이콘 상자의 여백만큼 간격을 줄였다
  title:
    'inline-flex gap-1 rounded-sm text-22-bold text-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint',
};

const ICON_CLASSES: Record<SelectVariant, string> = {
  field: 'text-alternative [&>svg]:size-4',
  title: 'text-normal [&>svg]:size-5',
};

export type SelectProps<Value extends string | number> = {
  options: readonly SelectOption<Value>[];
  /** null 이면 placeholder 를 보여 준다. (목록에 없는 값일 때) */
  value: Value | null;
  onValueChange: (value: Value) => void;
  placeholder?: ReactNode;
  /** `<label htmlFor>` 로 이름을 붙일 때 */
  id?: string;
  'aria-label'?: string;
  disabled?: boolean;
  variant?: SelectVariant;
  /** 버튼의 너비 같은 배치 */
  className?: string;
};

/**
 * 목록에서 하나를 고르는 입력칸 (직접 추가의 요일 · 시간, 색상, 학기). field 모양은 TextField 와 같다.
 * 키보드: Enter / Space / 방향키로 열고, 방향키로 이동, Enter 로 선택, Esc 로 닫기. 글자를 치면 그 글자로 시작하는 항목으로 간다.
 */
export function Select<Value extends string | number>({
  options,
  value,
  onValueChange,
  placeholder,
  id,
  'aria-label': ariaLabel,
  disabled,
  variant = 'field',
  className,
}: SelectProps<Value>) {
  const selected = options.find((option) => option.value === value);

  return (
    <BaseSelect.Root
      value={value}
      // 목록에는 options 의 값만 있으므로 Value 로 좁혀도 안전하다
      onValueChange={(next) => {
        if (next !== null) onValueChange(next as Value);
      }}
      disabled={disabled}
    >
      <BaseSelect.Trigger
        id={id}
        aria-label={ariaLabel}
        className={clsx(
          'items-center outline-none data-disabled:cursor-not-allowed data-disabled:opacity-40',
          TRIGGER_CLASSES[variant],
          className,
        )}
      >
        <BaseSelect.Value className="flex min-w-0 items-center gap-2 truncate">
          {() =>
            selected ? (
              <>
                <span className="truncate">{selected.label}</span>
                {selected.trailing}
              </>
            ) : (
              <span className="text-assistive">{placeholder}</span>
            )
          }
        </BaseSelect.Value>
        <BaseSelect.Icon className={clsx('shrink-0', ICON_CLASSES[variant])}>
          <IconChevronDown />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        {/* 목록이 버튼을 덮지 않고 아래로 펼쳐진다 (Figma 색상 드롭다운) */}
        <BaseSelect.Positioner alignItemWithTrigger={false} sideOffset={4} align="start" className="z-50">
          <BaseSelect.Popup className={clsx(POPUP_CLASSES, 'min-w-(--anchor-width)')}>
            <BaseSelect.List>
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  className={clsx(POPUP_ITEM_CLASSES, 'data-selected:text-normal')}
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                  {option.trailing}
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
