import { Color } from '../entities/color';

export type ColorService = {
  getColorPalette: () => Color[];
};
