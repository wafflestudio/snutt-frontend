import { CourseBook } from '../entities/courseBook';
import { FriendId } from '../entities/friend';
import { Semester } from '../entities/semester';
import { FullTimetable } from '../entities/timetable';
import { DisplayName, Nickname, NicknameTag } from '../entities/user';
import { Year } from '../entities/year';
import { AcceptFriendWithKakaoResponse } from '../repositories/responses/Friend';

export type FriendService = {
  listFriends: (req: {
    state: 'ACTIVE' | 'REQUESTED' | 'REQUESTING';
  }) => Promise<{ friendId: FriendId; nickname: Nickname; tag: NicknameTag; displayName?: DisplayName }[]>;
  requestFriend: (req: { nickname: Nickname }) => Promise<void>;
  acceptFriend: (
    req: { type: 'NICKNAME'; friendId: FriendId } | { type: 'KAKAO'; requestToken: string },
  ) => Promise<void | AcceptFriendWithKakaoResponse>;
  declineFriend: (req: { friendId: FriendId }) => Promise<void>;
  deleteFriend: (req: { friendId: FriendId }) => Promise<void>;
  getFriendPrimaryTable: (req: { friendId: FriendId; semester: Semester; year: Year }) => Promise<FullTimetable>;
  getFriendCourseBooks: (req: { friendId: FriendId }) => Promise<CourseBook[]>;
  patchFriendDisplayName: (req: { friendId: FriendId; displayName: DisplayName }) => Promise<void>;
  generateToken: () => Promise<{ requestToken: string }>;

  formatNickname: (
    req: { nickname: Nickname; tag: NicknameTag; displayName?: DisplayName },
    options?: { type: 'default' | 'displayName' | 'nickname' },
  ) => string;
  isValidNicknameTag: (str: string) => boolean;
  isValidDisplayName: (str: string) => boolean;
};
