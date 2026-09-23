/** 0 = 월요일 ... 6 = 일요일 */
export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAYS: readonly Day[] = [0, 1, 2, 3, 4, 5, 6];

export const DAY_LABELS: Record<Day, string> = { 0: '월', 1: '화', 2: '수', 3: '목', 4: '금', 5: '토', 6: '일' };

/**
 * 요일 + 시간 구간. 시간은 자정 기준 분(0 ~ 1440).
 * 구간은 [startMinute, endMinute) 로, 끝 시각은 포함하지 않는다. (10:00~11:00 과 11:00~12:00 은 겹치지 않음)
 */
export type DayTimeRange = { day: Day; startMinute: number; endMinute: number };

export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

export const toMinute = (hour: number, minute = 0) => hour * MINUTES_PER_HOUR + minute;

/** 600 → '10:00' */
export const formatMinute = (minute: number) => {
  const hour = Math.floor(minute / MINUTES_PER_HOUR);
  const rest = minute % MINUTES_PER_HOUR;
  return `${String(hour).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

/** { day: 0, startMinute: 600, endMinute: 675 } → '월 10:00~11:15' */
export const formatDayTimeRange = ({ day, startMinute, endMinute }: DayTimeRange) =>
  `${DAY_LABELS[day]} ${formatMinute(startMinute)}~${formatMinute(endMinute)}`;

export const isOverlapping = (a: DayTimeRange, b: DayTimeRange) =>
  a.day === b.day && a.startMinute < b.endMinute && b.startMinute < a.endMinute;

export const isValidDayTimeRange = ({ startMinute, endMinute }: DayTimeRange) =>
  Number.isInteger(startMinute) &&
  Number.isInteger(endMinute) &&
  startMinute >= 0 &&
  endMinute <= MINUTES_PER_DAY &&
  startMinute < endMinute;

/** 요일, 시작 시각 순으로 정렬 */
export const compareDayTimeRange = (a: DayTimeRange, b: DayTimeRange) =>
  a.day - b.day || a.startMinute - b.startMinute || a.endMinute - b.endMinute;
