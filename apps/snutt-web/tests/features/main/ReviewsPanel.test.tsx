// @vitest-environment jsdom
import { QueryClientProvider } from '@tanstack/react-query';
import type { SnuttV2 } from '@sf/snutt-api';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '@/api/query-client';
import { ReviewsPanel } from '@/features/main/components/ReviewsPanel';
import { fakeEvaluations } from '../../msw/fake-evaluations';
import { EVALUATION_LECTURE_RESPONSES, EVALUATION_RESPONSES, problem } from '../../msw/fixtures';
import { api, server } from '../../msw/server';

const [FIRST] = EVALUATION_RESPONSES;
const OTHER: SnuttV2.EvaluationResponse = {
  ...FIRST,
  id: 601,
  courseId: 1234,
  courseTitle: '미국학개론',
  instructor: '정상준',
  content: '명강의입니다',
};

const TAGS: SnuttV2.EvaluationTagResponse[] = [
  { key: 'RECENT', title: '최신', description: '' },
  { key: 'RECOMMENDED', title: '추천', description: '' },
  { key: 'WELL_TAUGHT', title: '👍 명강', description: '강의력이 좋은 강의' },
  { key: 'SWEET', title: '🍯 꿀강', description: '' },
];

/** 최근 수강한 강의. 7002 는 강좌 9756 의 2025년 2학기 강의다 */
const TAKEN: SnuttV2.TakenLectureResponse[] = [
  {
    id: 1,
    lectureId: 7002,
    title: '공학수학 1',
    instructor: '김명수',
    courseNumber: 'M0000.000100',
    credit: 3,
    takenYear: 2025,
    takenSemester: 3,
    evalCount: 0,
    myEvaluationExists: false,
    recentEvaluations: [],
  },
  {
    id: 2,
    lectureId: 8001,
    title: '경영전략',
    instructor: '이교수',
    courseNumber: 'M0000.000200',
    takenYear: 2025,
    takenSemester: 1,
    evalCount: 0,
    myEvaluationExists: false,
    recentEvaluations: [],
  },
];

const page = (content: SnuttV2.EvaluationResponse[]) => ({ content, size: content.length, last: true });

/** 강의평 탭의 요청. 태그마다 받은 요청을 모은다 */
const useServer = () => {
  const fake = fakeEvaluations({
    courseId: 9756,
    evaluations: EVALUATION_RESPONSES,
    lectures: EVALUATION_LECTURE_RESPONSES,
  });
  const tagRequests: string[] = [];
  const courseQueries: string[] = [];
  server.use(
    http.get(api('/v2/evaluations/tags'), () => HttpResponse.json(TAGS)),
    http.get(api('/v2/evaluations/tags/:tag'), ({ params }) => {
      tagRequests.push(String(params.tag));
      return HttpResponse.json(page(params.tag === 'WELL_TAUGHT' ? [OTHER] : [FIRST]));
    }),
    http.get(api('/v2/evaluations/me'), () =>
      HttpResponse.json(page(fake.evaluations.filter(({ isMine }) => isMine))),
    ),
    http.get(api('/v2/users/me/lectures/latest'), ({ request }) => {
      expect(new URL(request.url).searchParams.get('excludeEvaluated')).toBe('true');
      return HttpResponse.json(TAKEN);
    }),
    http.get(api('/v2/courses'), ({ request }) => {
      courseQueries.push(new URL(request.url).searchParams.get('query') ?? '');
      return HttpResponse.json({
        content: [
          {
            id: 9756,
            title: '공학수학 1',
            instructor: '김명수',
            courseNumber: 'M0000.000100',
            evaluation: { evalCount: 2, avgRating: 4.25 },
          },
        ],
        size: 1,
        last: true,
      } satisfies SnuttV2.CursorPageCourseResponse);
    }),
    ...fake.handlers,
  );
  return { fake, tagRequests, courseQueries };
};

const renderPanel = (onCollapse = vi.fn()) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <ReviewsPanel onCollapse={onCollapse} />
    </QueryClientProvider>,
  );

const feed = () => screen.findByRole('region', { name: '강의평 목록' });

