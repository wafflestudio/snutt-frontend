'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { clsx } from 'clsx';
import { type ReactNode, useState } from 'react';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { IconClose } from './icons';
import { TextField } from './TextField';

// Figma: 검정 20% (Background/deem)
const BACKDROP_CLASSES = 'fixed inset-0 z-40 bg-deem';
const POPUP_POSITION_CLASSES = 'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-normal outline-none';
// Figma `팝업 예시` 의 alert: 폭 264, 둥글기 10, 안쪽 여백 위 36 · 나머지 12, 내용과 버튼 사이 24
const SMALL_POPUP_CLASSES = 'flex w-66 flex-col gap-6 rounded-[10px] px-3 pt-9 pb-3';

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
        <AlertDialog.Popup className={clsx(POPUP_POSITION_CLASSES, SMALL_POPUP_CLASSES)}>
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

export type PromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 무엇을 입력하는지. 예: `시간표 이름` */
  title: string;
  /** 열 때 입력칸에 채워 둘 값. 모두 선택된 채로 열려서 바로 고쳐 쓸 수 있다 */
  defaultValue?: string;
  /** 앞뒤 공백을 지운 값. 비어 있으면 확인을 누를 수 없다 */
  onSubmit: (value: string) => void;
  submitLabel?: string;
};

/**
 * 한 줄을 입력받는 팝업 (시간표 이름). 모양은 확인 팝업과 같고, 질문 자리에 제목과 입력칸이 있다.
 * Enter 로 확인, Esc 나 바깥을 누르면 취소다.
 */
export function PromptDialog({ open, onOpenChange, ...props }: PromptDialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={BACKDROP_CLASSES} />
        <BaseDialog.Popup className={clsx(POPUP_POSITION_CLASSES, SMALL_POPUP_CLASSES)}>
          {/* 열 때마다 새로 그려서 입력값이 defaultValue 로 돌아간다 */}
          <PromptForm {...props} onClose={() => onOpenChange(false)} />
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

function PromptForm({
  title,
  defaultValue = '',
  onSubmit,
  submitLabel = '확인',
  onClose,
}: Omit<PromptDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }) {
  const [value, setValue] = useState(defaultValue);
  const trimmed = value.trim();

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!trimmed) return;
        onSubmit(trimmed);
        onClose();
      }}
    >
      <div className="flex flex-col gap-3">
        <BaseDialog.Title className="text-center text-14-regular">{title}</BaseDialog.Title>
        <TextField
          aria-label={title}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
        />
      </div>
      <div className="flex gap-2">
        <BaseDialog.Close render={<Button variant="secondary" className="flex-1" />}>취소</BaseDialog.Close>
        <Button type="submit" className="flex-1" disabled={!trimmed}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
