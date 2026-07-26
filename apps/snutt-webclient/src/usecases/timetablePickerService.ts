import type { Lecture } from '@/entities/lecture';
import type { FullTimetable } from '@/entities/timetable';

export type SharedLecture = Omit<Lecture, '_id' | 'color' | 'colorIndex'>;
export type SharedTimetable = Omit<FullTimetable, '_id' | 'user_id' | 'updated_at' | 'theme' | 'lecture_list'> & {
  lecture_list: SharedLecture[];
};

export interface TimetablePickerService {
  isAllowedOrigin(origin: string | null): boolean;
  sendTimetableToOpener(_: { timetable: FullTimetable; targetOrigin: string; opener: Window }): void;
}

// 외부로 전달할 때 내부 식별자/색상·테마 정보는 제거한다.
const toSharedTimetable = ({
  _id,
  user_id,
  updated_at,
  theme,
  lecture_list,
  ...rest
}: FullTimetable): SharedTimetable => ({
  ...rest,
  lecture_list: lecture_list.map(({ _id, color, colorIndex, ...lecture }) => lecture),
});

export const getTimetablePickerService = (allowedOrigins: readonly string[]): TimetablePickerService => {
  const isAllowedOrigin = (origin: string | null): origin is string =>
    origin !== null && allowedOrigins.includes(origin);

  return {
    isAllowedOrigin,
    sendTimetableToOpener: ({ timetable, targetOrigin, opener }) => {
      // 허용 목록 밖 origin으로는 절대 전송하지 않는다 (호출부 검증 누락 대비).
      if (!isAllowedOrigin(targetOrigin)) return;
      opener.postMessage({ type: 'SNUTT_TIMETABLE_SELECTED', payload: toSharedTimetable(timetable) }, targetOrigin);
    },
  };
};
