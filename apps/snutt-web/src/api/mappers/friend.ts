import type { SnuttV2 } from '@sf/snutt-api';
import type { Friend, FriendState } from '@/domain/friend';

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
