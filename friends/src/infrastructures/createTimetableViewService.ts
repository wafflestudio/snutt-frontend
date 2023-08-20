import { Day, Hour } from '../entities/time';
import { TimetableViewService } from '../usecases/timetableViewService';

export const createTimetableViewService = (): TimetableViewService => {
  return {
    getDayRange: (timetable) => {
      const startDay = 0;
      const endDay = Math.max(...timetable.lectures.flatMap((l) => l.classPlaceAndTimes).map((c) => c.day), 4) as Day;
      return [startDay, endDay];
    },
    getHourRange: (timetable) => {
      const times = timetable.lectures.flatMap((l) => l.classPlaceAndTimes);
      const start = Math.min(...times.map((t) => Math.floor(t.startMinute / 60)), 8) as Hour;
      const end = Math.max(...times.map((t) => Math.ceil(t.endMinute / 60)), 22) as Hour;
      return [start, end];
    },
    getDayLabel: (day) => ({ 0: '월', 1: '화', 2: '수', 3: '목', 4: '금', 5: '토', 6: '일' }[day]),
    getLessonColor: (lesson, palette) => {
      if (lesson.colorIndex === 0) return lesson.color;
      return palette[lesson.colorIndex - 1];
    },
  };
};
