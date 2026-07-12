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

export const getTimetablePickerService = (): TimetablePickerService => ({
  isAllowedOrigin: (origin) => origin !== null && ALLOWED_TIMETABLE_PICKER_ORIGINS.includes(origin),
  sendTimetableToOpener: ({ timetable, targetOrigin, opener }) =>
    opener.postMessage({ type: 'SNUTT_TIMETABLE_SELECTED', payload: timetable }, targetOrigin),
});
