import type { SnuttV2 } from '@sf/snutt-api';
import { http, HttpResponse } from 'msw';
import { problem } from './fixtures';
import { api } from './server';

type FakeEvaluationsOptions = {
  courseId: number;
  /** 처음 강의평. isModifiable 이 true 인 것이 내 강의평이다 */
  evaluations: readonly SnuttV2.EvaluationResponse[];
  /** 강좌의 학기별 강의 (GET /v2/courses/:courseId). myEvaluationExists 는 강의평을 쓰면 바뀐다 */
  lectures: readonly SnuttV2.CourseLectureResponse[];
};

/** 서버가 받은 요청 (본문이 있으면 본문도) */
type ReceivedRequest = { method: string; path: string; body?: unknown };

/**
 * 강의평 화면 테스트용 가짜 서버. 한 강좌의 강의평을 메모리에 두고 v2 처럼 응답한다.
 * - 통계는 강의평에서 다시 계산한다. 목록은 정렬과 상관없이 한 쪽에 모두 준다
 * - 쓰면 내 강의평(isModifiable)으로 맨 앞에 넣고 그 강의의 myEvaluationExists 를 켠다. 이미 쓴 강의면 409
 * - 좋아요는 isLiked · likeCount 를 바꿔 돌려준다. 삭제 · 신고는 본문 없이 성공한다
 */
export const fakeEvaluations = (initial: FakeEvaluationsOptions) => {
  const { courseId } = initial;
  const evaluations = structuredClone([...initial.evaluations]);
  const lectures = structuredClone([...initial.lectures]);
  const requests: ReceivedRequest[] = [];
  let nextId = 9000;

  const notFound = () =>
    HttpResponse.json(problem(404, 'evaluation-not-found', '찾을 수 없음', '강의평이 없습니다.'), { status: 404 });
  const find = (id: unknown) => evaluations.find((evaluation) => String(evaluation.id) === String(id));
  const record = async (request: Request) => {
    const text = await request.clone().text();
    const body: unknown = text ? JSON.parse(text) : undefined;
    requests.push({ method: request.method, path: new URL(request.url).pathname, ...(body !== undefined && { body }) });
  };

  const average = (pick: (evaluation: SnuttV2.EvaluationResponse) => number | null | undefined) => {
    const values = evaluations.map(pick).filter((value): value is number => typeof value === 'number');
    return values.length === 0 ? undefined : values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const handlers = [
    http.get(api(`/v2/courses/${courseId}/evaluation-summary`), () =>
      HttpResponse.json({
        courseId,
        evalCount: evaluations.length,
        avgRating: average(({ rating }) => rating),
        avgGradeSatisfaction: average(({ gradeSatisfaction }) => gradeSatisfaction),
        avgTeachingSkill: average(({ teachingSkill }) => teachingSkill),
        avgGains: average(({ gains }) => gains),
        avgLifeBalance: average(({ lifeBalance }) => lifeBalance),
      } satisfies SnuttV2.CourseEvaluationDetailsResponse),
    ),
    http.get(api(`/v2/courses/${courseId}/evaluations`), () =>
      HttpResponse.json({
        content: evaluations,
        size: evaluations.length,
        last: true,
      } satisfies SnuttV2.CursorPageEvaluationResponse),
    ),
    http.get(api(`/v2/courses/${courseId}/evaluations/me`), () =>
      HttpResponse.json(evaluations.filter(({ isModifiable }) => isModifiable)),
    ),
    http.get(api(`/v2/courses/${courseId}`), () =>
      HttpResponse.json({
        course: {
          id: courseId,
          title: evaluations[0]?.courseTitle ?? '',
          instructor: evaluations[0]?.instructor ?? '',
          courseNumber: 'M0000.000100',
          evaluation: { evalCount: evaluations.length, avgRating: average(({ rating }) => rating) },
        },
        lectures,
      } satisfies SnuttV2.CourseDetailResponse),
    ),
    http.post(api('/v2/lectures/:lectureId/evaluations'), async ({ request, params }) => {
      await record(request);
      const lecture = lectures.find(({ id }) => String(id) === String(params.lectureId));
      if (!lecture) return notFound();
      if (lecture.myEvaluationExists)
        return HttpResponse.json(problem(409, 'evaluation-already-exists', '중복', '이미 작성한 강의평이 있습니다.'), {
          status: 409,
        });
      const body = (await request.json()) as SnuttV2.EvaluationWriteRequestBody;
      const evaluation: SnuttV2.EvaluationResponse = {
        ...body,
        id: nextId++,
        courseId,
        courseTitle: lecture.courseTitle,
        instructor: evaluations[0]?.instructor ?? '',
        year: lecture.year,
        semester: lecture.semester,
        likeCount: 0,
        isLiked: false,
        isModifiable: true,
        fromSnuev: false,
      };
      evaluations.unshift(evaluation);
      lecture.myEvaluationExists = true;
      return HttpResponse.json(evaluation);
    }),
    http.patch(api('/v2/evaluations/:evaluationId'), async ({ request, params }) => {
      await record(request);
      const evaluation = find(params.evaluationId);
      if (!evaluation) return notFound();
      const body = (await request.json()) as SnuttV2.EvaluationUpdateRequestBody;
      Object.assign(
        evaluation,
        Object.fromEntries(Object.entries(body).filter(([, value]) => value !== null && value !== undefined)),
      );
      return HttpResponse.json(evaluation);
    }),
    http.delete(api('/v2/evaluations/:evaluationId'), async ({ request, params }) => {
      await record(request);
      const evaluation = find(params.evaluationId);
      if (!evaluation) return notFound();
      evaluations.splice(evaluations.indexOf(evaluation), 1);
      return new HttpResponse(null, { status: 200 });
    }),
    http.post(api('/v2/evaluations/:evaluationId/like'), async ({ request, params }) => {
      await record(request);
      const evaluation = find(params.evaluationId);
      if (!evaluation) return notFound();
      if (!evaluation.isLiked) Object.assign(evaluation, { isLiked: true, likeCount: evaluation.likeCount + 1 });
      return HttpResponse.json(evaluation);
    }),
    http.delete(api('/v2/evaluations/:evaluationId/like'), async ({ request, params }) => {
      await record(request);
      const evaluation = find(params.evaluationId);
      if (!evaluation) return notFound();
      if (evaluation.isLiked) Object.assign(evaluation, { isLiked: false, likeCount: evaluation.likeCount - 1 });
      return HttpResponse.json(evaluation);
    }),
    http.post(api('/v2/evaluations/:evaluationId/report'), async ({ request, params }) => {
      await record(request);
      return find(params.evaluationId) ? new HttpResponse(null, { status: 200 }) : notFound();
    }),
  ];

  return { handlers, evaluations, lectures, requests };
};
