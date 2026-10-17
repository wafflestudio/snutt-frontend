import { describe, expect, it } from 'vitest';
import {
  toCourseEvaluationSummary,
  toEvaluation,
  toEvaluationSortParam,
  toEvaluationUpdateRequest,
  toEvaluationWriteRequest,
} from '@/api/mappers/evaluation';
import { EVALUATION_RESPONSES, EVALUATION_SUMMARY_RESPONSE } from '../../msw/fixtures';

describe('evaluation mapper', () => {
  it('통계: 평균 점수와 항목별 평균', () => {
    expect(toCourseEvaluationSummary(EVALUATION_SUMMARY_RESPONSE)).toEqual({
      courseId: '9756',
      count: 2,
      rating: 4.25,
      scores: { gradeSatisfaction: 3.5, teachingSkill: 4, gains: 4.5, lifeBalance: 2.5 },
    });
  });

  it('통계: 강의평이 없으면 평균이 빠지고 null 이 된다', () => {
    expect(toCourseEvaluationSummary({ courseId: 1, evalCount: 0 })).toEqual({
      courseId: '1',
      count: 0,
      rating: null,
      scores: { gradeSatisfaction: null, teachingSkill: null, gains: null, lifeBalance: null },
    });
  });

  it('강의평: ID 는 문자열, semester 는 term', () => {
    expect(toEvaluation(EVALUATION_RESPONSES[0])).toEqual({
      id: '501',
      courseId: '9756',
      courseTitle: '공학수학 1',
      instructor: '김명수',
      semester: { year: 2026, term: 1 },
      content: '과제가 많지만 배우는 것이 많아요',
      rating: 4.5,
      scores: { gradeSatisfaction: 3, teachingSkill: 4, gains: 5, lifeBalance: 2 },
      likeCount: 3,
      isLiked: false,
      isModifiable: false,
      fromSnuev: false,
    });
  });

  it('snuev 에서 옮겨 온 강의평은 항목별 점수가 null', () => {
    expect(toEvaluation(EVALUATION_RESPONSES[1])).toMatchObject({
      fromSnuev: true,
      isModifiable: true,
      scores: { gradeSatisfaction: null, teachingSkill: null, gains: null, lifeBalance: null },
    });
  });

  it('정렬: 추천순 RECOMMENDED, 최신순 LATEST', () => {
    expect(toEvaluationSortParam('recommended')).toBe('RECOMMENDED');
    expect(toEvaluationSortParam('latest')).toBe('LATEST');
  });

  it('작성: 항목별 점수를 본문에 펼친다', () => {
    expect(
      toEvaluationWriteRequest({
        content: '좋아요',
        rating: 5,
        scores: { gradeSatisfaction: 4, teachingSkill: 5, gains: 3, lifeBalance: 2 },
      }),
    ).toEqual({ content: '좋아요', rating: 5, gradeSatisfaction: 4, teachingSkill: 5, gains: 3, lifeBalance: 2 });
  });

  it('수정: 바뀐 필드만 보낸다', () => {
    expect(toEvaluationUpdateRequest({ content: '고친 내용' })).toEqual({ content: '고친 내용' });
    expect(toEvaluationUpdateRequest({ rating: 3, scores: { gains: 1 } })).toEqual({ rating: 3, gains: 1 });
    expect(toEvaluationUpdateRequest({})).toEqual({});
  });
});
