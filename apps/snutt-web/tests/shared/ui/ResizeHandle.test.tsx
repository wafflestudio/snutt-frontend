// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ResizeHandle } from '@/shared/ui/ResizeHandle';

const setup = () => {
  const onCommit = vi.fn();
  function Harness() {
    const [width, setWidth] = useState(430);
    return (
      <ResizeHandle
        label="패널 너비"
        value={width}
        min={320}
        max={640}
        onChange={setWidth}
        onCommit={onCommit}
        onReset={() => setWidth(430)}
      />
    );
  }
  render(<Harness />);
  return { handle: screen.getByRole('separator', { name: '패널 너비' }), onCommit };
};

describe('ResizeHandle', () => {
  it('끌면 움직인 만큼 바뀌고, 범위를 넘지 않으며, 놓을 때 저장한다', () => {
    const { handle, onCommit } = setup();
    fireEvent.pointerDown(handle, { button: 0, clientX: 430, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 480 });
    expect(handle).toHaveAttribute('aria-valuenow', '480');
    fireEvent.pointerMove(handle, { clientX: 1000 });
    expect(handle).toHaveAttribute('aria-valuenow', '640');
    fireEvent.pointerMove(handle, { clientX: 0 });
    expect(handle).toHaveAttribute('aria-valuenow', '320');
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.pointerUp(handle);
    expect(onCommit).toHaveBeenCalledTimes(1);
    // 놓은 뒤에는 움직여도 바뀌지 않는다
    fireEvent.pointerMove(handle, { clientX: 500 });
    expect(handle).toHaveAttribute('aria-valuenow', '320');
  });

  it('방향키로 16px 씩, Home · End 로 끝까지 바꾸고, 더블클릭하면 기본 폭으로 돌아간다', () => {
    const { handle, onCommit } = setup();
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle).toHaveAttribute('aria-valuenow', '446');
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(handle).toHaveAttribute('aria-valuenow', '414');
    fireEvent.keyDown(handle, { key: 'End' });
    expect(handle).toHaveAttribute('aria-valuenow', '640');
    expect(onCommit).toHaveBeenCalledTimes(4);

    fireEvent.doubleClick(handle);
    expect(handle).toHaveAttribute('aria-valuenow', '430');
  });
});
