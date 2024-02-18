import { Evaluation } from '@/entities/Evaluation';
import { PaginationResponse } from '@/utils/pagination';

export type EvaluationService = {
  getMyEvaluations: (cursor?: string) => Promise<PaginationResponse<Evaluation>>;
  updateEvalutionLike: (id: number, isLiked: boolean) => Promise<never>;
};
