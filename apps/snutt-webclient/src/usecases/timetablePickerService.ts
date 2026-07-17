import type { FullTimetable } from '@/entities/timetable';

export interface TimetablePickerService {
  isAllowedOrigin(origin: string | null): boolean;
  sendTimetableToOpener(_: { timetable: FullTimetable; targetOrigin: string; opener: Window }): void;
}

export const getTimetablePickerService = (allowedOrigins: readonly string[]): TimetablePickerService => {
  const isAllowedOrigin = (origin: string | null): origin is string =>
    origin !== null && allowedOrigins.includes(origin);

  return {
    isAllowedOrigin,
    sendTimetableToOpener: ({ timetable, targetOrigin, opener }) => {
      // 허용 목록 밖 origin으로는 절대 전송하지 않는다 (호출부 검증 누락 대비).
      if (!isAllowedOrigin(targetOrigin)) return;
      opener.postMessage({ type: 'SNUTT_TIMETABLE_SELECTED', payload: timetable }, targetOrigin);
    },
  };
};
