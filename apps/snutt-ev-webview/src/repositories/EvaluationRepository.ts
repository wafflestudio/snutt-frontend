import { Evaluation } from '@/entities/Evaluation';
import { PaginationResponse } from '@/utils/Pagination';

export type EvaluationRepository = {
  getMyEvlaluations: (req: { cursor?: string }) => Promise<PaginationResponse<Evaluation>>;
  likeEvaluation: (req: { id: number }) => Promise<never>;
  unlikeEvaluation: (req: { id: number }) => Promise<never>;
};
