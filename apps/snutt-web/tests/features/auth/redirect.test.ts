import { describe, expect, it } from 'vitest';
import { getLoginPath, getNextPath } from '@/features/auth/redirect';

describe('getLoginPath', () => {
  it('돌아갈 곳을 next 에 담고, 메인이면 생략한다', () => {
    expect(getLoginPath('/')).toBe('/login');
    expect(getLoginPath('/friends?tab=1')).toBe('/login?next=%2Ffriends%3Ftab%3D1');
  });
});

describe('getNextPath', () => {
  it('사이트 안의 경로만 받는다', () => {
    expect(getNextPath('?next=%2Ffriends')).toBe('/friends');
    expect(getNextPath('')).toBe('/');
    expect(getNextPath('?next=friends')).toBe('/');
    expect(getNextPath('?next=%2F%2Fevil.example')).toBe('/');
    expect(getNextPath('?next=https%3A%2F%2Fevil.example')).toBe('/');
    expect(getNextPath('?next=%2F%5Cevil.example')).toBe('/');
  });
});
