import { type SnuttApi } from '@sf/snutt-api';

import { type getColorService } from '@/usecases/colorService';

export const implColorSnuttApiRepository = ({
  snuttApi,
}: {
  snuttApi: SnuttApi;
}): Parameters<typeof getColorService>[0]['colorRepository'] => {
  return {
    getColorPalette: async ({ token }) => {
      const { status, data } = await snuttApi['GET /v1/colors/vivid_ios']({ token });
      if (status === 200) return data.colors;
      else throw data;
    },
  };
};
