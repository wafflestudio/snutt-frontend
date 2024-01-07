import { Evaluation } from '@/entities/Evaluation';
import { PaginationResponse } from '@/utils/Pagination';

export type EvaluationRepository = {
  getMyEvlaluations: (req: { cursor?: string }) => Promise<PaginationResponse<Evaluation>>;
};
