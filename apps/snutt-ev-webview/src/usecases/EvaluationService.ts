import { Evaluation } from '@/entities/Evaluation';
import { PaginationResponse } from '@/utils/Pagination';

export type EvaluationService = {
  getMyEvaluations: (cursor?: string) => Promise<PaginationResponse<Evaluation>>;
  updateEvalutionLike: (id: number, isLiked: boolean) => Promise<never>;
};
