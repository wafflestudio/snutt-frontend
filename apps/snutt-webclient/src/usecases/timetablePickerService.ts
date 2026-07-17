import type { FullTimetable } from '@/entities/timetable';

export interface TimetablePickerService {
  isAllowedOrigin(origin: string | null): boolean;
  sendTimetableToOpener(_: { timetable: FullTimetable; targetOrigin: string; opener: Window }): void;
}

/**
 * `allowedOrigins`: 팝업 결과(postMessage)를 받을 수 있는 origin 허용 목록.
 * 빌드 타임 환경변수 `VITE_TIMETABLE_PICKER_ORIGINS`(콤마 구분)에서 주입된다.
 */
export const getTimetablePickerService = (allowedOrigins: readonly string[]): TimetablePickerService => {
  const isAllowedOrigin = (origin: string | null): origin is string =>
    origin !== null && allowedOrigins.includes(origin);

  return {
    isAllowedOrigin,
    sendTimetableToOpener: ({ timetable, targetOrigin, opener }) => {
      // Defense-in-depth: never postMessage to an origin outside the allowlist,
      // even if a caller forgets to validate it beforehand.
      if (!isAllowedOrigin(targetOrigin)) return;
      opener.postMessage({ type: 'SNUTT_TIMETABLE_SELECTED', payload: timetable }, targetOrigin);
    },
  };
};
