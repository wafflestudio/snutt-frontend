import { ApiClient } from '../clients/apiClient';
import { Color } from '../entities/color';
import { ColorRepository } from '../repositories/colorRepository';

type Deps = { clients: [ApiClient] };
export const createColorRepository = ({ clients: [apiClient] }: Deps): ColorRepository => {
  return {
    getColorPalette: () => apiClient.get<{ colors: Color[]; names: string[]; message: 'ok' }>('/v1/colors/vivid_ios'),
  };
};
