import { Color } from '../entities/color';

export type ColorService = {
  getColorPalette: (theme: 'light' | 'dark', timetableTheme: number) => Color[];
};
