import { ColorRepository } from '../repositories/colorRepository';
import { ColorService } from '../usecases/colorService';

export const createColorService = ({
  repositories: [colorRepository],
}: {
  repositories: [ColorRepository];
}): ColorService => {
  return {
    getColorPalette: () => colorRepository.getColorPalette().then((res) => res.colors),
  };
};
