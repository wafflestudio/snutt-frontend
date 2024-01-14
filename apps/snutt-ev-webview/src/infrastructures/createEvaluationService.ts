import { EvaluationRepository } from '@/repositories/EvaluationRepository';
import { EvaluationService } from '@/usecases/EvaluationService';

export const createEvaluationService = ({
  evaluationRepository,
}: {
  evaluationRepository: EvaluationRepository;
}): EvaluationService => {
  return {
    getMyEvaluations: async (cursor) => {
      const response = await evaluationRepository.getMyEvlaluations({ cursor });

      return response;
    },
    updateEvalutionLike: async (id, isLiked) => {
      const response = isLiked
        ? await evaluationRepository.unlikeEvaluation({ id })
        : await evaluationRepository.likeEvaluation({ id });

      return response;
    },
  };
};
