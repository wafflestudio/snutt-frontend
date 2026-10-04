// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { IconClose } from '@/shared/ui/icons';

describe('Button', () => {
  it('기본 type 은 button 이라 폼 안에서 눌러도 제출하지 않는다', async () => {
    const onSubmit = vi.fn((e: SubmitEvent) => e.preventDefault());
    render(
      <form onSubmit={(e) => onSubmit(e.nativeEvent as SubmitEvent)}>
        <Button>취소</Button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disabled 면 눌리지 않는다', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        추가
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: '추가' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('IconButton', () => {
  it('label 이 버튼 이름이 되고 아이콘은 스크린 리더에서 숨는다', () => {
    render(<IconButton label="닫기" icon={<IconClose />} />);
    const button = screen.getByRole('button', { name: '닫기' });
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
