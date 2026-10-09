// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog, Dialog, DialogCloseButton, DialogTitle } from '@/shared/ui/Dialog';

function ConfirmExample({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>담기</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        message="관심강좌 탭으로 이동하시겠습니까?"
        onConfirm={onConfirm}
      />
    </>
  );
}

function ModalExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>필터 열기</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTitle>필터</DialogTitle>
        <DialogCloseButton />
      </Dialog>
    </>
  );
}

describe('ConfirmDialog', () => {
  it('확인을 누르면 onConfirm 을 부르고 닫힌다', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmExample onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: '담기' }));
    expect(screen.getByRole('alertdialog', { name: '관심강좌 탭으로 이동하시겠습니까?' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('취소를 누르면 onConfirm 없이 닫히고, 연 버튼으로 포커스가 돌아간다', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmExample onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: '담기' }));
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '담기' })).toHaveFocus();
  });
});

describe('Dialog', () => {
  it('제목으로 이름이 붙고, 닫기 버튼과 Esc 로 닫힌다', async () => {
    render(<ModalExample />);
    await userEvent.click(screen.getByRole('button', { name: '필터 열기' }));
    expect(screen.getByRole('dialog', { name: '필터' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '필터 열기' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
