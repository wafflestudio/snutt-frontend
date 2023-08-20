import { useQuery } from '@tanstack/react-query';

import { CourseBook } from '../../entities/courseBook';
import { FriendId } from '../../entities/friend';
import { useServiceContext } from '../contexts/ServiceContext';

export const useFriendPrimaryTable = (params: { friendId: FriendId; courseBook: CourseBook } | undefined) => {
  const { friendService } = useServiceContext();
  return useQuery(
    ['friendPrimaryTable', params] as const,
    ({ queryKey: [, p] }) => {
      if (!p) throw new Error();
      return friendService.getFriendPrimaryTable({
        friendId: p.friendId,
        semester: p.courseBook.semester,
        year: p.courseBook.year,
      });
    },
    { enabled: !!params },
  );
};
