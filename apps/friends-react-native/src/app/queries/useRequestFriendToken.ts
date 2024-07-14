import { useQuery } from '@tanstack/react-query';

import { useServiceContext } from '../contexts/ServiceContext';

export const useRequestFriendToken = () => {
  const { friendService } = useServiceContext();

  return useQuery({
    queryKey: ['requestFriendToken'] as const,
    queryFn: () => friendService.generateToken(),
    staleTime: Infinity,
  });
};
