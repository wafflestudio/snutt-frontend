// @vitest-environment jsdom
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '@/api/query-client';
import type { TimetableLecture } from '@/domain/lecture';
import { EvaluationView } from '@/features/main/components/EvaluationView';
import { SAMPLE_TIMETABLES } from '@/features/main/sample-data';
import { EVALUATION_RESPONSES, EVALUATION_SUMMARY_RESPONSE, problem } from '../../msw/fixtures';
import { api, server } from '../../msw/server';

const [FIRST, SECOND] = EVALUATION_RESPONSES;
// 서양근대윤리학의 이해. 강의평은 강좌(9756)로 부른다
const LECTURE: TimetableLecture = {
  ...SAMPLE_TIMETABLES[0].lectures.find(({ id }) => id === '1-3')!,
  instructor: '김명수',
  courseId: '9756',
};

const renderView = (lecture: TimetableLecture = LECTURE) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <EvaluationView lecture={lecture} />
    </QueryClientProvider>,
  );

const summaryHandler = (body = EVALUATION_SUMMARY_RESPONSE) =>
  http.get(api('/v2/courses/9756/evaluation-summary'), () => HttpResponse.json(body));

/** 목록 요청의 쿼리를 모은다. 정렬마다 다른 강의평을 준다 */
const listHandler = (requests: Record<string, string>[] = []) =>
  http.get(api('/v2/courses/9756/evaluations'), ({ request }) => {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    requests.push(query);
    return HttpResponse.json({ content: query.sort === 'LATEST' ? [SECOND] : [FIRST], size: 1, last: true });
  });

const items = () => within(screen.getByRole('region', { name: '강의평 목록' })).queryAllByRole('article');

/** 항목 이름 → 점수 */
const scores = () =>
  Object.fromEntries(
    within(screen.getByRole('region', { name: '강의평 요약' }))
      .getAllByRole('term')
      .map((term) => [term.textContent, term.nextElementSibling?.textContent]),
  );

afterEach(() => vi.unstubAllGlobals());

describe('EvaluationView', () => {
  it('교수 / 학점 아래에 평균 점수, 강의평 수, 항목별 평균을 보여 준다', async () => {
    server.use(summaryHandler(), listHandler());
    renderView();
    expect(screen.getByText('김명수 / 3학점')).toBeInTheDocument();

    const summary = await screen.findByRole('region', { name: '강의평 요약' });
    expect(within(summary).getByText('(2)')).toBeInTheDocument();
    expect(within(summary).getByRole('img', { name: '별점 4.25점' })).toBeInTheDocument();
    expect(scores()).toEqual({ 성적: '3.5', 강의력: '4.0', 유익함: '4.5', 널널함: '2.5' });
  });

  it('목록은 추천순으로 받고, 최신순을 누르면 다시 받는다. 학기 · 별점 · 본문 · 좋아요 수를 보여 준다', async () => {
    const requests: Record<string, string>[] = [];
    server.use(summaryHandler(), listHandler(requests));
    renderView();

    const [first] = await waitFor(() => {
      expect(items()).toHaveLength(1);
      return items();
    });
    expect(screen.getByRole('button', { name: '추천순', pressed: true })).toBeInTheDocument();
    expect(first).toHaveAccessibleName('2026년 1학기 강의평');
    expect(within(first).getByRole('img', { name: '별점 4.5점' })).toBeInTheDocument();
    expect(within(first).getByText('과제가 많지만 배우는 것이 많아요')).toBeInTheDocument();
    expect(within(first).getByLabelText('좋아요 3개')).toBeInTheDocument();
    // 좋아요를 누르는 것은 8-5 라 아직 버튼이 아니다
    expect(within(first).queryByRole('button')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '최신순' }));
    expect(screen.getByRole('button', { name: '최신순', pressed: true })).toBeInTheDocument();
    expect(await screen.findByText('무난합니다')).toBeInTheDocument();
    expect(screen.queryByText('과제가 많지만 배우는 것이 많아요')).not.toBeInTheDocument();
    expect(requests.map(({ sort }) => sort)).toEqual(['RECOMMENDED', 'LATEST']);
  });

  it('목록 끝이 보이면 커서로 다음 쪽을 받는다', async () => {
    const cursors: (string | undefined)[] = [];
    server.use(
      summaryHandler(),
      http.get(api('/v2/courses/9756/evaluations'), ({ request }) => {
        const cursor = new URL(request.url).searchParams.get('cursor') ?? undefined;
        cursors.push(cursor);
        return cursor === 'c1'
          ? HttpResponse.json({ content: [SECOND], size: 1, last: true })
          : HttpResponse.json({ content: [FIRST], cursor: 'c1', size: 1, last: false });
      }),
    );
    // 목록 끝이 보이는 것은 IntersectionObserver 를 흉내 내 바로 알린다
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(private readonly onChange: IntersectionObserverCallback) {}
        observe() {
          this.onChange([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
        }
        disconnect() {}
      },
    );
    renderView();

    await waitFor(() => expect(items()).toHaveLength(2));
    expect(cursors).toEqual([undefined, 'c1']);
  });

  it('강의평이 없으면 점수 자리에 `-`, 목록 자리에 안내', async () => {
    server.use(
      summaryHandler({ courseId: 9756, evalCount: 0 }),
      http.get(api('/v2/courses/9756/evaluations'), () => HttpResponse.json({ content: [], size: 0, last: true })),
    );
    renderView();

    expect(await screen.findByText('아직 강의평이 없습니다')).toBeInTheDocument();
    const summary = await screen.findByRole('region', { name: '강의평 요약' });
    expect(within(summary).getByText('(0)')).toBeInTheDocument();
    expect(scores()).toEqual({ 성적: '-', 강의력: '-', 유익함: '-', 널널함: '-' });
  });

  it('이메일 인증을 하지 않았으면 서버 문구만 보여 준다', async () => {
    const message = '이메일 인증이 완료된 후 강의평을 확인할 수 있습니다';
    const forbidden = () =>
      HttpResponse.json(problem(403, 'email-not-verified', 'Forbidden', message), { status: 403 });
    server.use(
      http.get(api('/v2/courses/9756/evaluation-summary'), forbidden),
      http.get(api('/v2/courses/9756/evaluations'), forbidden),
    );
    renderView();

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '강의평 목록' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: '정렬' })).not.toBeInTheDocument();
  });

  it('직접 추가한 강의(강좌 없음)는 요청하지 않고 안내만 한다', () => {
    // 정하지 않은 요청은 실패하므로, 요청하면 테스트가 깨진다
    renderView({ ...LECTURE, courseId: null, lectureId: null, credit: null });
    expect(screen.getByText('직접 추가한 강의는 강의평이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('김명수')).toBeInTheDocument();
  });
});
