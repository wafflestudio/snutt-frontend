import { useQuery } from '@tanstack/react-query';

import { useServiceContext } from '../contexts/ServiceContext';

export const useColors = () => {
  const { colorService } = useServiceContext();
  return useQuery(['colors'], () => colorService.getColorPalette(), { staleTime: Infinity, cacheTime: Infinity });
};
