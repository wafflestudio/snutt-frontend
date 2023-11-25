import { useQuery } from '@tanstack/react-query';

import { useServiceContext } from '../contexts/ServiceContext';

export const useColors = () => {
  const { colorService } = useServiceContext();
  return useQuery({
    queryKey: ['colors'],
    queryFn: () => colorService.getColorPalette(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
