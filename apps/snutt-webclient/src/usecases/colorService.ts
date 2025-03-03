import type { Color } from '@/entities/color';

export interface ColorService {
  getColorList(theme: number): Color[];
}

export const getColorService = (): ColorService => {
  return {
    getColorList: (theme: number) => {
      const themes = [
        // theme_snutt
        [
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
        // theme_snutt_autumn
        [
          { fg: '#ffffff', bg: '#B82E31' },
          { fg: '#ffffff', bg: '#DB701C' },
          { fg: '#ffffff', bg: '#EAA32A' },
          { fg: '#ffffff', bg: '#C6C013' },
          { fg: '#ffffff', bg: '#3A856E' },
          { fg: '#ffffff', bg: '#19B2AC' },
          { fg: '#ffffff', bg: '#3994CE' },
          { fg: '#ffffff', bg: '#3F3A9C' },
          { fg: '#ffffff', bg: '#924396' },
        ],
        // theme_snutt_modern
        [
          { fg: '#ffffff', bg: '#F0652A' },
          { fg: '#ffffff', bg: '#F5AD3E' },
          { fg: '#ffffff', bg: '#998F36' },
          { fg: '#ffffff', bg: '#89C291' },
          { fg: '#ffffff', bg: '#266F55' },
          { fg: '#ffffff', bg: '#13808F' },
          { fg: '#ffffff', bg: '#366689' },
          { fg: '#ffffff', bg: '#432920' },
          { fg: '#ffffff', bg: '#D82F3D' },
        ],
        // theme_snutt_cherry
        [
          { fg: '#ffffff', bg: '#FD79A8' },
          { fg: '#ffffff', bg: '#FEC9DD' },
          { fg: '#ffffff', bg: '#FEB0CC' },
          { fg: '#ffffff', bg: '#FE93BF' },
          { fg: '#ffffff', bg: '#E9B1D0' },
          { fg: '#ffffff', bg: '#C67D97' },
          { fg: '#ffffff', bg: '#BB8EA7' },
          { fg: '#ffffff', bg: '#BDB4BF' },
          { fg: '#ffffff', bg: '#E16597' },
        ],
        // theme_snutt_ice
        [
          { fg: '#ffffff', bg: '#AABDCF' },
          { fg: '#ffffff', bg: '#C0E9E8' },
          { fg: '#ffffff', bg: '#66B6CA' },
          { fg: '#ffffff', bg: '#015F95' },
          { fg: '#ffffff', bg: '#A8D0DB' },
          { fg: '#ffffff', bg: '#458ED0' },
          { fg: '#ffffff', bg: '#62A9D1' },
          { fg: '#ffffff', bg: '#20363D' },
          { fg: '#ffffff', bg: '#6D8A96' },
        ],
        // theme_snutt_grass
        [
          { fg: '#ffffff', bg: '#4FBEAA' },
          { fg: '#ffffff', bg: '#9FC1A4' },
          { fg: '#ffffff', bg: '#5A8173' },
          { fg: '#ffffff', bg: '#84AEB1' },
          { fg: '#ffffff', bg: '#266F55' },
          { fg: '#ffffff', bg: '#D0E0C4' },
          { fg: '#ffffff', bg: '#59886D' },
          { fg: '#ffffff', bg: '#476060' },
          { fg: '#ffffff', bg: '#3D7068' },
        ],
      ];

      const totalThemeCount = themes.length;

      return themes[theme % totalThemeCount];
    },
  };
};
