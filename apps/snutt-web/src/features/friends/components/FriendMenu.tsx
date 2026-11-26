'use client';

import type { ReactElement } from 'react';
import { IconEdit, IconTrash } from '@/shared/ui/icons';
import { Menu, MenuItem } from '@/shared/ui/Menu';

type FriendMenuProps = {
  /** 목록 줄의 ⋮, 시간표 헤더의 ··· */
  trigger: ReactElement;
  onRename: () => void;
  onDelete: () => void;
};

/** 친구 한 명에 대한 동작 (Figma 친구 시간표 `드롭다운`): 친구 이름 설정 · 목록에서 삭제 */
export function FriendMenu({ trigger, onRename, onDelete }: FriendMenuProps) {
  return (
    <Menu trigger={trigger} align="end">
      <MenuItem icon={<IconEdit />} onClick={onRename}>
        친구 이름 설정
      </MenuItem>
      <MenuItem icon={<IconTrash />} variant="danger" onClick={onDelete}>
        목록에서 삭제
      </MenuItem>
    </Menu>
  );
}
