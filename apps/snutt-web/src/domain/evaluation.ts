import type { CourseId, LectureId } from './lecture';
import { compareSemester, type Semester } from './semester';

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
export type NullableScores = { [K in keyof EvaluationScores]: number | null };

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

/** 점수는 1 ~ 5 점. 강의평 작성 폼에서는 별 다섯 개 중 하나를 고른다 (디자인 문의 4-27) */
export const EVALUATION_SCORE_MAX = 5;

/** 강의평을 쓸 때 고르는 강의. 강좌의 학기별 강의이고, 강의평은 강좌가 아니라 이 강의에 쓴다 */
export type EvaluationLecture = {
  lectureId: LectureId;
  semester: Semester;
  lectureNumber: string;
  /** 이 강의에 내가 쓴 강의평이 이미 있다 */
  hasMyEvaluation: boolean;
};

/** 강의평을 쓸 수 있는 강의. 이미 쓴 강의는 빼고, 최근 학기부터 */
export const getWritableEvaluationLectures = (lectures: EvaluationLecture[]) =>
  lectures
    .filter(({ hasMyEvaluation }) => !hasMyEvaluation)
    .sort((a, b) => compareSemester(b.semester, a.semester) || a.lectureNumber.localeCompare(b.lectureNumber));

/** 강의평 작성 · 수정 폼의 값. 아직 고르지 않은 점수는 null */
export type EvaluationDraft = { content: string; rating: number | null; scores: NullableScores };

/** 쓸 수 있는 값이면 EvaluationInput, 빠진 것이 있으면 null. 본문은 앞뒤 공백을 지운다 */
export const toEvaluationInput = ({ content, rating, scores }: EvaluationDraft): EvaluationInput | null => {
  const trimmed = content.trim();
  const { gradeSatisfaction, teachingSkill, gains, lifeBalance } = scores;
  if (!trimmed || rating === null) return null;
  if (gradeSatisfaction === null || teachingSkill === null || gains === null || lifeBalance === null) return null;
  return { content: trimmed, rating, scores: { gradeSatisfaction, teachingSkill, gains, lifeBalance } };
};

/**
 * 수정 폼에서 바뀐 값만 모은다. 바뀐 것이 없거나 본문이 비었으면 null.
 * 예전 snuev 에서 옮겨 온 강의평은 항목별 점수가 없을 수 있어, 고르지 않은(null) 점수는 그대로 둔다
 */
export const getEvaluationChange = (evaluation: Evaluation, draft: EvaluationDraft): EvaluationChange | null => {
  const content = draft.content.trim();
  if (!content || draft.rating === null) return null;
  const scores = Object.fromEntries(
    (Object.keys(draft.scores) as (keyof EvaluationScores)[])
      .filter((key) => draft.scores[key] !== null && draft.scores[key] !== evaluation.scores[key])
      .map((key) => [key, draft.scores[key]]),
  ) as Partial<EvaluationScores>;
  const change: EvaluationChange = {
    ...(content !== evaluation.content && { content }),
    ...(draft.rating !== evaluation.rating && { rating: draft.rating }),
    ...(Object.keys(scores).length > 0 && { scores }),
  };
  return Object.keys(change).length > 0 ? change : null;
};
