import type { SnuttV2 } from '@sf/snutt-api';
import { http, HttpResponse } from 'msw';
import { problem } from './fixtures';
import { api } from './server';

type ServerFriendState = 'ACTIVE' | 'REQUESTED' | 'REQUESTING';

type FakeFriendsOptions = Partial<Record<ServerFriendState, readonly SnuttV2.FriendResponse[]>> & {
  /** 친구 관계 ID → 친구의 학기별 기본 시간표 */
  primaryTables?: Record<number, readonly SnuttV2.TimetableResponse[]>;
};

/**
 * 친구 화면 테스트용 가짜 서버. 상태별 친구 목록을 메모리에 두고 v2 처럼 응답한다.
 * - 수락하면 받은 요청에서 친구로 옮기고, 거절하면 받은 요청에서 지운다 (응답 본문 없음)
 * - 친구의 학기 목록은 기본 시간표가 있는 학기를 최근 학기부터 준다. 그 학기에 기본 시간표가 없으면 404 `primary-timetable-not-found`
 * - 없는 친구 관계는 404 `friend-not-found`
 */
export const fakeFriends = (initial: FakeFriendsOptions) => {
  const state: Record<ServerFriendState, SnuttV2.FriendResponse[]> = {
    ACTIVE: structuredClone([...(initial.ACTIVE ?? [])]),
    REQUESTED: structuredClone([...(initial.REQUESTED ?? [])]),
    REQUESTING: structuredClone([...(initial.REQUESTING ?? [])]),
  };

  const primaryTables = initial.primaryTables ?? {};
  /** 친구 탭에 있는 친구의 기본 시간표 목록. 친구가 아니면 null */
  const tablesOf = (friendId: string) =>
    state.ACTIVE.some(({ id }) => String(id) === friendId) ? (primaryTables[Number(friendId)] ?? []) : null;

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
    http.get(api('/v2/friends/:friendId/coursebooks'), ({ params }) => {
      const tables = tablesOf(String(params.friendId));
      if (!tables) return notFound();
      return HttpResponse.json(
        tables
          .map(({ year, semester }) => ({ year, semester }))
          .sort((a, b) => b.year - a.year || b.semester - a.semester),
      );
    }),
    http.get(api('/v2/friends/:friendId/primary-table'), ({ params, request }) => {
      const tables = tablesOf(String(params.friendId));
      if (!tables) return notFound();
      const query = new URL(request.url).searchParams;
      const table = tables.find(
        ({ year, semester }) => String(year) === query.get('year') && String(semester) === query.get('semester'),
      );
      return table
        ? HttpResponse.json(table)
        : HttpResponse.json(
            problem(404, 'primary-timetable-not-found', '대표 시간표 없음', '대표 시간표가 존재하지 않습니다'),
            { status: 404 },
          );
    }),
  ];

  return { handlers, state };
};
