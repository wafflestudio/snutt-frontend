// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { FriendsScreen } from '@/features/friends/components/FriendsScreen';
import { fakeFriends } from '../../msw/fake-friends';
import { FRIEND_RESPONSES, FRIEND_TIMETABLE_RESPONSES, problem } from '../../msw/fixtures';
import { api, server } from '../../msw/server';

const REQUEST = { id: 21, userId: 70001, nickname: '새내기', nicknameTag: '1234', createdAt: 1760000000000 };
const USER = { userId: 70003, nickname: '도전하는 초코우유', nicknameTag: '4563' };

const renderFriends = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <FriendsScreen />
    </QueryClientProvider>,
  );
};

const openTab = (name: string) => userEvent.click(screen.getByRole('tab', { name }));
/** 지금 보이는 탭의 목록 줄 */
const rows = () => within(screen.getByRole('tabpanel')).queryAllByRole('listitem');
/** 오른쪽 친구 시간표 자리 */
const timetableArea = () => within(screen.getByRole('region', { name: '친구 시간표' }));
const pickFriend = async (name: string) =>
  userEvent.click(await within(screen.getByRole('tabpanel')).findByRole('button', { name }));
const chooseMenu = async (trigger: string, item: string) => {
  await userEvent.click(await screen.findByRole('button', { name: trigger }));
  await userEvent.click(await screen.findByRole('menuitem', { name: item }));
};
const alertDialog = () => screen.findByRole('alertdialog');
const closeAlert = async (button = '확인') => {
  await userEvent.click(within(await alertDialog()).getByRole('button', { name: button }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
};

describe('친구 목록', () => {
  it('처음에는 친구 목록 탭: 붙인 이름이 있으면 그 이름, 없으면 닉네임#태그', async () => {
    server.use(...fakeFriends({ ACTIVE: FRIEND_RESPONSES }).handlers);
    renderFriends();

    expect(screen.getByRole('tab', { name: '친구 목록' })).toHaveAttribute('aria-selected', 'true');
    await screen.findByRole('button', { name: '와플#7052' });
    expect(rows().map((row) => row.textContent)).toEqual(['와플#7052', '룸메']);
    expect(screen.getByRole('button', { name: '카카오톡 친구 초대' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '닉네임으로 친구 요청' })).toBeInTheDocument();
  });

  it('친구가 없으면 안내와 친구 추가 버튼을 보여 준다', async () => {
    server.use(...fakeFriends({}).handlers);
    renderFriends();

    expect(await screen.findByText('추가한 친구가 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '닉네임으로 친구 요청' })).toBeInTheDocument();
    // 시간표 자리는 빈 그리드 (헤더에 친구 이름 · 메뉴가 없다)
    expect(timetableArea().queryByRole('heading')).not.toBeInTheDocument();
    expect(timetableArea().queryByRole('button', { name: '친구 메뉴' })).not.toBeInTheDocument();
  });

  it('목록을 불러오지 못하면 서버 메시지를 보여 준다', async () => {
    server.use(
      http.get(api('/v2/friends'), () =>
        HttpResponse.json(problem(500, 'internal-server-error', '서버 오류', '잠시 후 다시 시도해 주세요.'), {
          status: 500,
        }),
      ),
    );
    renderFriends();

    expect(await screen.findByText('목록을 불러오지 못했습니다')).toBeInTheDocument();
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
  });

  it('카카오톡 친구 초대는 아직 준비 중이라고 알린다', async () => {
    server.use(...fakeFriends({ ACTIVE: FRIEND_RESPONSES }).handlers);
    renderFriends();

    await userEvent.click(await screen.findByRole('button', { name: '카카오톡 친구 초대' }));
    expect(await alertDialog()).toHaveTextContent('카카오톡 친구 초대는 아직 준비 중입니다.');
  });

  it('패널을 접고 시간표 헤더의 버튼으로 다시 펼친다', async () => {
    server.use(...fakeFriends({ ACTIVE: FRIEND_RESPONSES }).handlers);
    renderFriends();
    await screen.findByRole('button', { name: '와플#7052' });

    await userEvent.click(screen.getByRole('button', { name: '패널 접기' }));
    expect(screen.queryByRole('complementary', { name: '친구 목록' })).not.toBeInTheDocument();

    await userEvent.click(timetableArea().getByRole('button', { name: '패널 펼치기' }));
    expect(screen.getByRole('complementary', { name: '친구 목록' })).toBeInTheDocument();
  });
});

describe('닉네임으로 친구 요청', () => {
  const openForm = async () => {
    await userEvent.click(await screen.findByRole('button', { name: '닉네임으로 친구 요청' }));
    return screen.getByRole('textbox', { name: '추가할 친구의 닉네임 전체를 입력하세요.' });
  };

  it('닉네임#태그로 요청을 보내면 알리고 입력 상자를 닫는다', async () => {
    const fake = fakeFriends({ ACTIVE: FRIEND_RESPONSES, users: [USER] });
    server.use(...fake.handlers);
    renderFriends();

    await userEvent.type(await openForm(), '도전하는 초코우유#4563{Enter}');

    expect(await alertDialog()).toHaveTextContent('친구에게 요청을 보냈습니다.');
    expect(fake.state.REQUESTING.map(({ userId }) => userId)).toEqual([70003]);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('형식이 틀리면 요청을 보낼 수 없다', async () => {
    server.use(...fakeFriends({ ACTIVE: FRIEND_RESPONSES }).handlers);
    renderFriends();

    await userEvent.type(await openForm(), '초코우유');

    expect(screen.getByRole('alert')).toHaveTextContent('닉네임#0000 형식으로 입력해 주세요.');
    expect(screen.getByRole('button', { name: '요청 보내기' })).toBeDisabled();
  });

  it('서버가 거절하면 그 문구를 입력 상자 안에 보여 주고, 고치면 지운다', async () => {
    server.use(...fakeFriends({ ACTIVE: FRIEND_RESPONSES }).handlers);
    renderFriends();

    const input = await openForm();
    await userEvent.type(input, '없는사람#0000');
    await userEvent.click(screen.getByRole('button', { name: '요청 보내기' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('존재하지 않는 닉네임입니다.');
    await userEvent.type(input, '{Backspace}1');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('취소하면 입력 상자를 닫는다', async () => {
    server.use(...fakeFriends({ ACTIVE: FRIEND_RESPONSES }).handlers);
    renderFriends();

    await openForm();
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});

describe('친구 이름 설정 · 삭제', () => {
  it('⋮ 의 친구 이름 설정으로 이름을 바꾼다', async () => {
    const fake = fakeFriends({ ACTIVE: FRIEND_RESPONSES });
    server.use(...fake.handlers);
    renderFriends();

    await chooseMenu('와플#7052 메뉴', '친구 이름 설정');
    const input = screen.getByRole('textbox', { name: '나에게 표시될 친구 이름' });
    await userEvent.type(input, '김와플');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByRole('button', { name: '김와플' })).toBeInTheDocument();
    expect(fake.state.ACTIVE[0].displayName).toBe('김와플');
    // 고른 친구의 시간표 헤더도 바뀐다
    expect(timetableArea().getByRole('heading', { name: '김와플' })).toBeInTheDocument();
  });

  it('이름은 공백 포함 한/영/숫자 10자 이내. 붙인 이름이 있으면 채워서 연다', async () => {
    server.use(...fakeFriends({ ACTIVE: FRIEND_RESPONSES }).handlers);
    renderFriends();

    await chooseMenu('룸메 메뉴', '친구 이름 설정');
    const input = screen.getByRole('textbox', { name: '나에게 표시될 친구 이름' });
    expect(input).toHaveValue('룸메');
    await userEvent.type(input, '!');

    expect(screen.getByRole('alert')).toHaveTextContent('공백 포함 한/영/숫자 10자 이내');
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: '룸메' })).toBeInTheDocument();
  });

  it('시간표 헤더의 ··· 로도 이름을 고친다', async () => {
    server.use(...fakeFriends({ ACTIVE: FRIEND_RESPONSES }).handlers);
    renderFriends();
    await screen.findByRole('button', { name: '와플#7052' });

    await chooseMenu('친구 메뉴', '친구 이름 설정');
    expect(screen.getByRole('textbox', { name: '나에게 표시될 친구 이름' })).toHaveAttribute('placeholder', '와플');
  });

  it('목록에서 삭제는 확인을 받고 지운다. 보고 있던 친구면 다음 친구를 보여 준다', async () => {
    const fake = fakeFriends({ ACTIVE: FRIEND_RESPONSES });
    server.use(...fake.handlers);
    renderFriends();
    await screen.findByRole('button', { name: '와플#7052' });

    await chooseMenu('와플#7052 메뉴', '목록에서 삭제');
    expect(await alertDialog()).toHaveTextContent('선택하신 친구를 목록에서 삭제하시겠습니까?');
    await closeAlert('확인');

    await waitFor(() => expect(rows().map((row) => row.textContent)).toEqual(['룸메']));
    expect(fake.state.ACTIVE.map(({ id }) => id)).toEqual([4]);
    expect(timetableArea().getByRole('heading', { name: '룸메' })).toBeInTheDocument();
  });

  it('삭제 확인에서 취소하면 지우지 않는다', async () => {
    const fake = fakeFriends({ ACTIVE: FRIEND_RESPONSES });
    server.use(...fake.handlers);
    renderFriends();

    await chooseMenu('룸메 메뉴', '목록에서 삭제');
    await closeAlert('취소');
    expect(fake.state.ACTIVE).toHaveLength(2);
  });
});

describe('친구 요청', () => {
  it('비었을 때의 안내', async () => {
    server.use(...fakeFriends({}).handlers);
    renderFriends();

    await openTab('친구 요청');
    expect(await screen.findByText('받은 친구 요청이 없습니다.')).toBeInTheDocument();
  });

  it('수락하면 알리고, 요청에서 빠져 친구 목록에 들어간다', async () => {
    const fake = fakeFriends({ ACTIVE: FRIEND_RESPONSES, REQUESTED: [REQUEST] });
    server.use(...fake.handlers);
    renderFriends();
    await screen.findByRole('button', { name: '와플#7052' });

    await openTab('친구 요청');
    await userEvent.click(await screen.findByRole('button', { name: '새내기#1234 수락' }));

    expect(await alertDialog()).toHaveTextContent('친구요청을 수락하였습니다.');
    await closeAlert();
    expect(await screen.findByText('받은 친구 요청이 없습니다.')).toBeInTheDocument();
    await openTab('친구 목록');
    expect(await screen.findByRole('button', { name: '새내기#1234' })).toBeInTheDocument();
    expect(fake.state.ACTIVE.map(({ id }) => id)).toEqual([10, 4, 21]);
  });

  it('거절은 확인을 받고 요청에서 지운다', async () => {
    const fake = fakeFriends({ REQUESTED: [REQUEST] });
    server.use(...fake.handlers);
    renderFriends();

    await openTab('친구 요청');
    await userEvent.click(await screen.findByRole('button', { name: '새내기#1234 거절' }));
    expect(await alertDialog()).toHaveTextContent('친구요청을 거절하시겠습니까? 목록에서 삭제됩니다.');
    await closeAlert('확인');

    expect(await screen.findByText('받은 친구 요청이 없습니다.')).toBeInTheDocument();
    expect(fake.state.REQUESTED).toEqual([]);
    expect(fake.state.ACTIVE).toEqual([]);
  });

  it('수락이 실패하면 서버 메시지를 알림 팝업으로 보여 주고, 목록은 그대로 둔다', async () => {
    // 같은 server.use 안에서는 앞의 핸들러가 먼저 받는다
    server.use(
      http.post(api('/v2/friends/21/accept'), () =>
        HttpResponse.json(problem(409, 'friend-already-exists', '충돌', '이미 친구입니다.'), { status: 409 }),
      ),
      ...fakeFriends({ REQUESTED: [REQUEST] }).handlers,
    );
    renderFriends();

    await openTab('친구 요청');
    await userEvent.click(await screen.findByRole('button', { name: '새내기#1234 수락' }));

    expect(await alertDialog()).toHaveTextContent('이미 친구입니다.');
    await closeAlert();
    expect(screen.getByText('새내기#1234')).toBeInTheDocument();
  });
});

describe('친구 시간표', () => {
  it('처음에는 첫 친구의 가장 최근 학기 기본 시간표를 읽기 전용으로 보여 준다', async () => {
    server.use(
      ...fakeFriends({ ACTIVE: FRIEND_RESPONSES, primaryTables: { 10: FRIEND_TIMETABLE_RESPONSES } }).handlers,
    );
    renderFriends();

    expect(await screen.findByRole('button', { name: '와플#7052' })).toHaveAttribute('aria-pressed', 'true');
    expect(timetableArea().getByRole('heading', { name: '와플#7052' })).toBeInTheDocument();
    expect(await timetableArea().findByRole('combobox', { name: '학기' })).toHaveTextContent('2025년 겨울학기');
    const block = (await timetableArea().findByText('창의공학설계')).parentElement;
    // 내 테마 목록에 없는 친구의 테마도 서버가 정해 준 색으로 그린다
    expect(block).toHaveStyle({ backgroundColor: '#AABBCC', color: '#112233' });
  });

  it('학기를 바꾸면 그 학기의 기본 시간표를 보여 준다', async () => {
    server.use(
      ...fakeFriends({ ACTIVE: FRIEND_RESPONSES, primaryTables: { 10: FRIEND_TIMETABLE_RESPONSES } }).handlers,
    );
    renderFriends();

    await userEvent.click(await timetableArea().findByRole('combobox', { name: '학기' }));
    // 친구가 기본 시간표를 가진 학기만 고를 수 있다
    expect((await screen.findAllByRole('option')).map((option) => option.textContent)).toEqual([
      '2025년 겨울학기',
      '2025년 2학기',
    ]);
    await userEvent.click(screen.getByRole('option', { name: '2025년 2학기' }));

    // 수업 시간마다 블록 하나
    expect(await timetableArea().findAllByText('공학수학 1')).toHaveLength(2);
    expect(timetableArea().queryByText('창의공학설계')).not.toBeInTheDocument();
  });

  it('다른 친구를 고르면 그 친구의 시간표로 바뀌고, 대표 시간표가 없으면 빈 그리드 위에 알린다', async () => {
    server.use(
      ...fakeFriends({ ACTIVE: FRIEND_RESPONSES, primaryTables: { 10: FRIEND_TIMETABLE_RESPONSES } }).handlers,
    );
    renderFriends();
    await timetableArea().findByText('창의공학설계');

    await pickFriend('룸메');

    expect(timetableArea().getByRole('heading', { name: '룸메' })).toBeInTheDocument();
    // 모달이 아니라 그리드 위의 상자다
    expect(await timetableArea().findByRole('status')).toHaveTextContent('친구에게 대표 시간표가 없습니다.');
    await userEvent.click(within(timetableArea().getByRole('status')).getByRole('button', { name: '확인' }));
    expect(timetableArea().queryByRole('status')).not.toBeInTheDocument();
    expect(timetableArea().queryByText('창의공학설계')).not.toBeInTheDocument();
    expect(timetableArea().queryByRole('combobox', { name: '학기' })).not.toBeInTheDocument();
  });

  it('고른 학기에 기본 시간표가 없으면(404 primary-timetable-not-found) 알린다', async () => {
    server.use(
      http.get(api('/v2/friends/10/coursebooks'), () => HttpResponse.json([{ year: 2026, semester: 1 }])),
      ...fakeFriends({ ACTIVE: FRIEND_RESPONSES, primaryTables: { 10: FRIEND_TIMETABLE_RESPONSES } }).handlers,
    );
    renderFriends();

    expect(await timetableArea().findByRole('status')).toHaveTextContent('친구에게 대표 시간표가 없습니다.');
    expect(timetableArea().getByRole('combobox', { name: '학기' })).toHaveTextContent('2026년 1학기');
  });

  it('시간표를 불러오지 못하면 서버 메시지를 보여 준다', async () => {
    server.use(
      http.get(api('/v2/friends/10/primary-table'), () =>
        HttpResponse.json(problem(500, 'internal-server-error', '서버 오류', '잠시 후 다시 시도해 주세요.'), {
          status: 500,
        }),
      ),
      ...fakeFriends({ ACTIVE: FRIEND_RESPONSES, primaryTables: { 10: FRIEND_TIMETABLE_RESPONSES } }).handlers,
    );
    renderFriends();

    expect(await timetableArea().findByText('시간표를 불러오지 못했습니다')).toBeInTheDocument();
    expect(timetableArea().getByText('잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
  });
});
