import type { SnuttV2 } from '@sf/snutt-api';
import type { Friend, FriendState } from '@/domain/friend';
import type { Timetable } from '@/domain/timetable';
import { toColorPair, toTimetable } from './timetable';

// v2 친구 응답 → domain 타입. 내가 이름을 붙이지 않은 친구는 displayName 이 빠져서 온다 (dev 서버에서 확인)

export const toFriend = (friend: SnuttV2.FriendResponse): Friend => ({
  id: String(friend.id),
  userId: String(friend.userId),
  nickname: friend.nickname,
  nicknameTag: friend.nicknameTag,
  displayName: friend.displayName ?? null,
  createdAt: new Date(friend.createdAt),
});

const FRIEND_STATE_QUERY = { active: 'ACTIVE', requested: 'REQUESTED', requesting: 'REQUESTING' } as const;

/** `GET /v2/friends` 의 state 값 */
export const toFriendStateQuery = (state: FriendState) => FRIEND_STATE_QUERY[state];

/**
 * 친구의 기본 시간표. 친구의 테마(직접 만든 테마일 수 있다)는 내 테마 목록에 없을 수 있어서,
 * 강의 색은 팔레트 번호 대신 서버가 친구의 테마로 정해 준 `color` 를 그대로 쓴다.
 * (dev 서버 응답에서 `color` 가 테마 팔레트의 paletteIndex 번째 색과 같은 것을 확인, 2026-11-14)
 */
export const toFriendTimetable = (timetable: SnuttV2.TimetableResponse): Timetable => {
  const mapped = toTimetable(timetable);
  return {
    ...mapped,
    lectures: mapped.lectures.map((lecture, index) => ({
      ...lecture,
      color: { type: 'custom', color: toColorPair(timetable.lectures[index].color) },
    })),
  };
};
