// @vitest-environment jsdom
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { isEmailNotVerified } from '@/api/errors';
import { evaluationQueries, useDeleteEvaluation, useToggleEvaluationLike, useWriteEvaluation } from '@/api/evaluations';
import { toEvaluation } from '@/api/mappers/evaluation';
import { createQueryClient } from '@/api/query-client';
import { EVALUATION_RESPONSES, EVALUATION_SUMMARY_RESPONSE, problem } from '../msw/fixtures';
import { api, server } from '../msw/server';

const [FIRST, SECOND] = EVALUATION_RESPONSES;

const setup = () => {
  const queryClient = createQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

describe('강의평 조회', () => {
  it('통계 · 내 강의평을 domain 타입으로 받는다', async () => {
    server.use(
      http.get(api('/v2/courses/9756/evaluation-summary'), () => HttpResponse.json(EVALUATION_SUMMARY_RESPONSE)),
      http.get(api('/v2/courses/9756/evaluations/me'), () => HttpResponse.json([SECOND])),
    );
    const { queryClient } = setup();

    expect(await queryClient.fetchQuery(evaluationQueries.summary('9756'))).toMatchObject({ count: 2, rating: 4.25 });
    expect((await queryClient.fetchQuery(evaluationQueries.mine('9756'))).map(({ id }) => id)).toEqual(['502']);
  });

  it('목록: 정렬을 보내고, 커서로 다음 쪽을 받는다', async () => {
    const requests: URLSearchParams[] = [];
    server.use(
      http.get(api('/v2/courses/9756/evaluations'), ({ request }) => {
        const query = new URL(request.url).searchParams;
        requests.push(query);
        return query.get('cursor') === 'c1'
          ? HttpResponse.json({ content: [SECOND], size: 1, last: true })
          : HttpResponse.json({ content: [FIRST], cursor: 'c1', size: 1, last: false });
      }),
    );
    const { queryClient } = setup();
    const options = evaluationQueries.list({ courseId: '9756', sort: 'recommended' });

    const { pages } = await queryClient.fetchInfiniteQuery({ ...options, pages: 2 });
    expect(pages).toMatchObject([
      { evaluations: [{ id: '501' }], next: 'c1' },
      { evaluations: [{ id: '502' }], next: null },
    ]);
    expect(requests.map((query) => Object.fromEntries(query))).toEqual([
      { sort: 'RECOMMENDED' },
      { sort: 'RECOMMENDED', cursor: 'c1' },
    ]);
  });

  it('정렬마다 목록 query key 가 다르고, 모두 강좌 아래에 있다', () => {
    const recommended = evaluationQueries.list({ courseId: '1', sort: 'recommended' }).queryKey;
    const latest = evaluationQueries.list({ courseId: '1', sort: 'latest' }).queryKey;
    expect(recommended).not.toEqual(latest);
    expect(recommended.slice(0, 3)).toEqual(evaluationQueries.course('1'));
    expect(evaluationQueries.summary('1').queryKey.slice(0, 3)).toEqual(evaluationQueries.course('1'));
  });

  it('이메일 인증을 하지 않았으면 403 email-not-verified', async () => {
    server.use(
      http.get(api('/v2/courses/9756/evaluation-summary'), () =>
        HttpResponse.json(
          problem(403, 'email-not-verified', '이메일 인증 필요', '이메일 인증이 완료된 후 강의평을 확인할 수 있습니다'),
          { status: 403 },
        ),
      ),
    );
    const { queryClient } = setup();

    const error = await queryClient.fetchQuery(evaluationQueries.summary('9756')).catch((e: unknown) => e);
    expect(isEmailNotVerified(error)).toBe(true);
    expect(isEmailNotVerified(new Error('x'))).toBe(false);
  });
});

describe('강의평 상호작용', () => {
  it('좋아요: 누르지 않았으면 POST, 서버가 돌려준 강의평으로 목록 · 내 강의평을 바꾼다', async () => {
    let method = '';
    server.use(
      http.all(api('/v2/evaluations/501/like'), ({ request }) => {
        method = request.method;
        return HttpResponse.json({ ...FIRST, isLiked: true, likeCount: 4 });
      }),
    );
    const { queryClient, wrapper } = setup();
    const listKey = evaluationQueries.list({ courseId: '9756', sort: 'latest' }).queryKey;
    queryClient.setQueryData(listKey, {
      pages: [{ evaluations: EVALUATION_RESPONSES.map(toEvaluation), next: null }],
      pageParams: [null],
    });
    queryClient.setQueryData(evaluationQueries.mine('9756').queryKey, [toEvaluation(FIRST)]);

    const { result } = renderHook(() => useToggleEvaluationLike(), { wrapper });
    act(() => result.current.mutate(toEvaluation(FIRST)));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(method).toBe('POST');
    expect(queryClient.getQueryData(listKey)?.pages[0].evaluations).toMatchObject([
      { id: '501', isLiked: true, likeCount: 4 },
      { id: '502', isLiked: false },
    ]);
    expect(queryClient.getQueryData(evaluationQueries.mine('9756').queryKey)).toMatchObject([
      { isLiked: true, likeCount: 4 },
    ]);
  });

  it('좋아요 취소: 이미 눌렀으면 DELETE', async () => {
    let method = '';
    server.use(
      http.all(api('/v2/evaluations/501/like'), ({ request }) => {
        method = request.method;
        return HttpResponse.json({ ...FIRST, isLiked: false, likeCount: 2 });
      }),
    );
    const { wrapper } = setup();

    const { result } = renderHook(() => useToggleEvaluationLike(), { wrapper });
    act(() => result.current.mutate({ ...toEvaluation(FIRST), isLiked: true }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(method).toBe('DELETE');
    expect(result.current.data).toMatchObject({ isLiked: false, likeCount: 2 });
  });

  it('작성: 수강한 강의에 쓰고, 강좌의 통계 · 목록을 다시 받게 한다', async () => {
    let body: unknown;
    server.use(
      http.post(api('/v2/lectures/74272/evaluations'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(FIRST);
      }),
    );
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(evaluationQueries.summary('9756').queryKey, {
      courseId: '9756',
      count: 0,
      rating: null,
      scores: { gradeSatisfaction: null, teachingSkill: null, gains: null, lifeBalance: null },
    });

    const { result } = renderHook(() => useWriteEvaluation(), { wrapper });
    act(() =>
      result.current.mutate({
        lectureId: '74272',
        input: {
          content: '과제가 많지만 배우는 것이 많아요',
          rating: 4.5,
          scores: { gradeSatisfaction: 3, teachingSkill: 4, gains: 5, lifeBalance: 2 },
        },
      }),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(body).toEqual({
      content: '과제가 많지만 배우는 것이 많아요',
      rating: 4.5,
      gradeSatisfaction: 3,
      teachingSkill: 4,
      gains: 5,
      lifeBalance: 2,
    });
    expect(queryClient.getQueryState(evaluationQueries.summary('9756').queryKey)?.isInvalidated).toBe(true);
  });

  it('삭제: 본문 없이 성공하고, 강좌의 강의평을 다시 받게 한다', async () => {
    server.use(http.delete(api('/v2/evaluations/502'), () => new HttpResponse(null, { status: 200 })));
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData(evaluationQueries.mine('9756').queryKey, [toEvaluation(SECOND)]);

    const { result } = renderHook(() => useDeleteEvaluation(), { wrapper });
    act(() => result.current.mutate(toEvaluation(SECOND)));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryState(evaluationQueries.mine('9756').queryKey)?.isInvalidated).toBe(true);
  });
});
