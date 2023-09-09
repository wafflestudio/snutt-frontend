import { FriendRepository } from '../repositories/friendRepository';
import { createFriendService } from './createFriendService';

describe('createFriendService', () => {
  const friendService = createFriendService({ repositories: [{} as FriendRepository] });
  it('isValidDisplayName', () => {
    expect(friendService.isValidDisplayName('asdf1234')).toBe(true);
  });
});
