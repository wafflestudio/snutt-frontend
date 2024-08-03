import { FriendId } from '../../entities/friend';
import { UserId } from '../../entities/user';

export type AcceptFriendWithKakaoResponse = {
  id: FriendId;
  userId: UserId;
  nickname: {
    nickname: string;
    tag: string;
  };
};
