// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from '@/shared/ui/IconButton';
import { IconFilter } from '@/shared/ui/icons';
import { SearchField } from '@/shared/ui/SearchField';

describe('SearchField', () => {
  it('입력한 값을 onChange 로 전달하고 trailing 을 함께 그린다', async () => {
    const onChange = vi.fn();
    render(
      <SearchField
        aria-label="강의 검색"
        onChange={(e) => onChange(e.target.value)}
        trailing={<IconButton label="필터" icon={<IconFilter />} />}
      />,
    );
    await userEvent.type(screen.getByRole('searchbox', { name: '강의 검색' }), '미국');
    expect(onChange).toHaveBeenLastCalledWith('미국');
    expect(screen.getByRole('button', { name: '필터' })).toBeInTheDocument();
  });
});
