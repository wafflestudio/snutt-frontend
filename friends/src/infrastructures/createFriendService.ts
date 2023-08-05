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
    getFriendRegisteredSemesters: (req) => friendRepository.getFriendRegisteredSemesters(req),
  };
};
