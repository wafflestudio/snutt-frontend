import { FriendId } from '../../entities/friend';
import { UserId } from '../../entities/user';

export type AcceptFriendWithKakaoResponse = {
  id: FriendId;
  userId: UserId;
  displayName: string;
};
