import { useQuery } from '@tanstack/react-query';

import { serviceContext } from '@/contexts/ServiceContext';
import { useTokenAuthContext } from '@/contexts/TokenAuthContext';
import { useGuardContext } from '@/hooks/useGuardContext';

export const useCourseBooks = () => {
  const { semesterService } = useGuardContext(serviceContext);
  const { token } = useTokenAuthContext();

  return useQuery({
    queryKey: ['SemesterService', 'getCourseBooks', { token }] as const,
    queryFn: ({ queryKey }) => semesterService.getCourseBooks(queryKey[2]),
    staleTime: Infinity,
  });
};
