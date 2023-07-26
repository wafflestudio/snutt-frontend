import { useQuery } from '@tanstack/react-query';
import { FullTimetable } from '../../entities/timetable';
import { useServiceContext } from '../../main';

export const useTimetable = (id: FullTimetable['_id']) => {
  const { timetableService } = useServiceContext();
  return useQuery(['timetable', id], ({ queryKey }) => timetableService.getTimetable(queryKey[1]));
};
