import { CourseBook } from '../entities/courseBook';
import { FriendId } from '../entities/friend';
import { Semester } from '../entities/semester';
import { FullTimetable } from '../entities/timetable';
import { Nickname, NicknameTag } from '../entities/user';
import { Year } from '../entities/year';

export type FriendService = {
  listFriends: (req: {
    state: 'ACTIVE' | 'REQUESTED' | 'REQUESTING';
  }) => Promise<{ friendId: FriendId; nickname: Nickname; tag: NicknameTag }[]>;
  requestFriend: (req: { nickname: Nickname }) => Promise<void>;
  acceptFriend: (req: { friendId: FriendId }) => Promise<void>;
  declineFriend: (req: { friendId: FriendId }) => Promise<void>;
  deleteFriend: (req: { friendId: FriendId }) => Promise<void>;
  getFriendPrimaryTable: (req: { friendId: FriendId; semester: Semester; year: Year }) => Promise<FullTimetable>;
  getFriendRegisteredSemesters: (req: { friendId: FriendId }) => Promise<CourseBook[]>;
};
