import { Asset } from '../entities/asset';

export type AssetService = {
  getAssetUrl: (asset: Asset) => string;
};
