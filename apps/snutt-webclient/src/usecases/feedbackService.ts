import { type RepositoryResponse, type UsecaseResponse } from './../entities/response';

export type FeedbackService = {
  post(body: { email: string; message: string }): UsecaseResponse<void>;
};

export const getFeedbackService = ({
  feedbackRepository,
}: {
  feedbackRepository: { post: (_: { email: string; message: string }) => RepositoryResponse<void> };
}): FeedbackService => {
  return {
    post: async (body) => {
      try {
        await feedbackRepository.post(body);
        return { type: 'success' };
      } catch (err) {
        return { type: 'error', message: '오류가 발생했습니다.' };
      }
    },
  };
};
