import type { Color } from '@/entities/color';

export interface ColorService {
  getColorList(_: { token: string }): Color[];
}

export const getColorService = (): ColorService => {
  return {
    getColorList: () => {
      return [
        { fg: '#ffffff', bg: '#e54459' },
        { fg: '#ffffff', bg: '#f58d3d' },
        { fg: '#ffffff', bg: '#fac52d' },
        { fg: '#ffffff', bg: '#a6d930' },
        { fg: '#ffffff', bg: '#2bc366' },
        { fg: '#ffffff', bg: '#1bd0c9' },
        { fg: '#ffffff', bg: '#1d99e9' },
        { fg: '#ffffff', bg: '#4f48c4' },
        { fg: '#ffffff', bg: '#af56b3' },
      ];
    },
  };
};
