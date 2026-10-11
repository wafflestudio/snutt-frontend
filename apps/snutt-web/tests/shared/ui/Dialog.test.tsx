// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog, Dialog, DialogCloseButton, DialogTitle, PromptDialog } from '@/shared/ui/Dialog';

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

function PromptExample({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>이름 변경</Button>
      <PromptDialog
        open={open}
        onOpenChange={setOpen}
        title="시간표 이름"
        defaultValue="시간표 1"
        onSubmit={onSubmit}
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

describe('PromptDialog', () => {
  it('기본값이 선택된 채로 열리고, Enter 로 앞뒤 공백을 지운 값을 넘기고 닫힌다', async () => {
    const onSubmit = vi.fn();
    render(<PromptExample onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: '이름 변경' }));

    const input = await screen.findByRole('textbox', { name: '시간표 이름' });
    expect(input).toHaveFocus();
    expect(input).toHaveValue('시간표 1');
    // 모두 선택되어 있어서 바로 치면 바뀐다
    await userEvent.keyboard('  전공 시간표 {Enter}');

    expect(onSubmit).toHaveBeenCalledWith('전공 시간표');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('비어 있으면 확인을 누를 수 없고, 다시 열면 입력값이 기본값으로 돌아간다', async () => {
    const onSubmit = vi.fn();
    render(<PromptExample onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: '이름 변경' }));
    await userEvent.clear(await screen.findByRole('textbox', { name: '시간표 이름' }));
    expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: '이름 변경' }));
    expect(await screen.findByRole('textbox', { name: '시간표 이름' })).toHaveValue('시간표 1');
  });
});
