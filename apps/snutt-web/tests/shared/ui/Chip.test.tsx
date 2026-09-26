// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Chip } from '@/shared/ui/Chip';

describe('Chip', () => {
  it('onRemove 가 있으면 × 버튼으로 제거할 수 있다', async () => {
    const onRemove = vi.fn();
    render(<Chip label="3학점" color="mint" onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: '3학점 제거' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('onRemove 가 없으면 버튼이 없다', () => {
    render(<Chip label="교양" color="red" />);
    expect(screen.getByText('교양')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
