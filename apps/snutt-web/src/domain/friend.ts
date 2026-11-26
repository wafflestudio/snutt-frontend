export type FriendId = string;

/** 친구 목록의 세 가지: 친구 · 받은 요청 · 보낸 요청 */
export type FriendState = 'active' | 'requested' | 'requesting';

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

/** 내가 붙인 이름, 없으면 닉네임 */
export const getFriendName = ({ displayName, nickname }: Pick<Friend, 'displayName' | 'nickname'>) =>
  displayName ?? nickname;

/** { nickname: '와플', nicknameTag: '0562' } → '와플#0562' */
export const formatNicknameWithTag = ({ nickname, nicknameTag }: Pick<Friend, 'nickname' | 'nicknameTag'>) =>
  `${nickname}#${nicknameTag}`;

/** 목록 · 시간표 헤더에 보여 줄 이름: 내가 붙인 이름, 없으면 `닉네임#태그` (Figma 친구 시간표) */
export const getFriendLabel = (friend: Pick<Friend, 'displayName' | 'nickname' | 'nicknameTag'>) =>
  friend.displayName ?? formatNicknameWithTag(friend);

/**
 * 친구 요청에 쓰는 `닉네임#0000` 을 나눈다. 앞뒤 공백은 지운다. 형식이 맞지 않으면 null.
 * 닉네임에 #이 들어갈 수 없다고 보고 마지막 # 으로 나눈다.
 */
export const parseNicknameWithTag = (input: string): Pick<Friend, 'nickname' | 'nicknameTag'> | null => {
  const match = /^(.+)#(\d{4})$/.exec(input.trim());
  if (!match) return null;
  const nickname = match[1].trim();
  return nickname ? { nickname, nicknameTag: match[2] } : null;
};

/** 친구 이름의 최대 길이 (Figma `친구 이름 설정`: 공백 포함 한/영/숫자 10자 이내) */
export const DISPLAY_NAME_MAX_LENGTH = 10;

/** 친구 이름으로 쓸 수 있는지: 앞뒤 공백을 지우고 1 ~ 10자, 한글 · 영문 · 숫자 · 공백만 */
export const isValidDisplayName = (name: string) => {
  const trimmed = name.trim();
  return (
    trimmed.length > 0 && trimmed.length <= DISPLAY_NAME_MAX_LENGTH && /^[ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9 ]+$/.test(trimmed)
  );
};
