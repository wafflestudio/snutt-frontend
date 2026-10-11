'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import { clsx } from 'clsx';
import type { ReactElement, ReactNode } from 'react';
import { POPUP_CLASSES, POPUP_ITEM_CLASSES } from './popup';

export type MenuProps = {
  /** 메뉴를 여는 버튼. 보통 `<IconButton label="더보기" icon={<IconMoreHorizontal />} />` */
  trigger: ReactElement;
  children: ReactNode;
  /** 버튼 기준으로 목록을 어느 쪽에 맞출지. 화면 오른쪽 끝의 버튼이면 end */
  align?: 'start' | 'center' | 'end';
  className?: string;
};

/**
 * 누르면 펼쳐지는 동작 목록 (시간표 헤더의 ··· 등). 값을 고르는 것이면 Select 를 쓴다.
 * 키보드: 방향키로 이동, Enter 로 실행, Esc 로 닫기.
 */
export function Menu({ trigger, children, align = 'start', className }: MenuProps) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={4} align={align} className="z-50">
          <BaseMenu.Popup className={clsx(POPUP_CLASSES, 'min-w-36', className)}>{children}</BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export type MenuItemProps = {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
};

export function MenuItem({ onClick, children, disabled }: MenuItemProps) {
  return (
    <BaseMenu.Item onClick={onClick} disabled={disabled} className={POPUP_ITEM_CLASSES}>
      {children}
    </BaseMenu.Item>
  );
}
