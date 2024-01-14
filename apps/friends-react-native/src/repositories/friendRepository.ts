import { CourseBook } from '../entities/courseBook';
import { FriendId } from '../entities/friend';
import { Semester } from '../entities/semester';
import { Timestamp } from '../entities/time';
import { FullTimetable } from '../entities/timetable';
import { DisplayName, Nickname, NicknameTag, UserId } from '../entities/user';
import { Year } from '../entities/year';

export type FriendRepository = {
  listFriends: (req: { state: 'ACTIVE' | 'REQUESTED' | 'REQUESTING' }) => Promise<{
    content: {
      id: FriendId;
      userId: UserId;
      displayName?: DisplayName;
      nickname: { nickname: Nickname; tag: NicknameTag };
      createdAt: Timestamp;
    }[];
  }>;

  requestFriend: (req: { nickname: Nickname }) => Promise<unknown>;

  acceptFriend: (req: { friendId: FriendId }) => Promise<unknown>;

  declineFriend: (req: { friendId: FriendId }) => Promise<unknown>;

  deleteFriend: (req: { friendId: FriendId }) => Promise<unknown>;

  getFriendPrimaryTable: (req: { friendId: FriendId; semester: Semester; year: Year }) => Promise<FullTimetable>;

  getFriendCourseBooks: (req: { friendId: FriendId }) => Promise<CourseBook[]>;

  patchFriendDisplayName: (req: { friendId: FriendId; displayName: DisplayName }) => Promise<unknown>;
};
