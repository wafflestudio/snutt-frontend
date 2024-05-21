import { type SnuttApi } from '@sf/snutt-api';

import { type getFeedbackService } from '@/usecases/feedbackService';

export const implFeedbackSnuttApiRepository = ({
  snuttApi,
}: {
  snuttApi: SnuttApi;
}): Parameters<typeof getFeedbackService>[0]['feedbackRepository'] => {
  return {
    post: async (body) => {
      const { status } = await snuttApi['POST /v1/feedback']({ body });
      if (status === 200) return { type: 'success' };
      throw new Error();
    },
  };
};
