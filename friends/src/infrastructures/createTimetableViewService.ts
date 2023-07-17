import { TimetableViewService } from '../usecases/timetableViewService';

export const createTimetableViewService = (): TimetableViewService => {
  return {
    getDayRange: () => [0, 6],
    getHourRange: () => [9, 18],
    getDayLabel: (day) => ({ 0: '월', 1: '화', 2: '수', 3: '목', 4: '금', 5: '토', 6: '일' }[day]),
  };
};
