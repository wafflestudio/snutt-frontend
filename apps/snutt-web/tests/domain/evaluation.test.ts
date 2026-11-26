import { describe, expect, it } from 'vitest';
import {
  type Evaluation,
  type EvaluationDraft,
  type EvaluationLecture,
  getEvaluationChange,
  getEvaluationChipTags,
  getWritableEvaluationLectures,
  groupBySemester,
  toEvaluationInput,
} from '@/domain/evaluation';

const SCORES = { gradeSatisfaction: 3, teachingSkill: 4, gains: 5, lifeBalance: 2 };

const EVALUATION: Evaluation = {
  id: '501',
  courseId: '9756',
  courseTitle: '공학수학 1',
  instructor: '김명수',
  semester: { year: 2026, term: 1 },
  content: '과제가 많지만 배우는 것이 많은 수업이에요',
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
  it('점수가 모두 있으면 본문 앞뒤 공백을 지워 돌려준다', () => {
    expect(toEvaluationInput(draft({ content: '  과제가 많지만 배우는 것이 많은 수업이에요 \n' }))).toEqual({
      content: '과제가 많지만 배우는 것이 많은 수업이에요',
      rating: 4,
      scores: SCORES,
    });
  });

  it('본문은 비워 둘 수 있다 (공백뿐이면 빈 문자열)', () => {
    expect(toEvaluationInput(draft({ content: '  ' }))).toEqual({ content: '', rating: 4, scores: SCORES });
  });

  it('본문이 20자보다 짧거나 고르지 않은 점수가 있으면 null', () => {
    expect(toEvaluationInput(draft({ content: '좋아요' }))).toBeNull();
    expect(toEvaluationInput(draft({ content: '가'.repeat(19) }))).toBeNull();
    expect(toEvaluationInput(draft({ content: '가'.repeat(20) }))).not.toBeNull();
    expect(toEvaluationInput(draft({ rating: null }))).toBeNull();
    expect(toEvaluationInput(draft({ scores: { ...SCORES, lifeBalance: null } }))).toBeNull();
  });

  it('점수는 반 개(0.5) 단위도 받는다', () => {
    expect(toEvaluationInput(draft({ rating: 2.5 }))?.rating).toBe(2.5);
  });
});

describe('getEvaluationChange', () => {
  it('바뀐 값만 모은다', () => {
    expect(
      getEvaluationChange(EVALUATION, draft({ content: '과제가 너무 많아서 힘들었지만 배운 것은 많아요 ', rating: 4 })),
    ).toEqual({
      content: '과제가 너무 많아서 힘들었지만 배운 것은 많아요',
    });
    expect(getEvaluationChange(EVALUATION, draft({ rating: 2, scores: { ...SCORES, gains: 1 } }))).toEqual({
      rating: 2,
      scores: { gains: 1 },
    });
  });

  it('바뀐 것이 없거나 본문이 20자보다 짧으면 null', () => {
    expect(getEvaluationChange(EVALUATION, draft({ content: ` ${EVALUATION.content} ` }))).toBeNull();
    expect(getEvaluationChange(EVALUATION, draft({ content: '별로예요', rating: 1 }))).toBeNull();
  });

  it('본문을 지울 수 있다', () => {
    expect(getEvaluationChange(EVALUATION, draft({ content: ' ' }))).toEqual({ content: '' });
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

describe('groupBySemester', () => {
  it('최근 학기부터 묶고, 학기 안에서는 받은 순서를 지킨다', () => {
    const items = [
      { id: 'a', semester: { year: 2025, term: 3 as const } },
      { id: 'b', semester: { year: 2026, term: 1 as const } },
      { id: 'c', semester: { year: 2025, term: 3 as const } },
    ];
    expect(
      groupBySemester(items, ({ semester }) => semester).map(({ semester, items }) => [
        semester,
        items.map(({ id }) => id),
      ]),
    ).toEqual([
      [{ year: 2026, term: 1 }, ['b']],
      [{ year: 2025, term: 3 }, ['a', 'c']],
    ]);
  });
});

describe('getEvaluationChipTags', () => {
  it('정렬 태그(최신 · 추천)는 칩에서 뺀다', () => {
    const tag = (key: string) => ({ key, title: key, description: '' });
    expect(
      getEvaluationChipTags([tag('RECENT'), tag('RECOMMENDED'), tag('SWEET'), tag('WELL_TAUGHT')]).map(
        ({ key }) => key,
      ),
    ).toEqual(['SWEET', 'WELL_TAUGHT']);
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