describe('ReviewsPanel 전체보기', () => {
  it('처음에는 추천순 강의평을 보여 주고, 최신순 · 태그 칩으로 바꾼다', async () => {
    const { tagRequests } = useServer();
    renderPanel();

    expect(screen.getByRole('tab', { name: '전체보기', selected: true })).toBeInTheDocument();
    expect(
      await within(await feed()).findByRole('article', { name: '공학수학 1 2026년 1학기 강의평' }),
    ).toBeInTheDocument();
    // 정렬 태그(최신 · 추천)는 칩이 아니라 정렬 버튼이다
    const chips = await screen.findByRole('group', { name: '태그' });
    expect(
      within(chips)
        .getAllByRole('button')
        .map((chip) => chip.textContent),
    ).toEqual(['👍 명강', '🍯 꿀강']);
    expect(screen.getByRole('button', { name: '추천순', pressed: true })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '최신순' }));
    await waitFor(() => expect(tagRequests).toEqual(['RECOMMENDED', 'RECENT']));

    await userEvent.click(within(chips).getByRole('button', { name: '👍 명강' }));
    expect(await screen.findByText('명강의입니다')).toBeInTheDocument();
    expect(tagRequests.at(-1)).toBe('WELL_TAUGHT');
    expect(screen.queryByRole('group', { name: '정렬' })).not.toBeInTheDocument();

    // 다시 누르면 고른 것을 풀고 정렬로 돌아온다
    await userEvent.click(within(chips).getByRole('button', { name: '👍 명강', pressed: true }));
    expect(await screen.findByRole('group', { name: '정렬' })).toBeInTheDocument();
  });

  it('강의명을 누르면 그 강좌의 강의평을 열고, `<` 로 돌아온다', async () => {
    useServer();
    renderPanel();

    const item = await within(await feed()).findByRole('article', { name: '공학수학 1 2026년 1학기 강의평' });
    await userEvent.click(within(item).getByRole('button', { name: '공학수학 1' }));

    expect(await screen.findByRole('heading', { name: '공학수학 1' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: '강의평 요약' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: '전체보기' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '뒤로' }));
    expect(await screen.findByRole('tab', { name: '전체보기' })).toBeInTheDocument();
  });

  it('검색어를 넣으면 강좌를 찾고, 누르면 강좌의 강의평을 연다', async () => {
    const { courseQueries } = useServer();
    renderPanel();

    await userEvent.type(screen.getByRole('searchbox', { name: '강의평 검색' }), '공학수학');
    const results = await screen.findByRole('region', { name: '검색 결과' });
    await userEvent.click(await within(results).findByRole('button', { name: /공학수학 1/ }));

    expect(courseQueries).toEqual(['공학수학']);
    expect(await screen.findByRole('region', { name: '강의평 요약' })).toBeInTheDocument();
  });

  it('패널 접기 버튼을 누르면 onCollapse 를 부른다', async () => {
    useServer();
    const onCollapse = vi.fn();
    renderPanel(onCollapse);
    await userEvent.click(screen.getByRole('button', { name: '패널 접기' }));
    expect(onCollapse).toHaveBeenCalled();
  });
});

describe('ReviewsPanel 나의 강의평', () => {
  const openMine = async () => {
    await userEvent.click(screen.getByRole('tab', { name: '나의 강의평' }));
    return screen.findByRole('region', { name: '내 강의평' });
  };

  it('강의평을 쓸 최근 강의와 내가 쓴 강의평을 학기별로 보여 준다', async () => {
    useServer();
    renderPanel();
    const mine = await openMine();

    expect(await within(mine).findByText('19년 2학기')).toBeInTheDocument();
    expect(within(mine).getByRole('article', { name: '공학수학 1 2019년 2학기 강의평' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '강의평 작성' })).toBeInTheDocument();
  });

  it('최근 강의의 강의평 작성: 학기는 정해져 있고, 쓰고 나면 남은 강의평을 쓰러 갈 수 있다', async () => {
    const { fake } = useServer();
    renderPanel();
    await openMine();

    await userEvent.click(await screen.findByRole('button', { name: '강의평 작성' }));
    const form = await screen.findByRole('form', { name: '강의평 작성' });
    expect(within(form).getByRole('heading', { name: '공학수학 1' })).toBeInTheDocument();
    expect(within(form).getByText('김명수 / 3학점')).toBeInTheDocument();
    expect(within(form).getByLabelText('수강 학기')).toHaveTextContent('2025년 2학기');

    for (const label of [
      '총점',
      '성적이 만족스러웠나요?',
      '교수님의 강의력이 좋았나요?',
      '수업 내용이 유익했나요?',
      '과제량이 적절했나요?',
    ])
      await userEvent.click(
        within(within(form).getByRole('group', { name: label })).getByRole('radio', { name: '4.5점' }),
      );
    await userEvent.type(
      within(form).getByRole('textbox', { name: '강의 리뷰' }),
      '과제가 많지만 배우는 게 많은 수업이에요',
    );
    await userEvent.click(within(form).getByRole('button', { name: '작성완료' }));

    const done = await screen.findByRole('alertdialog', { name: /강의평 등록 완료/ });
    expect(fake.requests).toEqual([
      {
        method: 'POST',
        path: '/v2/lectures/7002/evaluations',
        body: {
          content: '과제가 많지만 배우는 게 많은 수업이에요',
          rating: 4.5,
          gradeSatisfaction: 4.5,
          teachingSkill: 4.5,
          gains: 4.5,
          lifeBalance: 4.5,
        },
      },
    ]);

    await userEvent.click(within(done).getByRole('button', { name: '남은 강의평 작성' }));
    const taken = await screen.findByRole('region', { name: '최근 강의 목록' });
    // 최근 학기만 먼저 보여 주고, 이전 학기는 펼쳐서 본다
    expect(within(taken).getByText('25년 2학기')).toBeInTheDocument();
    expect(within(taken).queryByText('25년 1학기')).not.toBeInTheDocument();
    await userEvent.click(within(taken).getByRole('button', { name: '이전학기 강의 보기' }));
    expect(within(taken).getByRole('button', { name: '경영전략 강의평 작성' })).toBeInTheDocument();
  });

  it('지난학기 안내를 누르면 최근 강의 목록을 연다', async () => {
    useServer();
    renderPanel();
    await openMine();
    await userEvent.click(screen.getByRole('button', { name: /지난학기에 수강한 강의/ }));
    expect(await screen.findByRole('region', { name: '최근 강의 목록' })).toBeInTheDocument();
  });
});

