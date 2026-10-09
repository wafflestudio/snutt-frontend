'use client';

import { useState } from 'react';
import type { TimetableSummary } from '@/domain/timetable';
import { ConfirmDialog, PromptDialog } from '@/shared/ui/Dialog';
import { IconButton } from '@/shared/ui/IconButton';
import { IconAdd, IconMoreHorizontal } from '@/shared/ui/icons';
import { Menu, MenuItem } from '@/shared/ui/Menu';

/*
 * 새 시간표 이름 입력, 이름 변경, 삭제 확인 팝업은 Figma 에 없어서 확인 팝업(`팝업 예시`) 모양을 쓴다. (디자인 문의 4-7)
 */

type AddTimetableButtonProps = {
  /** 입력칸에 미리 채워 둘 이름 (`시간표 N`) */
  defaultTitle: string;
  onCreate: (title: string) => void;
};

/** 탭 옆의 + : 이름을 입력받아 새 시간표를 만든다 */
export function AddTimetableButton({ defaultTitle, onCreate }: AddTimetableButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton label="새 시간표" icon={<IconAdd />} onClick={() => setOpen(true)} />
      <PromptDialog
        open={open}
        onOpenChange={setOpen}
        title="새 시간표 이름"
        defaultValue={defaultTitle}
        onSubmit={onCreate}
        submitLabel="만들기"
      />
    </>
  );
}

type TimetableMenuProps = {
  timetable: Pick<TimetableSummary, 'title' | 'isPrimary'>;
  onRename: (title: string) => void;
  onSetPrimary: (isPrimary: boolean) => void;
  onRemove: () => void;
};

/** 헤더의 ··· : 고른 시간표의 이름 변경, 기본 시간표 지정 · 해제, 삭제 */
export function TimetableMenu({ timetable, onRename, onSetPrimary, onRemove }: TimetableMenuProps) {
  const [dialog, setDialog] = useState<'rename' | 'remove' | null>(null);
  const closeDialog = (open: boolean) => {
    if (!open) setDialog(null);
  };

  return (
    <>
      <Menu trigger={<IconButton label="시간표 메뉴" icon={<IconMoreHorizontal />} />} align="end">
        <MenuItem onClick={() => setDialog('rename')}>이름 변경</MenuItem>
        <MenuItem onClick={() => onSetPrimary(!timetable.isPrimary)}>
          {timetable.isPrimary ? '기본 시간표 해제' : '기본 시간표로 지정'}
        </MenuItem>
        <MenuItem onClick={() => setDialog('remove')}>삭제</MenuItem>
      </Menu>

      <PromptDialog
        open={dialog === 'rename'}
        onOpenChange={closeDialog}
        title="시간표 이름 변경"
        defaultValue={timetable.title}
        onSubmit={onRename}
      />
      <ConfirmDialog
        open={dialog === 'remove'}
        onOpenChange={closeDialog}
        message={`‘${timetable.title}’ 시간표를 삭제하시겠습니까?`}
        onConfirm={onRemove}
        confirmLabel="삭제"
      />
    </>
  );
}
