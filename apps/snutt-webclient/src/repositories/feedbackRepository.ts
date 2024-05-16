import type { HttpClient } from '@/clients/HttpClient';

export interface FeedbackRepository {
  post(body: { email: string; message: string }): Promise<{ message: 'ok' }>;
}

export const getFeedbackRepository = ({ httpClient }: { httpClient: HttpClient }): FeedbackRepository => {
  return {
    post: async (body) => (await httpClient.post<{ message: 'ok' }>(`/v1/feedback`, body)).data,
  };
};