describe('ReviewsPanel 이메일 인증', () => {
  it('인증하지 않았으면 인증 팝업을 띄우고, 메일 · 인증번호를 확인하면 강의평을 다시 받는다', async () => {
    let verified = false;
    const requests: unknown[] = [];
    const forbidden = () =>
      HttpResponse.json(
        problem(403, 'email-not-verified', 'Forbidden', '이메일 인증이 완료된 후 강의평을 확인할 수 있습니다'),
        {
          status: 403,
        },
      );
    server.use(
      http.get(api('/v2/evaluations/tags'), () => (verified ? HttpResponse.json(TAGS) : forbidden())),
      http.get(api('/v2/evaluations/tags/:tag'), () => (verified ? HttpResponse.json(page([FIRST])) : forbidden())),
      http.post(api('/v2/users/me/email/verification'), async ({ request }) => {
        requests.push(await request.json());
        return new HttpResponse(null, { status: 200 });
      }),
      http.post(api('/v2/users/me/email/verification/code'), async ({ request }) => {
        const { code } = (await request.json()) as { code: string };
        verified = code === '123456';
        return HttpResponse.json({ isEmailVerified: verified });
      }),
    );
    renderPanel();

    const card = await screen.findByRole('region', { name: '이메일 인증' });
    await userEvent.type(within(card).getByRole('textbox', { name: '메일 아이디' }), 'snutt1234');
    await userEvent.click(within(card).getByRole('button', { name: '인증 요청' }));
    expect(await within(card).findByText(/snutt1234@snu.ac.kr로 전송된/)).toBeInTheDocument();
    expect(requests).toEqual([{ email: 'snutt1234@snu.ac.kr' }]);
    expect(within(card).getByLabelText('남은 시간')).toHaveTextContent('3:00');

    const code = within(card).getByRole('textbox', { name: '인증번호' });
    await userEvent.type(code, '000000');
    await userEvent.click(within(card).getByRole('button', { name: '확인' }));
    expect(await within(card).findByRole('alert')).toHaveTextContent('인증번호를 다시 확인해주세요.');

    await userEvent.clear(code);
    await userEvent.type(code, '123456');
    await userEvent.click(within(card).getByRole('button', { name: '확인' }));
    expect(
      await within(await feed()).findByRole('article', { name: '공학수학 1 2026년 1학기 강의평' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '이메일 인증' })).not.toBeInTheDocument();
  });

  it('메일을 보낼 수 없으면 서버 문구를 보여 준다', async () => {
    server.use(
      http.get(api('/v2/evaluations/tags'), () => HttpResponse.json([])),
      http.get(api('/v2/evaluations/tags/:tag'), () =>
        HttpResponse.json(problem(403, 'email-not-verified', 'Forbidden', '인증 필요'), { status: 403 }),
      ),
      http.post(api('/v2/users/me/email/verification'), () =>
        HttpResponse.json(problem(409, 'duplicate-email', '중복', '이미 다른 계정에서 인증된 메일이에요.'), {
          status: 409,
        }),
      ),
    );
    renderPanel();

    const card = await screen.findByRole('region', { name: '이메일 인증' });
    await userEvent.type(within(card).getByRole('textbox', { name: '메일 아이디' }), 'snutt1234');
    await userEvent.click(within(card).getByRole('button', { name: '인증 요청' }));
    expect(await within(card).findByRole('alert')).toHaveTextContent('이미 다른 계정에서 인증된 메일이에요.');
    expect(within(card).getByRole('button', { name: '인증 요청' })).toBeDisabled();
  });
});
