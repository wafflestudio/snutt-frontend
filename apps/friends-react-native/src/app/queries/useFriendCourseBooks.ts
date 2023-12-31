import { useQuery } from '@tanstack/react-query';

import { FriendId } from '../../entities/friend';
import { useServiceContext } from '../contexts/ServiceContext';

export const useFriendCourseBooks = (friendId: FriendId | undefined) => {
  const { friendService } = useServiceContext();
  return useQuery({
    queryKey: ['friend', friendId, 'registeredCourseBooks'] as const,
    queryFn: ({ queryKey: [, params] }) => {
      if (!params) throw new Error();
      return friendService.getFriendCourseBooks({ friendId: params });
    },
    enabled: !!friendId,
  });
};
