import { useQuery } from '@tanstack/react-query';

import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import { useGuardContext } from '@/hooks/useGuardContext';

export const useFullTimetable = (id: string | undefined) => {
  const { timetableService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);

  return useQuery({
    queryKey: ['TimetableService', 'getFullTimetable', { id, token }] as const,
    queryFn: ({ queryKey: [, , { id, token }] }) => {
      if (!id) throw new Error('no id');
      return timetableService.getFullTimetable({ id, token });
    },
    enabled: !!id,
    select: (data) => (data?.type === 'success' ? data.data : undefined),
  });
};
