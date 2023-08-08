import { useQuery } from '@tanstack/react-query';
import { FriendId } from '../../entities/friend';
import { useServiceContext } from '../../main';

export const useFriendRegisteredCourseBooks = (friendId: FriendId | undefined) => {
  const { friendService } = useServiceContext();
  return useQuery(
    ['friend', friendId, 'registeredCourseBooks'] as const,
    ({ queryKey: [, params] }) => {
      if (!params) throw new Error();
      return friendService.getFriendRegisteredCourseBooks({ friendId: params });
    },
    { enabled: !!friendId },
  );
};
