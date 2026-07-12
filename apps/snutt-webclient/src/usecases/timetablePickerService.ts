import type { FullTimetable } from '@/entities/timetable';

export const ALLOWED_TIMETABLE_PICKER_ORIGINS: readonly string[] = [
  // TODO: Add actual allowed origins
];

export interface TimetablePickerService {
  isAllowedOrigin(origin: string | null): boolean;
  sendTimetableToOpener(_: { timetable: FullTimetable; targetOrigin: string; opener: Window }): void;
}

export const getTimetablePickerService = (): TimetablePickerService => ({
  isAllowedOrigin: (origin) => origin !== null && ALLOWED_TIMETABLE_PICKER_ORIGINS.includes(origin),
  sendTimetableToOpener: ({ timetable, targetOrigin, opener }) =>
    opener.postMessage({ type: 'SNUTT_TIMETABLE_SELECTED', payload: timetable }, targetOrigin),
});
