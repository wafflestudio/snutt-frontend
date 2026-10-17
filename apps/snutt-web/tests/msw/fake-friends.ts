import type { SnuttV2 } from '@sf/snutt-api';
import { http, HttpResponse } from 'msw';
import { problem } from './fixtures';
import { api } from './server';

type ServerFriendState = 'ACTIVE' | 'REQUESTED' | 'REQUESTING';

type FakeFriendsOptions = Partial<Record<ServerFriendState, readonly SnuttV2.FriendResponse[]>>;

/**
 * 친구 화면 테스트용 가짜 서버. 상태별 친구 목록을 메모리에 두고 v2 처럼 응답한다.
 * - 수락하면 받은 요청에서 친구로 옮기고, 거절하면 받은 요청에서 지운다 (응답 본문 없음)
 * - 없는 친구 관계는 404 `friend-not-found`
 */
export const fakeFriends = (initial: FakeFriendsOptions) => {
  const state: Record<ServerFriendState, SnuttV2.FriendResponse[]> = {
    ACTIVE: structuredClone([...(initial.ACTIVE ?? [])]),
    REQUESTED: structuredClone([...(initial.REQUESTED ?? [])]),
    REQUESTING: structuredClone([...(initial.REQUESTING ?? [])]),
  };

  const notFound = () =>
    HttpResponse.json(problem(404, 'friend-not-found', '찾을 수 없음', '친구 정보가 없습니다.'), { status: 404 });

  /** 받은 요청에서 꺼낸다. 없으면 null */
  const takeRequested = (friendId: string) => {
    const index = state.REQUESTED.findIndex(({ id }) => String(id) === friendId);
    return index < 0 ? null : state.REQUESTED.splice(index, 1)[0];
  };

  const handlers = [
    http.get(api('/v2/friends'), ({ request }) => {
      const key = new URL(request.url).searchParams.get('state');
      if (key !== 'ACTIVE' && key !== 'REQUESTED' && key !== 'REQUESTING')
        return HttpResponse.json(problem(400, 'invalid-parameter', '잘못된 요청', '파라미터 값 오류'), {
          status: 400,
        });
      return HttpResponse.json(state[key]);
    }),
    http.post(api('/v2/friends/:friendId/accept'), ({ params }) => {
      const friend = takeRequested(String(params.friendId));
      if (!friend) return notFound();
      state.ACTIVE.push(friend);
      return HttpResponse.json(friend);
    }),
    http.post(api('/v2/friends/:friendId/decline'), ({ params }) =>
      takeRequested(String(params.friendId)) ? new HttpResponse(null, { status: 200 }) : notFound(),
    ),
  ];

  return { handlers, state };
};
