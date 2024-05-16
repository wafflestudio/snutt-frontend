import type { Color } from '@/entities/color';
import type { ColorRepository } from '@/repositories/colorRepository';

export interface ColorService {
  getColorList(): Promise<Color[]>;
}

type Deps = { repositories: [ColorRepository] };
export const getColorService = ({ repositories }: Deps): ColorService => {
  return {
    getColorList: () => repositories[0].getColorPalette().then((res) => res.colors),
  };
};
