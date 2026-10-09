// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from '@/shared/ui/IconButton';
import { IconMoreHorizontal } from '@/shared/ui/icons';
import { Menu, MenuItem } from '@/shared/ui/Menu';

describe('Menu', () => {
  it('버튼을 누르면 펼쳐지고, 항목을 누르면 실행하고 닫힌다', async () => {
    const onSetPrimary = vi.fn();
    render(
      <Menu trigger={<IconButton label="시간표 메뉴" icon={<IconMoreHorizontal />} />}>
        <MenuItem onClick={onSetPrimary}>기본 시간표로 지정</MenuItem>
        <MenuItem onClick={() => {}}>삭제</MenuItem>
      </Menu>,
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '시간표 메뉴' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: '기본 시간표로 지정' }));
    expect(onSetPrimary).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('키보드로 열고 고를 수 있다', async () => {
    const onDelete = vi.fn();
    render(
      <Menu trigger={<IconButton label="시간표 메뉴" icon={<IconMoreHorizontal />} />}>
        <MenuItem onClick={() => {}}>기본 시간표로 지정</MenuItem>
        <MenuItem onClick={onDelete}>삭제</MenuItem>
      </Menu>,
    );
    screen.getByRole('button', { name: '시간표 메뉴' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onDelete).toHaveBeenCalledOnce();
  });
});
