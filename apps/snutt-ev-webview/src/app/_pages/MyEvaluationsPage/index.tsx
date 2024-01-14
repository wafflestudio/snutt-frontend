import { AppBar } from '@/app/_components/AppBar';
import { EvaluationCard } from '@/app/_components/Evaluation/EvaluationCard';
import { getServerServices } from '@/app/utils/getServerServices';

export const MyEvaluaitonsPage = async () => {
  const { evaluationService } = getServerServices();

  const { content: evaluations } = await evaluationService.getMyEvaluations();

  return (
    <div>
      {/* TODO 뒤로가기 이미지 넣기 */}
      <AppBar left={<p>뒤로 가기</p>} title={<AppBar.Title title="내가 남긴 강의평" />} />
      {evaluations.map((evaluation) => (
        <EvaluationCard key={evaluation.id} evaluation={evaluation} />
      ))}
    </div>
  );
};
