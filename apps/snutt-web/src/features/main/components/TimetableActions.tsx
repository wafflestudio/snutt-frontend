'use client';

import { useState } from 'react';
import type { TimetableSummary } from '@/domain/timetable';
import { downloadBlob, shareImage, toPngBlob, toPngFileName } from '@/shared/lib/export-image';
import { ConfirmDialog, NoticeDialog, PromptDialog } from '@/shared/ui/Dialog';
import { IconButton } from '@/shared/ui/IconButton';
import { IconAdd, IconDownload, IconMoreHorizontal, IconShare } from '@/shared/ui/icons';
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
  /** 버튼 이름. 비교 중에는 두 헤더에 하나씩 있어 나눈다 */
  label?: string;
  timetable: Pick<TimetableSummary, 'title' | 'isPrimary'>;
  onRename: (title: string) => void;
  onSetPrimary: (isPrimary: boolean) => void;
  onRemove: () => void;
};

/** 헤더의 ··· : 그 헤더 시간표의 이름 변경, 기본 시간표 지정 · 해제, 삭제 */
export function TimetableMenu({
  label = '시간표 메뉴',
  timetable,
  onRename,
  onSetPrimary,
  onRemove,
}: TimetableMenuProps) {
  const [dialog, setDialog] = useState<'rename' | 'remove' | null>(null);
  const closeDialog = (open: boolean) => {
    if (!open) setDialog(null);
  };

  return (
    <>
      <Menu trigger={<IconButton label={label} icon={<IconMoreHorizontal />} />} align="end">
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

type TimetableExportButtonsProps = {
  /** 파일 이름이 된다 (`시간표 1.png`) */
  title: string;
  /** 이미지로 만들 요소 (고른 시간표의 그리드). 아직 그려지지 않았으면 null */
  getTarget: () => HTMLElement | null;
};

/**
 * 헤더의 공유 · 다운로드: 고른 시간표의 그리드를 PNG 로 만든다. 링크 공유는 서버가 지원하지 않아 이미지를 보낸다.
 * 공유는 운영체제의 공유 창을 열고, 파일 공유를 못 하는 브라우저면 클립보드에 복사한다.
 * 지금 Figma 헤더에는 두 아이콘이 없어 예전 시안의 자리(··· 왼쪽)에 아이콘 버튼으로 두었다. (디자인 문의 4-20)
 */
export function TimetableExportButtons({ title, getTarget }: TimetableExportButtonsProps) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileName = toPngFileName(title, '시간표');

  const run = async (action: (render: () => Promise<Blob>) => Promise<string | null>) => {
    const target = getTarget();
    if (!target || busy) return;
    setBusy(true);
    try {
      setNotice(await action(() => toPngBlob(target)));
    } catch {
      setNotice('시간표 이미지를 만들지 못했습니다');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <IconButton
        label="공유"
        icon={<IconShare />}
        disabled={busy}
        onClick={() =>
          run(async (render) =>
            (await shareImage(render, { fileName, title })) === 'copied' ? '시간표 이미지를 복사했습니다' : null,
          )
        }
      />
      <IconButton
        label="다운로드"
        icon={<IconDownload />}
        disabled={busy}
        onClick={() =>
          run(async (render) => {
            downloadBlob(await render(), fileName);
            return null;
          })
        }
      />
      <NoticeDialog open={notice !== null} onOpenChange={(open) => !open && setNotice(null)} message={notice} />
    </>
  );
}
