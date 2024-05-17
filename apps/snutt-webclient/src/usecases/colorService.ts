import type { Color } from '@/entities/color';

export interface ColorService {
  getColorList(_: { token: string }): Promise<Color[]>;
}

type Deps = {
  colorRepository: {
    getColorPalette({ token }: { token: string }): Promise<Color[]>;
  };
};
export const getColorService = ({ colorRepository }: Deps): ColorService => {
  return {
    getColorList: (req: { token: string }) => colorRepository.getColorPalette(req),
  };
};
