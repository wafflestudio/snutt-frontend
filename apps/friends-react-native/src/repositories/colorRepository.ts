import { Color } from '../entities/color';

export type ColorRepository = {
  getColorPalette(): Promise<{ colors: Color[]; names: string[]; message: 'ok' }>;
};
