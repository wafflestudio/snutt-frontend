import { useQuery } from '@tanstack/react-query';

import { useServiceContext } from '../contexts/ServiceContext';

export const useFriends = (req: { state: 'REQUESTED' | 'REQUESTING' | 'ACTIVE' }) => {
  const { friendService } = useServiceContext();
  return useQuery({
    queryKey: ['friends', req] as const,
    queryFn: ({ queryKey: [, params] }) => friendService.listFriends(params),
  });
};
