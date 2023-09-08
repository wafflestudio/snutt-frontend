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
    totalCount: number;
    nextPageToken: null; // 현재는 페이징이 없으므로 무조건 null
  }>;

  requestFriend: (req: { nickname: Nickname }) => Promise<void>;

  acceptFriend: (req: { friendId: FriendId }) => Promise<void>;

  declineFriend: (req: { friendId: FriendId }) => Promise<void>;

  deleteFriend: (req: { friendId: FriendId }) => Promise<void>;

  getFriendPrimaryTable: (req: { friendId: FriendId; semester: Semester; year: Year }) => Promise<FullTimetable>;

  getFriendCourseBooks: (req: { friendId: FriendId }) => Promise<CourseBook[]>;

  patchFriendDisplayName: (req: { friendId: FriendId; displayName: DisplayName }) => Promise<void>;
};
