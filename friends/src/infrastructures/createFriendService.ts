import { FriendRepository } from '../repositories/friendRepository';
import { FriendService } from '../usecases/friendService';

export const createFriendService = ({
  repositories: [friendRepository],
}: {
  repositories: [FriendRepository];
}): FriendService => {
  return {
    listFriends: (req) =>
      friendRepository.listFriends(req).then((res) => res.content.map((c) => ({ friendId: c.id, ...c.nickname }))),
    acceptFriend: (req) => friendRepository.acceptFriend(req),
    declineFriend: (req) => friendRepository.declineFriend(req),
    deleteFriend: (req) => friendRepository.deleteFriend(req),
    requestFriend: (req) => friendRepository.requestFriend(req),
    getFriendPrimaryTable: (req) => friendRepository.getFriendPrimaryTable(req),
    getFriendRegisteredCourseBooks: (req) => friendRepository.getFriendRegisteredCourseBooks(req),

    formatNickname: (req) => `${req.nickname}#${req.tag}`,
    isValidNicknameTag: (str) => {
      const [nickname, tag] = str.split('#');
      if (!nickname || !tag) return false;
      if (nickname.length > 10 || tag.length !== 4) return false;
      if (Number(`${Number(tag)}`) !== Number(tag)) return false;
      return true;
    },
  };
};
