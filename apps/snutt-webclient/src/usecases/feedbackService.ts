import type { FeedbackRepository } from '@/repositories/feedbackRepository';

export interface FeedbackService {
  post(body: { email: string; message: string }): Promise<{ message: 'ok' }>;
}

export const getFeedbackService = (args: { repositories: [FeedbackRepository] }): FeedbackService => {
  return {
    post: (body) => args.repositories[0].post(body),
  };
};
