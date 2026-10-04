'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { IconClose } from './icons';

// Figma: 검정 20% (Background/deem)
const BACKDROP_CLASSES = 'fixed inset-0 z-40 bg-deem';
const POPUP_POSITION_CLASSES = 'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-normal outline-none';

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  /** 크기와 안쪽 배치. Figma 필터 모달은 695 × 648 */
  className?: string;
};

/**
 * 큰 모달 (필터). 바깥을 누르거나 Esc 를 누르면 닫힌다. 닫으면 열기 전에 포커스가 있던 곳으로 돌아간다.
 * 안에 DialogTitle 을 하나 넣어 모달 이름을 정한다.
 */
export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={BACKDROP_CLASSES} />
        <BaseDialog.Popup
          className={clsx(
            POPUP_POSITION_CLASSES,
            'max-h-[calc(100dvh-2.5rem)] rounded-[15px] shadow-[0_0_50px_10px_rgb(4_30_29/10%)]',
            className,
          )}
        >
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <BaseDialog.Title className={clsx('text-17-bold', className)}>{children}</BaseDialog.Title>;
}

/** 모달 닫기 (×). 위치는 className 으로 정한다. */
export function DialogCloseButton({ className }: { className?: string }) {
  return <BaseDialog.Close render={<IconButton label="닫기" icon={<IconClose />} className={className} />} />;
}

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 묻는 말. 예: `관심강좌 탭으로 이동하시겠습니까?` */
  message: ReactNode;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

/**
 * 확인 팝업 (Figma `팝업 예시`): 한 줄 질문과 취소 · 확인. 바깥을 눌러도 닫히지 않고, 취소 · 확인 · Esc 로만 닫힌다.
 * 확인을 누르면 onConfirm 을 부르고 닫는다.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  message,
  onConfirm,
  confirmLabel = '확인',
  cancelLabel = '취소',
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={BACKDROP_CLASSES} />
        {/* Figma: 폭 264, 둥글기 10, 안쪽 여백 위 36 · 나머지 12, 질문과 버튼 사이 24, 버튼 사이 8 */}
        <AlertDialog.Popup
          className={clsx(POPUP_POSITION_CLASSES, 'flex w-66 flex-col gap-6 rounded-[10px] px-3 pt-9 pb-3')}
        >
          <AlertDialog.Title className="text-center text-14-regular">{message}</AlertDialog.Title>
          <div className="flex gap-2">
            <AlertDialog.Close render={<Button variant="secondary" className="flex-1" />}>
              {cancelLabel}
            </AlertDialog.Close>
            <Button
              className="flex-1"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
