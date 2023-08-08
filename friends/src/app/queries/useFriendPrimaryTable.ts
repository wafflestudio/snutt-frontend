import { useQuery } from '@tanstack/react-query';
import { useServiceContext } from '../../main';
import { FriendId } from '../../entities/friend';
import { CourseBook } from '../../entities/courseBook';

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
