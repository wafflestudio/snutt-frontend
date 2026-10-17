import { describe, expect, it } from 'vitest';
import { formatNicknameWithTag, getFriendName } from '@/domain/friend';

describe('friend', () => {
  it('이름: 내가 붙인 이름이 있으면 그것, 없으면 닉네임', () => {
    expect(getFriendName({ displayName: '룸메', nickname: '시간표장인' })).toBe('룸메');
    expect(getFriendName({ displayName: null, nickname: '와플' })).toBe('와플');
  });

  it('닉네임과 태그는 #로 잇는다', () => {
    expect(formatNicknameWithTag({ nickname: '와플', nicknameTag: '0562' })).toBe('와플#0562');
  });
});
