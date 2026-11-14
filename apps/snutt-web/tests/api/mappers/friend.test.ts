import { describe, expect, it } from 'vitest';
import { toFriend, toFriendStateQuery, toFriendTimetable } from '@/api/mappers/friend';
import { toTimetable } from '@/api/mappers/timetable';
import { CUSTOM_LECTURE_RESPONSE, FRIEND_RESPONSES, FRIEND_TIMETABLE_RESPONSES } from '../../msw/fixtures';

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

  it('친구 시간표: 강의 색은 팔레트 번호 대신 서버가 정한 color 를 쓴다 (친구 테마가 내 테마 목록에 없을 수 있다)', () => {
    const response = {
      ...FRIEND_TIMETABLE_RESPONSES[0],
      lectures: [...FRIEND_TIMETABLE_RESPONSES[0].lectures, CUSTOM_LECTURE_RESPONSE],
    };
    const timetable = toFriendTimetable(response);

    expect(timetable.lectures.map(({ color }) => color)).toEqual([
      { type: 'custom', color: { bg: '#AABBCC', fg: '#112233' } },
      { type: 'custom', color: { bg: '#123456', fg: '#ffffff' } },
    ]);
    // 색 말고는 내 시간표와 같게 바꾼다
    const mine = toTimetable(response);
    expect(timetable).toEqual({
      ...mine,
      lectures: mine.lectures.map((lecture, index) => ({ ...lecture, color: timetable.lectures[index].color })),
    });
  });
});
