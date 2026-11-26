import { describe, expect, it } from 'vitest';
import {
  formatNicknameWithTag,
  getFriendLabel,
  getFriendName,
  isValidDisplayName,
  parseNicknameWithTag,
} from '@/domain/friend';

describe('friend', () => {
  it('이름: 내가 붙인 이름이 있으면 그것, 없으면 닉네임', () => {
    expect(getFriendName({ displayName: '룸메', nickname: '시간표장인' })).toBe('룸메');
    expect(getFriendName({ displayName: null, nickname: '와플' })).toBe('와플');
  });

  it('닉네임과 태그는 #로 잇는다', () => {
    expect(formatNicknameWithTag({ nickname: '와플', nicknameTag: '0562' })).toBe('와플#0562');
  });

  it('목록에 보여 줄 이름: 붙인 이름, 없으면 닉네임#태그', () => {
    expect(getFriendLabel({ displayName: '룸메', nickname: '시간표장인', nicknameTag: '0562' })).toBe('룸메');
    expect(getFriendLabel({ displayName: null, nickname: '와플', nicknameTag: '7052' })).toBe('와플#7052');
  });

  it('닉네임#태그 나누기: 태그는 숫자 네 자리, 앞뒤 공백은 지운다', () => {
    expect(parseNicknameWithTag(' 도전하는 초코우유#4563 ')).toEqual({
      nickname: '도전하는 초코우유',
      nicknameTag: '4563',
    });
    expect(parseNicknameWithTag('a#b#0001')).toEqual({ nickname: 'a#b', nicknameTag: '0001' });
    expect(parseNicknameWithTag('와플')).toBeNull();
    expect(parseNicknameWithTag('와플#123')).toBeNull();
    expect(parseNicknameWithTag('와플#12345')).toBeNull();
    expect(parseNicknameWithTag('#1234')).toBeNull();
  });

  it('친구 이름: 공백 포함 한/영/숫자 10자 이내', () => {
    expect(isValidDisplayName('김와플')).toBe(true);
    expect(isValidDisplayName('Room mate 1')).toBe(false); // 11자
    expect(isValidDisplayName('Roommate 1')).toBe(true); // 10자
    expect(isValidDisplayName('  와플  ')).toBe(true);
    expect(isValidDisplayName('   ')).toBe(false);
    expect(isValidDisplayName('와플!')).toBe(false);
  });
});
