import type { SnuttV2 } from '@sf/snutt-api';
import type {
  CourseEvaluationSummary,
  Evaluation,
  EvaluationChange,
  EvaluationInput,
  EvaluationSort,
} from '@/domain/evaluation';
import { toSemester } from './timetable';

// v2 강의평 응답 → domain 타입. ID 는 문자열로 바꾸고, 응답에서 빠진 값은 null 로 채운다 (서버는 null 인 필드를 보내지 않는다)

/** 강의평이 없으면 evalCount 가 0 이고 평균들이 빠진다 */
export const toCourseEvaluationSummary = (
  summary: SnuttV2.CourseEvaluationDetailsResponse,
): CourseEvaluationSummary => ({
  courseId: String(summary.courseId),
  count: summary.evalCount,
  rating: summary.avgRating ?? null,
  scores: {
    gradeSatisfaction: summary.avgGradeSatisfaction ?? null,
    teachingSkill: summary.avgTeachingSkill ?? null,
    gains: summary.avgGains ?? null,
    lifeBalance: summary.avgLifeBalance ?? null,
  },
});

/** 예전 snuev 에서 옮겨 온 강의평(fromSnuev)은 항목별 점수가 빠질 수 있다 */
export const toEvaluation = (evaluation: SnuttV2.EvaluationResponse): Evaluation => ({
  id: String(evaluation.id),
  courseId: String(evaluation.courseId),
  courseTitle: evaluation.courseTitle,
  instructor: evaluation.instructor,
  semester: toSemester(evaluation),
  content: evaluation.content,
  rating: evaluation.rating,
  scores: {
    gradeSatisfaction: evaluation.gradeSatisfaction ?? null,
    teachingSkill: evaluation.teachingSkill ?? null,
    gains: evaluation.gains ?? null,
    lifeBalance: evaluation.lifeBalance ?? null,
  },
  likeCount: evaluation.likeCount,
  isLiked: evaluation.isLiked,
  isModifiable: evaluation.isModifiable,
  fromSnuev: evaluation.fromSnuev,
});

// domain → v2 요청

export const toEvaluationSortParam = (sort: EvaluationSort) => (sort === 'recommended' ? 'RECOMMENDED' : 'LATEST');

export const toEvaluationWriteRequest = ({
  content,
  rating,
  scores,
}: EvaluationInput): SnuttV2.EvaluationWriteRequestBody => ({ content, rating, ...scores });

/**
 * 바뀐 필드만 보낸다 (CLAUDE.md "수정 요청(PATCH)은 사용자가 바꾼 필드만").
 * 이 요청에서 null 은 "바꾸지 않음"이다. 강의평은 지울 수 있는 값이 없어서 null 을 보낼 일이 없다
 */
export const toEvaluationUpdateRequest = (change: EvaluationChange): SnuttV2.EvaluationUpdateRequestBody => ({
  ...(change.content !== undefined && { content: change.content }),
  ...(change.rating !== undefined && { rating: change.rating }),
  ...change.scores,
});
