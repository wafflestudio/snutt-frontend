import { describe, expect, it } from 'vitest';
import {
  type Evaluation,
  type EvaluationDraft,
  type EvaluationLecture,
  getEvaluationChange,
  getWritableEvaluationLectures,
  toEvaluationInput,
} from '@/domain/evaluation';

const SCORES = { gradeSatisfaction: 3, teachingSkill: 4, gains: 5, lifeBalance: 2 };

const EVALUATION: Evaluation = {
  id: '501',
  courseId: '9756',
  courseTitle: '공학수학 1',
  instructor: '김명수',
  semester: { year: 2026, term: 1 },
  content: '좋아요',
  rating: 4,
  scores: SCORES,
  likeCount: 0,
  isLiked: false,
  isModifiable: true,
  fromSnuev: false,
};

const draft = (change: Partial<EvaluationDraft> = {}): EvaluationDraft => ({
  content: EVALUATION.content,
  rating: EVALUATION.rating,
  scores: EVALUATION.scores,
  ...change,
});

describe('toEvaluationInput', () => {
  it('점수와 본문이 모두 있으면 본문 앞뒤 공백을 지워 돌려준다', () => {
    expect(toEvaluationInput(draft({ content: '  좋아요 \n' }))).toEqual({
      content: '좋아요',
      rating: 4,
      scores: SCORES,
    });
  });

  it('본문이 공백뿐이거나 고르지 않은 점수가 있으면 null', () => {
    expect(toEvaluationInput(draft({ content: '  ' }))).toBeNull();
    expect(toEvaluationInput(draft({ rating: null }))).toBeNull();
    expect(toEvaluationInput(draft({ scores: { ...SCORES, lifeBalance: null } }))).toBeNull();
  });
});

describe('getEvaluationChange', () => {
  it('바뀐 값만 모은다', () => {
    expect(getEvaluationChange(EVALUATION, draft({ content: '별로예요 ', rating: 4 }))).toEqual({
      content: '별로예요',
    });
    expect(getEvaluationChange(EVALUATION, draft({ rating: 2, scores: { ...SCORES, gains: 1 } }))).toEqual({
      rating: 2,
      scores: { gains: 1 },
    });
  });

  it('바뀐 것이 없거나 본문이 비면 null', () => {
    expect(getEvaluationChange(EVALUATION, draft({ content: ' 좋아요 ' }))).toBeNull();
    expect(getEvaluationChange(EVALUATION, draft({ content: '', rating: 1 }))).toBeNull();
  });

  it('항목별 점수가 없던 강의평은 고른 점수만 보낸다', () => {
    const old = {
      ...EVALUATION,
      scores: { gradeSatisfaction: null, teachingSkill: null, gains: null, lifeBalance: null },
    };
    expect(getEvaluationChange(old, draft({ scores: { ...old.scores, teachingSkill: 5 } }))).toEqual({
      scores: { teachingSkill: 5 },
    });
  });
});

describe('getWritableEvaluationLectures', () => {
  const lecture = (
    lectureId: string,
    year: number,
    term: 1 | 2 | 3 | 4,
    hasMyEvaluation = false,
  ): EvaluationLecture => ({
    lectureId,
    semester: { year, term },
    lectureNumber: lectureId,
    hasMyEvaluation,
  });

  it('이미 쓴 강의는 빼고 최근 학기부터, 같은 학기는 분반 순서', () => {
    const lectures = [
      lecture('001', 2024, 1),
      lecture('002', 2025, 3, true),
      lecture('003', 2025, 1),
      lecture('002', 2025, 1),
    ];
    expect(getWritableEvaluationLectures(lectures).map(({ lectureId }) => lectureId)).toEqual(['002', '003', '001']);
  });
});
