export type FriendId = string;

/** 친구 목록의 세 가지: 친구 · 받은 요청 · 보낸 요청 */
export type FriendState = 'active' | 'requested' | 'requesting';

export const FRIEND_STATES: readonly FriendState[] = ['active', 'requested', 'requesting'];

export type Friend = {
  /** 친구 관계의 ID. 수락 · 거절 · 삭제에 쓴다 */
  id: FriendId;
  userId: string;
  /** 서버가 정한 닉네임과 네 자리 태그. 친구 요청은 `닉네임#0000` 으로 보낸다 */
  nickname: string;
  nicknameTag: string;
  /** 내가 붙인 이름. 없으면 null */
  displayName: string | null;
  createdAt: Date;
};

/** 목록에 보여 줄 이름: 내가 붙인 이름, 없으면 닉네임 */
export const getFriendName = ({ displayName, nickname }: Pick<Friend, 'displayName' | 'nickname'>) =>
  displayName ?? nickname;

/** { nickname: '와플', nicknameTag: '0562' } → '와플#0562' */
export const formatNicknameWithTag = ({ nickname, nicknameTag }: Pick<Friend, 'nickname' | 'nicknameTag'>) =>
  `${nickname}#${nicknameTag}`;
