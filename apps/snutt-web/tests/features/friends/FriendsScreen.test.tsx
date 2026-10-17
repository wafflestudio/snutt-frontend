// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { FriendsScreen } from '@/features/friends/components/FriendsScreen';
import { fakeFriends } from '../../msw/fake-friends';
import { FRIEND_RESPONSES, problem } from '../../msw/fixtures';
import { api, server } from '../../msw/server';

const REQUEST = { id: 21, userId: 70001, nickname: '새내기', nicknameTag: '1234', createdAt: 1760000000000 };
const SENT = { id: 22, userId: 70002, nickname: '선배', nicknameTag: '4321', createdAt: 1760000000000 };

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

describe('친구 화면', () => {
  it('처음에는 친구 탭: 붙인 이름이 있으면 그 이름, 아래에 닉네임#태그', async () => {
    server.use(...fakeFriends({ ACTIVE: FRIEND_RESPONSES }).handlers);
    renderFriends();

    expect(screen.getByRole('tab', { name: '친구' })).toHaveAttribute('aria-selected', 'true');
    await screen.findByText('와플');
    expect(rows().map((row) => row.textContent)).toEqual(['와플와플#7052', '룸메시간표장인#0562']);
    // 친구 탭에는 수락 · 거절이 없다
    expect(screen.queryByRole('button', { name: /수락/ })).not.toBeInTheDocument();
  });

  it('탭마다 비었을 때의 안내', async () => {
    server.use(...fakeFriends({}).handlers);
    renderFriends();

    expect(await screen.findByText('아직 친구가 없습니다')).toBeInTheDocument();
    await openTab('받은 요청');
    expect(await screen.findByText('받은 친구 요청이 없습니다')).toBeInTheDocument();
    await openTab('보낸 요청');
    expect(await screen.findByText('보낸 친구 요청이 없습니다')).toBeInTheDocument();
  });

  it('받은 요청을 수락하면 목록에서 빠지고 친구 탭에 들어간다', async () => {
    const fake = fakeFriends({ ACTIVE: FRIEND_RESPONSES, REQUESTED: [REQUEST] });
    server.use(...fake.handlers);
    renderFriends();
    await screen.findByText('와플');

    await openTab('받은 요청');
    await userEvent.click(await screen.findByRole('button', { name: '새내기#1234 수락' }));

    expect(await screen.findByText('받은 친구 요청이 없습니다')).toBeInTheDocument();
    await openTab('친구');
    expect(await screen.findByText('새내기')).toBeInTheDocument();
    expect(fake.state.ACTIVE.map(({ id }) => id)).toEqual([10, 4, 21]);
  });

  it('받은 요청을 거절하면 목록에서 빠진다', async () => {
    const fake = fakeFriends({ REQUESTED: [REQUEST] });
    server.use(...fake.handlers);
    renderFriends();

    await openTab('받은 요청');
    await userEvent.click(await screen.findByRole('button', { name: '새내기#1234 거절' }));

    expect(await screen.findByText('받은 친구 요청이 없습니다')).toBeInTheDocument();
    expect(fake.state.REQUESTED).toEqual([]);
    expect(fake.state.ACTIVE).toEqual([]);
  });

  it('보낸 요청은 보여 주기만 한다', async () => {
    server.use(...fakeFriends({ REQUESTING: [SENT] }).handlers);
    renderFriends();

    await openTab('보낸 요청');
    expect(await screen.findByText('선배#4321')).toBeInTheDocument();
    expect(within(rows()[0]).queryByRole('button')).not.toBeInTheDocument();
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

    await openTab('받은 요청');
    await userEvent.click(await screen.findByRole('button', { name: '새내기#1234 수락' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('이미 친구입니다.');
    await userEvent.click(within(dialog).getByRole('button', { name: '확인' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.getByText('새내기')).toBeInTheDocument();
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
});
