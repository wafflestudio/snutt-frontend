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

/**
 * 강의평 작성 폼의 질문 (Figma `강의평_강의평 작성`). 널널함은 `과제량이 적절했나요?` 로 읽었다 (디자인 문의 4-30)
 */
export const EVALUATION_SCORE_QUESTIONS: Record<keyof EvaluationScores, string> = {
  gradeSatisfaction: '성적이 만족스러웠나요?',
  teachingSkill: '교수님의 강의력이 좋았나요?',
  gains: '수업 내용이 유익했나요?',
  lifeBalance: '과제량이 적절했나요?',
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

/** 점수는 0.5 ~ 5 점. 강의평 작성 폼에서는 별 다섯 개를 반 개 단위로 고른다 (Figma `강의평_강의평 작성`, 디자인 문의 4-27) */
export const EVALUATION_SCORE_MAX = 5;
export const EVALUATION_SCORE_STEP = 0.5;

/**
 * 강의 리뷰(본문)의 최소 글자 수 (Figma `(최소 20자)`). Figma 는 `선택` 이라고 적었지만
 * 서버 작성 요청의 content 가 minLength 1 이라 비울 수 없어 반드시 쓰게 한다 (디자인 문의 4-30)
 */
export const EVALUATION_CONTENT_MIN_LENGTH = 20;

/** 본문이 최소 글자 수 이상이면 쓸 수 있다. 앞뒤 공백은 세지 않는다 */
export const isValidEvaluationContent = (content: string) =>
  content.trim().length >= EVALUATION_CONTENT_MIN_LENGTH;

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

/**
 * 쓸 수 있는 값이면 EvaluationInput, 빠진 것이 있으면 null. 본문은 앞뒤 공백을 지운다.
 */
export const toEvaluationInput = ({ content, rating, scores }: EvaluationDraft): EvaluationInput | null => {
  const trimmed = content.trim();
  const { gradeSatisfaction, teachingSkill, gains, lifeBalance } = scores;
  if (!isValidEvaluationContent(trimmed) || rating === null) return null;
  if (gradeSatisfaction === null || teachingSkill === null || gains === null || lifeBalance === null) return null;
  return { content: trimmed, rating, scores: { gradeSatisfaction, teachingSkill, gains, lifeBalance } };
};

/**
 * 수정 폼에서 바뀐 값만 모은다. 바뀐 것이 없거나 바꾼 본문이 최소 글자 수보다 짧으면 null.
 * 예전 snuev 에서 옮겨 온 강의평은 항목별 점수가 없을 수 있어, 고르지 않은(null) 점수는 그대로 둔다
 */
export const getEvaluationChange = (evaluation: Evaluation, draft: EvaluationDraft): EvaluationChange | null => {
  const content = draft.content.trim();
  // 최소 글자 수가 생기기 전에 쓴 짧은 강의평도 점수는 고칠 수 있게, 본문을 바꿀 때만 글자 수를 본다
  if ((content !== evaluation.content && !isValidEvaluationContent(content)) || draft.rating === null) return null;
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

/** 강의평 탭의 둘러보기 태그 (`GET /v2/evaluations/tags`). 제목은 서버가 준다 */
export type EvaluationTag = { key: string; title: string; description: string };

/** 서버의 정렬 태그. 강의평 탭에서는 칩이 아니라 `추천순` · `최신순` 으로 보여 준다 (디자인 문의 4-30) */
export const EVALUATION_SORT_TAGS: Record<EvaluationSort, string> = { recommended: 'RECOMMENDED', latest: 'RECENT' };

/** 칩으로 보여 줄 태그. 정렬 태그(최신 · 추천)는 뺀다 */
export const getEvaluationChipTags = (tags: readonly EvaluationTag[]) =>
  tags.filter(({ key }) => !Object.values(EVALUATION_SORT_TAGS).includes(key));

/** 강의평 탭에서 강좌를 찾은 결과 (`GET /v2/courses`) */
export type CourseSummary = {
  id: CourseId;
  title: string;
  instructor: string;
  /** 강의평이 없으면 null */
  rating: number | null;
  count: number;
};

/** 최근 학기에 내가 수강한 강의 (`GET /v2/users/me/lectures/latest`). 강의평은 이 강의에 바로 쓴다 */
export type TakenLecture = {
  lectureId: LectureId;
  title: string;
  instructor: string;
  credit: number | null;
  semester: Semester;
};

/** 학기별로 묶는다. 최근 학기부터, 학기 안에서는 받은 순서대로 */
export const groupBySemester = <T>(items: readonly T[], getSemester: (item: T) => Semester) => {
  const groups: { semester: Semester; items: T[] }[] = [];
  for (const item of items) {
    const semester = getSemester(item);
    const group = groups.find((each) => compareSemester(each.semester, semester) === 0);
    if (group) group.items.push(item);
    else groups.push({ semester, items: [item] });
  }
  return groups.sort((a, b) => compareSemester(b.semester, a.semester));
};
