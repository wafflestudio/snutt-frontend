import type { MouseEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { openInPopup } from '@/shared/lib/open-in-popup';

const click = (init: Partial<MouseEvent<HTMLAnchorElement>> = {}) => {
  const event = {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    preventDefault: vi.fn(),
    currentTarget: { href: 'https://sugang.snu.ac.kr/syllabus' },
    ...init,
  } as unknown as MouseEvent<HTMLAnchorElement>;
  openInPopup(event);
  return event;
};

describe('openInPopup', () => {
  const open = vi.fn();
  vi.stubGlobal('window', { open });
  afterEach(() => open.mockClear());

  it('그냥 누르면 기본 동작을 막고 opener 없는 작은 창으로 연다', () => {
    const event = click();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(open).toHaveBeenCalledWith(
      'https://sugang.snu.ac.kr/syllabus',
      '_blank',
      'popup,width=1024,height=800,noopener,noreferrer',
    );
  });

  it('보조 키나 가운데 버튼으로 누르면 브라우저에 맡긴다', () => {
    for (const init of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
      expect(click(init).preventDefault).not.toHaveBeenCalled();
    }
    expect(open).not.toHaveBeenCalled();
  });
});
