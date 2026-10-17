import { describe, expect, it } from 'vitest';
import { toFriend, toFriendStateQuery } from '@/api/mappers/friend';
import { FRIEND_RESPONSES } from '../../msw/fixtures';

describe('friend mapper', () => {
  it('친구: ID 는 문자열, 빠진 displayName 은 null, createdAt 은 Date', () => {
    expect(toFriend(FRIEND_RESPONSES[0])).toEqual({
      id: '10',
      userId: '79615',
      nickname: '와플',
      nicknameTag: '7052',
      displayName: null,
      createdAt: new Date(1693807592108),
    });
    expect(toFriend(FRIEND_RESPONSES[1]).displayName).toBe('룸메');
  });

  it('목록 종류는 서버의 대문자 state 로 보낸다', () => {
    expect(toFriendStateQuery('active')).toBe('ACTIVE');
    expect(toFriendStateQuery('requested')).toBe('REQUESTED');
    expect(toFriendStateQuery('requesting')).toBe('REQUESTING');
  });
});
