// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from '@/shared/ui/Toast';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('Toast', () => {
  it('잠시 뒤 저절로 닫히고, 커서를 올린 동안은 닫히지 않는다', () => {
    const onOpenChange = vi.fn();
    render(<Toast open onOpenChange={onOpenChange} message="관심강좌에 추가되었습니다." />);
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('관심강좌에 추가되었습니다.');

    fireEvent.mouseEnter(toast);
    act(() => vi.advanceTimersByTime(10_000));
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.mouseLeave(toast);
    act(() => vi.advanceTimersByTime(4000));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('버튼을 누르면 할 일을 하고 닫힌다', () => {
    const onOpenChange = vi.fn();
    const onClick = vi.fn();
    render(<Toast open onOpenChange={onOpenChange} message="추가되었습니다." action={{ label: '보기', onClick }} />);
    fireEvent.click(screen.getByRole('button', { name: '보기' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('닫혀 있으면 그리지 않는다', () => {
    render(<Toast open={false} onOpenChange={() => {}} message="추가되었습니다." />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
