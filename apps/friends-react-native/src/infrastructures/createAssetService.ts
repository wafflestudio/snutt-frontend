import { Asset } from '../entities/asset';
import { AssetService } from '../usecases/assetService';

export const createAssetService = ({ baseUrl }: { baseUrl: string }): AssetService => {
  return {
    getAssetUrl: (asset) => {
      return {
        [Asset.GUIDE_DARK_1]: `${baseUrl}/guide-dark-1.png`,
        [Asset.GUIDE_DARK_2]: `${baseUrl}/guide-dark-2.png`,
        [Asset.GUIDE_DARK_3]: `${baseUrl}/guide-dark-3.png`,
        [Asset.GUIDE_DARK_4]: `${baseUrl}/guide-dark-4.png`,
        [Asset.GUIDE_DARK_5]: `${baseUrl}/guide-dark-5.png`,
        [Asset.GUIDE_LIGHT_1]: `${baseUrl}/guide-light-1.png`,
        [Asset.GUIDE_LIGHT_2]: `${baseUrl}/guide-light-2.png`,
        [Asset.GUIDE_LIGHT_3]: `${baseUrl}/guide-light-3.png`,
        [Asset.GUIDE_LIGHT_4]: `${baseUrl}/guide-light-4.png`,
        [Asset.GUIDE_LIGHT_5]: `${baseUrl}/guide-light-5.png`,
      }[asset];
    },
  };
};
