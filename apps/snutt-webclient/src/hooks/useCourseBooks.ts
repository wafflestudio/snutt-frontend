import { useQuery } from '@tanstack/react-query';

import { serviceContext } from '@/contexts/ServiceContext';
import { useGuardContext } from '@/hooks/useGuardContext';

export const useCourseBooks = () => {
  const { semesterService } = useGuardContext(serviceContext);
  return useQuery({ queryKey: ['course_books'], queryFn: () => semesterService.getCourseBooks(), staleTime: Infinity });
};
