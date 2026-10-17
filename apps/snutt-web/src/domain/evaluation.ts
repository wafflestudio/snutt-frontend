import type { CourseId } from './lecture';
import type { Semester } from './semester';

/** 강의평 ID */
export type EvaluationId = string;

/** 항목별 점수 (강의 상세의 성적 · 강의력 · 유익함 · 널널함) */
export type EvaluationScores = {
  /** 성적 만족도 */
  gradeSatisfaction: number;
  /** 강의력 */
  teachingSkill: number;
  /** 유익함 */
  gains: number;
  /** 널널함 (학업 외 생활과의 균형) */
  lifeBalance: number;
};

export const EVALUATION_SCORE_LABELS: Record<keyof EvaluationScores, string> = {
  gradeSatisfaction: '성적',
  teachingSkill: '강의력',
  gains: '유익함',
  lifeBalance: '널널함',
};

/** 항목별 점수를 모르면 null. 강의평이 없는 강좌는 평균이 없고, 예전 snuev 에서 옮겨 온 강의평은 항목별 점수가 없다 */
type NullableScores = { [K in keyof EvaluationScores]: number | null };

/** 강좌의 강의평 통계. 강의평이 없으면 count 가 0 이고 평균은 null 이다 */
export type CourseEvaluationSummary = {
  courseId: CourseId;
  count: number;
  rating: number | null;
  scores: NullableScores;
};

/** 강의평 한 개 */
export type Evaluation = {
  id: EvaluationId;
  courseId: CourseId;
  courseTitle: string;
  instructor: string;
  /** 수강한 학기 */
  semester: Semester;
  content: string;
  rating: number;
  scores: NullableScores;
  likeCount: number;
  isLiked: boolean;
  /** 내가 쓴 강의평이라 고치거나 지울 수 있다 */
  isModifiable: boolean;
  /** 예전 snuev 에서 옮겨 온 강의평 */
  fromSnuev: boolean;
};

/** 강의평 목록 정렬. 추천순 / 최신순 */
export type EvaluationSort = 'recommended' | 'latest';

/** 강의평 작성 폼에서 받는 값. 쓸 때는 항목별 점수를 모두 고른다 */
export type EvaluationInput = { content: string; rating: number; scores: EvaluationScores };

/** 강의평 수정에서 바뀐 값 */
export type EvaluationChange = Partial<Omit<EvaluationInput, 'scores'>> & { scores?: Partial<EvaluationScores> };
