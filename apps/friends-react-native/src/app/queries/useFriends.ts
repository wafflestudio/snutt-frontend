import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useServiceContext } from '../contexts/ServiceContext';
import { FriendId } from '../../entities/friend';

export const useFriends = (req: { state: 'REQUESTED' | 'REQUESTING' | 'ACTIVE' }) => {
  const { friendService } = useServiceContext();
  return useQuery({
    queryKey: ['friends', req] as const,
    queryFn: ({ queryKey: [, params] }) => friendService.listFriends(params),
  });
};

export const useAcceptFriend = () => {
  const queryClient = useQueryClient();
  const { friendService } = useServiceContext();
  return useMutation({
    mutationFn: (req: { type: 'NICKNAME'; friendId: FriendId } | { type: 'KAKAO'; requestToken: string }) =>
      friendService.acceptFriend(req),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useDeclineFriend = () => {
  const queryClient = useQueryClient();
  const { friendService } = useServiceContext();
  return useMutation({
    mutationFn: (friendId: FriendId) => friendService.declineFriend({ friendId }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
