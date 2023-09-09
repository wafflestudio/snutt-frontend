import { Color } from '../entities/color';

export type ColorService = {
  getColorPalette: () => Promise<Color[]>;
};
