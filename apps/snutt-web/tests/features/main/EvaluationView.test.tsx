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
import { fakeEvaluations } from '../../msw/fake-evaluations';
import {
  EVALUATION_LECTURE_RESPONSES,
  EVALUATION_RESPONSES,
  EVALUATION_SUMMARY_RESPONSE,
  problem,
} from '../../msw/fixtures';
import { api, server } from '../../msw/server';

const [FIRST, SECOND] = EVALUATION_RESPONSES;
// 서양근대윤리학의 이해. 강의평은 강좌(9756)로 부른다
const LECTURE: TimetableLecture = {
  ...SAMPLE_TIMETABLES[0].lectures.find(({ id }) => id === '1-3')!,
  instructor: '김명수',
  courseId: '9756',
  lectureId: '7001',
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
    expect(within(first).getByRole('button', { name: '좋아요 3개', pressed: false })).toBeInTheDocument();

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

describe('EvaluationView 상호작용', () => {
  /** 강의평 9756 을 메모리에 두는 가짜 서버. 501 은 남의 강의평, 502 는 내 강의평(2019년 2학기)이다 */
  const useFake = () => {
    const fake = fakeEvaluations({
      courseId: 9756,
      evaluations: EVALUATION_RESPONSES,
      lectures: EVALUATION_LECTURE_RESPONSES,
    });
    server.use(...fake.handlers);
    return fake;
  };

  const findItem = async (semester: string) =>
    within(await screen.findByRole('region', { name: '강의평 목록' })).findByRole('article', {
      name: `${semester} 강의평`,
    });

  const openMenu = async (item: HTMLElement, action: string) => {
    await userEvent.click(within(item).getByRole('button', { name: '강의평 메뉴' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: action }));
  };

  const pickScore = async (scope: HTMLElement, label: string, score: number) =>
    userEvent.click(
      within(within(scope).getByRole('group', { name: label })).getByRole('radio', { name: `${score}점` }),
    );

  it('좋아요를 누르면 수가 늘고 눌린 상태가 되며, 다시 누르면 취소한다', async () => {
    const fake = useFake();
    renderView();
    const item = await findItem('2026년 1학기');

    await userEvent.click(within(item).getByRole('button', { name: '좋아요 3개', pressed: false }));
    expect(await within(item).findByRole('button', { name: '좋아요 4개', pressed: true })).toBeInTheDocument();

    await userEvent.click(within(item).getByRole('button', { name: '좋아요 4개' }));
    expect(await within(item).findByRole('button', { name: '좋아요 3개', pressed: false })).toBeInTheDocument();
    expect(fake.requests.map(({ method, path }) => `${method} ${path}`)).toEqual([
      'POST /v2/evaluations/501/like',
      'DELETE /v2/evaluations/501/like',
    ]);
  });

  it('좋아요가 실패하면 서버 문구를 알림 팝업으로 띄운다', async () => {
    const fake = fakeEvaluations({ courseId: 9756, evaluations: EVALUATION_RESPONSES, lectures: [] });
    server.use(
      http.post(api('/v2/evaluations/501/like'), () =>
        HttpResponse.json(problem(400, 'self-like', '잘못된 요청', '내 강의평에는 좋아요를 누를 수 없습니다'), {
          status: 400,
        }),
      ),
      ...fake.handlers,
    );
    renderView();
    const item = await findItem('2026년 1학기');

    await userEvent.click(within(item).getByRole('button', { name: '좋아요 3개' }));
    const notice = await screen.findByRole('alertdialog', { name: '내 강의평에는 좋아요를 누를 수 없습니다' });
    await userEvent.click(within(notice).getByRole('button', { name: '확인' }));
    expect(within(item).getByRole('button', { name: '좋아요 3개', pressed: false })).toBeInTheDocument();
  });

  it('⋮ 메뉴: 내 강의평은 수정 · 삭제, 남의 강의평은 신고', async () => {
    useFake();
    renderView();

    await userEvent.click(within(await findItem('2019년 2학기')).getByRole('button', { name: '강의평 메뉴' }));
    expect((await screen.findAllByRole('menuitem')).map((item) => item.textContent)).toEqual(['수정', '삭제']);
    await userEvent.keyboard('{Escape}');

    await userEvent.click(within(await findItem('2026년 1학기')).getByRole('button', { name: '강의평 메뉴' }));
    await waitFor(() => expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['신고']));
  });

  it('작성: 지금 강의의 학기를 고른 채로 열고, 점수와 본문을 모두 채워야 등록한다', async () => {
    const fake = useFake();
    renderView();
    await findItem('2026년 1학기');

    await userEvent.click(screen.getByRole('button', { name: '강의평 작성' }));
    const dialog = await screen.findByRole('dialog', { name: '강의평 작성' });
    expect(within(dialog).getByText('서양근대윤리학의 이해')).toBeInTheDocument();
    expect(await within(dialog).findByRole('combobox', { name: '수강 학기' })).toHaveTextContent('2026년 1학기');
    const submit = within(dialog).getByRole('button', { name: '등록' });
    expect(submit).toBeDisabled();

    await pickScore(dialog, '총점', 4);
    await pickScore(dialog, '성적', 5);
    await pickScore(dialog, '강의력', 4);
    await pickScore(dialog, '유익함', 3);
    expect(submit).toBeDisabled();
    await pickScore(dialog, '널널함', 2);
    expect(submit).toBeDisabled();
    await userEvent.type(within(dialog).getByRole('textbox', { name: '강의평' }), '  알찬 수업  ');
    await userEvent.click(submit);

    expect(await screen.findByText('강의평을 등록했습니다')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: '강의평 작성' })).not.toBeInTheDocument();
    expect(fake.requests).toEqual([
      {
        method: 'POST',
        path: '/v2/lectures/7001/evaluations',
        body: { content: '알찬 수업', rating: 4, gradeSatisfaction: 5, teachingSkill: 4, gains: 3, lifeBalance: 2 },
      },
    ]);
    // 통계와 목록을 다시 받는다
    expect(await screen.findByText('알찬 수업')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: '강의평 요약' })).getByText('(3)')).toBeInTheDocument();
  });

  it('작성이 실패하면 모달을 닫지 않고 서버 문구를 보여 준다', async () => {
    useFake();
    server.use(
      http.post(api('/v2/lectures/7001/evaluations'), () =>
        HttpResponse.json(problem(403, 'not-taken', '권한 없음', '수강한 강의에만 강의평을 쓸 수 있습니다'), {
          status: 403,
        }),
      ),
    );
    renderView();
    await findItem('2026년 1학기');

    await userEvent.click(screen.getByRole('button', { name: '강의평 작성' }));
    const dialog = await screen.findByRole('dialog', { name: '강의평 작성' });
    await within(dialog).findByRole('combobox', { name: '수강 학기' });
    for (const label of ['총점', '성적', '강의력', '유익함', '널널함']) await pickScore(dialog, label, 3);
    await userEvent.type(within(dialog).getByRole('textbox', { name: '강의평' }), '좋아요');
    await userEvent.click(within(dialog).getByRole('button', { name: '등록' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('수강한 강의에만 강의평을 쓸 수 있습니다');
    expect(screen.getByRole('dialog', { name: '강의평 작성' })).toBeInTheDocument();
  });

  it('수정: 원래 값을 채워 열고, 바뀐 값만 보낸다', async () => {
    const fake = useFake();
    renderView();

    await openMenu(await findItem('2019년 2학기'), '수정');
    const dialog = await screen.findByRole('dialog', { name: '강의평 수정' });
    expect(within(dialog).getByText('2019년 2학기')).toBeInTheDocument();
    expect(within(dialog).getByRole('textbox', { name: '강의평' })).toHaveValue('무난합니다');
    expect(
      within(within(dialog).getByRole('group', { name: '총점' })).getByRole('radio', { name: '4점' }),
    ).toBeChecked();
    const save = within(dialog).getByRole('button', { name: '저장' });
    // 바뀐 것이 없으면 저장할 수 없다
    expect(save).toBeDisabled();

    await pickScore(dialog, '총점', 3);
    // 예전 snuev 강의평이라 항목별 점수가 없다. 고른 것만 보낸다
    await pickScore(dialog, '성적', 5);
    await userEvent.click(save);

    expect(await screen.findByText('강의평을 수정했습니다')).toBeInTheDocument();
    expect(fake.requests).toEqual([
      { method: 'PATCH', path: '/v2/evaluations/502', body: { rating: 3, gradeSatisfaction: 5 } },
    ]);
  });

  it('삭제: 확인을 받고 지운 뒤 목록에서 뺀다', async () => {
    const fake = useFake();
    renderView();

    await openMenu(await findItem('2019년 2학기'), '삭제');
    const confirm = await screen.findByRole('alertdialog', { name: '강의평을 삭제하시겠습니까?' });
    await userEvent.click(within(confirm).getByRole('button', { name: '삭제' }));

    expect(await screen.findByText('강의평을 삭제했습니다')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('무난합니다')).not.toBeInTheDocument());
    expect(fake.requests).toEqual([{ method: 'DELETE', path: '/v2/evaluations/502' }]);
  });

  it('신고: 사유를 받아 보낸다', async () => {
    const fake = useFake();
    renderView();

    await openMenu(await findItem('2026년 1학기'), '신고');
    const prompt = await screen.findByRole('dialog', { name: '신고 사유' });
    await userEvent.type(within(prompt).getByRole('textbox', { name: '신고 사유' }), '광고입니다');
    await userEvent.click(within(prompt).getByRole('button', { name: '신고' }));

    expect(await screen.findByText('강의평을 신고했습니다')).toBeInTheDocument();
    expect(fake.requests).toEqual([
      { method: 'POST', path: '/v2/evaluations/501/report', body: { content: '광고입니다' } },
    ]);
  });
});
