import { Brand } from '@/utils/brand';

import { Lecture } from './Lecture';

type EvaluationLecture = Pick<Lecture, 'id' | 'title' | 'instructor'>;

export type Evaluation = {
  id: Brand<number, 'EvaluationId'>;
  lecture: EvaluationLecture;
  user: unknown; // todo 바꿀겁니다
  content: string;
  gradeSatisfaction: number | null;
  teachingSkill: number | null;
  gains: number | null;
  lifeBalance: number | null;
  rating: number;
  likeCount: number;
  isLiked: boolean;
  isHidden: boolean;
  isReportable: boolean;
  year: number;
  semester: unknown; // todo 바꿀겁니다
  isModifiable: boolean;
  fromSnuev: boolean;
};
