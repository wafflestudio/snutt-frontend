import { describe, expect, it } from 'vitest';
import { toNotification, toUser } from '@/api/mappers/user';

describe('toUser', () => {
  it('로그인 방법을 소문자로, 빠진 이메일은 null 로', () => {
    expect(
      toUser({
        id: 1,
        nickname: '와플',
        nicknameTag: '0562',
        isEmailVerified: false,
        authProviders: ['LOCAL', 'FACEBOOK'],
        isAdmin: false,
      }),
    ).toEqual({
      nickname: '와플',
      nicknameTag: '0562',
      email: null,
      isEmailVerified: false,
      providers: ['local', 'facebook'],
    });
  });
});

describe('toNotification', () => {
  it('종류 번호를 이름으로 바꾸고, 뜻을 모르는 번호는 normal', () => {
    const base = { id: 7, title: '제목', message: '본문', createdAt: 0 };
    expect(toNotification({ ...base, type: 5 })).toEqual({
      id: '7',
      type: 'friend',
      title: '제목',
      message: '본문',
      createdAt: new Date(0),
    });
    expect(toNotification({ ...base, type: 7 }).type).toBe('normal');
  });
});
