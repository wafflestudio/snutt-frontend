// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from '@/shared/ui/Switch';

function Controlled({ onChange }: { onChange: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <Switch
      label="자동 맞춤"
      checked={checked}
      onCheckedChange={(next) => {
        setChecked(next);
        onChange(next);
      }}
    />
  );
}

describe('Switch', () => {
  it('누르거나 스페이스로 켜고 끈다', async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: '자동 맞춤' });
    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
    await userEvent.keyboard(' ');
    expect(toggle).not.toBeChecked();
    expect(onChange.mock.calls).toEqual([[true], [false]]);
  });

  it('disabled 면 바꾸지 않는다', async () => {
    const onChange = vi.fn();
    render(<Switch label="꽉찬 시간표" checked={false} onCheckedChange={onChange} disabled />);
    await userEvent.click(screen.getByRole('switch', { name: '꽉찬 시간표' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
