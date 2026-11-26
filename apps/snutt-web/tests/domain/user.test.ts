import { describe, expect, it } from 'vitest';
import { formatNotificationDate } from '@/domain/notification';
import { hasLocalAccount, isValidPassword } from '@/domain/user';

describe('isValidPassword', () => {
  it.each([
    ['abc123', true],
    ['abcdefghij1234567890', true],
    ['ab12', false],
    ['abcdefghij12345678901', false],
    ['abcdefg', false],
    ['1234567', false],
  ])('%s → %s (영문과 숫자를 모두 포함한 6~20자)', (password, valid) => {
    expect(isValidPassword(password)).toBe(valid);
  });
});

describe('hasLocalAccount', () => {
  it('아이디 · 비밀번호로 가입했는지', () => {
    expect(hasLocalAccount({ providers: ['local', 'kakao'] })).toBe(true);
    expect(hasLocalAccount({ providers: ['google'] })).toBe(false);
  });
});

describe('formatNotificationDate', () => {
  it('Figma 처럼 한국 시간으로 `2026. 8. 27. 오전 10:28`', () => {
    expect(formatNotificationDate(new Date(Date.UTC(2026, 7, 27, 1, 28)))).toBe('2026. 8. 27. 오전 10:28');
    expect(formatNotificationDate(new Date(Date.UTC(2026, 3, 24, 10, 54)))).toBe('2026. 4. 24. 오후 7:54');
  });
});
