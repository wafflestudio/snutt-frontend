import { ColorService } from '../usecases/colorService';

export const createColorService = (): ColorService => {
  return {
    getColorPalette: () => [
      { fg: '#ffffff', bg: '#e54459' },
      { fg: '#ffffff', bg: '#f58d3d' },
      { fg: '#ffffff', bg: '#fac52d' },
      { fg: '#ffffff', bg: '#a6d930' },
      { fg: '#ffffff', bg: '#2bc366' },
      { fg: '#ffffff', bg: '#1bd0c9' },
      { fg: '#ffffff', bg: '#1d99e9' },
      { fg: '#ffffff', bg: '#4f48c4' },
      { fg: '#ffffff', bg: '#af56b3' },
    ],
  };
};
