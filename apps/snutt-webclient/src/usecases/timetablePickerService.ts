import type { FullTimetable } from '@/entities/timetable';

export const ALLOWED_TIMETABLE_PICKER_ORIGINS: readonly string[] = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  // TODO: Add actual production origins before deployment
];

export interface TimetablePickerService {
  isAllowedOrigin(origin: string | null): boolean;
  sendTimetableToOpener(_: { timetable: FullTimetable; targetOrigin: string; opener: Window }): void;
}

export const getTimetablePickerService = (): TimetablePickerService => {
  const isAllowedOrigin = (origin: string | null): origin is string =>
    origin !== null && ALLOWED_TIMETABLE_PICKER_ORIGINS.includes(origin);

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
