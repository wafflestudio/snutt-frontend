import type { HttpClient } from '@/clients/HttpClient';
import type { Color } from '@/entities/color';

export interface ColorRepository {
  getColorPalette(): Promise<{ colors: Color[]; names: string[]; message: 'ok' }>;
}

export const getColorRepository = ({ httpClient }: { httpClient: HttpClient }): ColorRepository => {
  return {
    getColorPalette: async () =>
      (await httpClient.get<{ colors: Color[]; names: string[]; message: 'ok' }>(`/v1/colors/vivid_ios`)).data,
  };
};
