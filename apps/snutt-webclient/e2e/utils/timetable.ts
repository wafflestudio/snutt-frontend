import { type Page } from '@playwright/test';

type Type =
  | 'full' //     꽉찬시간표
  | 'real'; //    실제시간

export const givenTimetableDisplayMode = (page: Page, { type = 'real' }: { type?: Type } = {}) => {
  if (type === 'full') return page.evaluate(() => localStorage.setItem('timetable_display_mode', 'full'));
  if (type === 'real') return page.evaluate(() => localStorage.setItem('timetable_display_mode', 'real'));
};
