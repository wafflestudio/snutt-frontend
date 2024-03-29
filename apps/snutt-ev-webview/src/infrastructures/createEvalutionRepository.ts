import { HttpClient } from '@/clients/HttpClient';
import { Evaluation } from '@/entities/Evaluation';
import { EvaluationRepository } from '@/repositories/EvaluationRepository';
import { PaginationResponse } from '@/utils/pagination';

export const createEvaluationRepository = ({ httpClient }: { httpClient: HttpClient }): EvaluationRepository => {
  return {
    getMyEvlaluations: async ({ cursor }) => {
      const params = new URLSearchParams();

      if (cursor) params.append('cursor', cursor);

      const response = await httpClient.get<PaginationResponse<Evaluation>>(`/v1/evaluations/users/me?${params}`);

      return response;
    },
    likeEvaluation: async ({ id }) => {
      const response = await httpClient.post<never>(`/v1/evaluations/${id}/likes`);

      return response;
    },
    unlikeEvaluation: async ({ id }) => {
      const response = await httpClient.delete<never>(`/v1/evaluations/${id}/likes`);

      return response;
    },
  };
};
