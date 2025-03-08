import { useQuery } from '@tanstack/react-query';

import { useServiceContext } from '../contexts/ServiceContext';
import { useThemeContext } from '../contexts/ThemeContext';
import { FullTimetable } from '../../entities/timetable';

export const useColors = (timeTable?: FullTimetable) => {
  const { colorService } = useServiceContext();
  const { theme } = useThemeContext();

  const timeTableTheme = timeTable?.theme || 0;

  return useQuery({
    queryKey: ['colors', theme, timeTableTheme],
    queryFn: () => colorService.getColorPalette(theme, timeTableTheme),
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
