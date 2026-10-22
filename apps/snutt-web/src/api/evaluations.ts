import {
  infiniteQueryOptions,
  type InfiniteData,
  type QueryClient,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Evaluation, EvaluationChange, EvaluationInput, EvaluationSort } from '@/domain/evaluation';
import type { CourseId, LectureId } from '@/domain/lecture';
import { callApi } from './client';
import {
  toCourseEvaluationSummary,
  toEvaluation,
  toEvaluationSortParam,
  toEvaluationUpdateRequest,
  toEvaluationWriteRequest,
} from './mappers/evaluation';

// 강의평은 강좌(courseId) 단위로 모인다. 강의 상세에서는 강의의 courseId 로 부른다
// 이메일 인증을 하지 않은 사용자는 모두 403 `email-not-verified` 다 (dev 서버에서 확인, 2026-10-17)

/** 강의평 목록 한 쪽 */
type EvaluationPage = { evaluations: Evaluation[]; next: string | null };

export const evaluationQueries = {
  all: () => ['evaluations'] as const,
  /** 강좌의 강의평 전부 (통계, 목록, 내 강의평). 강의평을 쓰거나 고치면 이 아래를 다시 받는다 */
  course: (courseId: CourseId) => [...evaluationQueries.all(), 'course', courseId] as const,
  /** 평균 점수와 항목별 평균 */
  summary: (courseId: CourseId) =>
    queryOptions({
      queryKey: [...evaluationQueries.course(courseId), 'summary'],
      queryFn: async () =>
        toCourseEvaluationSummary(
          await callApi('GET /v2/courses/:courseId/evaluation-summary', { params: { courseId } }),
        ),
    }),
  /** 강의평 목록. 한 쪽의 크기는 서버가 정하고, 커서로 다음 쪽을 받는다 */
  list: ({ courseId, sort }: { courseId: CourseId; sort: EvaluationSort }) =>
    infiniteQueryOptions({
      queryKey: [...evaluationQueries.course(courseId), 'list', sort],
      queryFn: async ({ pageParam }): Promise<EvaluationPage> => {
        const page = await callApi('GET /v2/courses/:courseId/evaluations', {
          params: { courseId },
          query: { cursor: pageParam ?? undefined, sort: toEvaluationSortParam(sort) },
        });
        return { evaluations: page.content.map(toEvaluation), next: page.last ? null : (page.cursor ?? null) };
      },
      initialPageParam: null as string | null,
      getNextPageParam: (page) => page.next,
    }),
  /** 이 강좌에 내가 쓴 강의평. 서버는 배열로 준다 */
  mine: (courseId: CourseId) =>
    queryOptions({
      queryKey: [...evaluationQueries.course(courseId), 'mine'],
      queryFn: async () =>
        (await callApi('GET /v2/courses/:courseId/evaluations/me', { params: { courseId } })).map(toEvaluation),
    }),
};

/** 서버가 돌려준 강의평으로 캐시의 같은 강의평을 바꾼다 (좋아요). 통계는 그대로라 다시 받지 않는다 */
const replaceEvaluation = (queryClient: QueryClient, evaluation: Evaluation) => {
  const replace = (list: Evaluation[]) => list.map((item) => (item.id === evaluation.id ? evaluation : item));
  queryClient.setQueriesData<InfiniteData<EvaluationPage>>(
    { queryKey: [...evaluationQueries.course(evaluation.courseId), 'list'] },
    (data) =>
      data && { ...data, pages: data.pages.map((page) => ({ ...page, evaluations: replace(page.evaluations) })) },
  );
  queryClient.setQueryData(evaluationQueries.mine(evaluation.courseId).queryKey, (list) => list && replace(list));
};

/** 강의평을 쓰거나 고치거나 지우면 통계 · 목록 · 내 강의평이 모두 바뀌므로 강좌의 강의평을 다시 받는다 */
const invalidateCourse = (queryClient: QueryClient, courseId: CourseId) =>
  queryClient.invalidateQueries({ queryKey: evaluationQueries.course(courseId) });

/** 강의평 작성. 강좌가 아니라 수강한 학기의 강의(lectureId)에 쓴다 */
export const useWriteEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lectureId, input }: { lectureId: LectureId; input: EvaluationInput }) =>
      toEvaluation(
        await callApi('POST /v2/lectures/:lectureId/evaluations', {
          params: { lectureId },
          body: toEvaluationWriteRequest(input),
        }),
      ),
    onSuccess: (evaluation) => invalidateCourse(queryClient, evaluation.courseId),
  });
};

/** 강의평 수정 (⋮ 메뉴). 바뀐 필드만 넘긴다 */
export const useUpdateEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ evaluation, change }: { evaluation: Evaluation; change: EvaluationChange }) =>
      toEvaluation(
        await callApi('PATCH /v2/evaluations/:evaluationId', {
          params: { evaluationId: evaluation.id },
          body: toEvaluationUpdateRequest(change),
        }),
      ),
    onSuccess: (evaluation) => invalidateCourse(queryClient, evaluation.courseId),
  });
};

/** 강의평 삭제 (⋮ 메뉴). 서버는 본문 없이 성공한다 */
export const useDeleteEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (evaluation: Evaluation) =>
      callApi('DELETE /v2/evaluations/:evaluationId', { params: { evaluationId: evaluation.id } }),
    onSuccess: (_, evaluation) => invalidateCourse(queryClient, evaluation.courseId),
  });
};

/** 좋아요를 누르거나 취소한다. 서버가 바뀐 강의평(좋아요 수 포함)을 돌려준다 */
export const useToggleEvaluationLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (evaluation: Evaluation) => {
      const params = { evaluationId: evaluation.id };
      return toEvaluation(
        evaluation.isLiked
          ? await callApi('DELETE /v2/evaluations/:evaluationId/like', { params })
          : await callApi('POST /v2/evaluations/:evaluationId/like', { params }),
      );
    },
    onSuccess: (evaluation) => replaceEvaluation(queryClient, evaluation),
  });
};

/** 강의평 신고 (⋮ 메뉴). 서버는 본문 없이 성공한다 */
export const useReportEvaluation = () =>
  useMutation({
    mutationFn: ({ evaluation, content }: { evaluation: Evaluation; content: string }) =>
      callApi('POST /v2/evaluations/:evaluationId/report', {
        params: { evaluationId: evaluation.id },
        body: { content },
      }),
  });
