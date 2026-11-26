import { queryOptions, type QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Friend, FriendId, FriendState } from '@/domain/friend';
import { compareSemester, type Semester, toSemesterKey } from '@/domain/semester';
import { ApiError, callApi } from './client';
import { toFriend, toFriendStateQuery, toFriendTimetable } from './mappers/friend';
import { toSemester } from './mappers/timetable';

export const friendQueries = {
  all: () => ['friends'] as const,
  /** 친구 · 받은 요청 · 보낸 요청 목록. 쪽을 나누지 않고 한 번에 온다 */
  list: (state: FriendState) =>
    queryOptions({
      queryKey: [...friendQueries.all(), 'list', state],
      queryFn: async () =>
        (await callApi('GET /v2/friends', { query: { state: toFriendStateQuery(state) } })).map(toFriend),
    }),
  /** 친구가 기본 시간표를 가진 학기. 최근 학기가 앞에 온다. 친구가 아니면 404 `friend-not-found` */
  semesters: (id: FriendId) =>
    queryOptions({
      queryKey: [...friendQueries.all(), 'semesters', id],
      queryFn: async () =>
        (await callApi('GET /v2/friends/:friendId/coursebooks', { params: { friendId: id } }))
          .map(toSemester)
          .sort((a, b) => compareSemester(b, a)),
    }),
  /**
   * 친구의 그 학기 기본 시간표. 기본 시간표가 없으면 서버는 404 `primary-timetable-not-found` 를 주는데,
   * 실패가 아니라 "시간표 없음" 이라 null 로 바꾼다.
   */
  primaryTimetable: (id: FriendId, semester: Semester) =>
    queryOptions({
      queryKey: [...friendQueries.all(), 'primary-timetable', id, toSemesterKey(semester)],
      queryFn: async () => {
        try {
          return toFriendTimetable(
            await callApi('GET /v2/friends/:friendId/primary-table', {
              params: { friendId: id },
              query: { year: String(semester.year), semester: String(semester.term) },
            }),
          );
        } catch (error) {
          if (error instanceof ApiError && error.type === '/problems/primary-timetable-not-found') return null;
          throw error;
        }
      },
    }),
};

const removeFromList = (queryClient: QueryClient, state: FriendState, id: FriendId) =>
  queryClient.setQueryData(friendQueries.list(state).queryKey, (list) => list?.filter((friend) => friend.id !== id));

/**
 * 받은 요청을 수락한다. 받은 요청에서 빼고, 친구 목록은 서버 순서를 따르도록 다시 받는다.
 * 응답은 수락한 친구다.
 */
export const useAcceptFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: FriendId): Promise<Friend> =>
      toFriend(await callApi('POST /v2/friends/:friendId/accept', { params: { friendId: id } })),
    onSuccess: (_, id) => {
      removeFromList(queryClient, 'requested', id);
      return queryClient.invalidateQueries({ queryKey: friendQueries.list('active').queryKey });
    },
  });
};

/** 받은 요청을 거절한다. 응답 본문이 없어서 보낸 ID 로 받은 요청 목록을 고친다 */
export const useDeclineFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: FriendId) => callApi('POST /v2/friends/:friendId/decline', { params: { friendId: id } }),
    onSuccess: (_, id) => removeFromList(queryClient, 'requested', id),
  });
};

/** `닉네임#0000` 의 사용자에게 친구 요청을 보낸다. 보낸 요청 목록은 다시 받는다 */
export const useRequestFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (target: Pick<Friend, 'nickname' | 'nicknameTag'>): Promise<Friend> =>
      toFriend(
        await callApi('POST /v2/friends', {
          body: { nickname: target.nickname, nicknameTag: target.nicknameTag },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: friendQueries.list('requesting').queryKey }),
  });
};

/** 친구를 목록에서 지운다(친구 끊기). 응답 본문이 없어서 보낸 ID 로 친구 목록을 고친다 */
export const useDeleteFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: FriendId) => callApi('DELETE /v2/friends/:friendId', { params: { friendId: id } }),
    onSuccess: (_, id) => removeFromList(queryClient, 'active', id),
  });
};

/** 친구에게 내가 붙인 이름을 바꾼다. 응답(바뀐 친구)으로 친구 목록의 그 줄을 바꾼다 */
export const useRenameFriend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, displayName }: { id: FriendId; displayName: string }): Promise<Friend> =>
      toFriend(
        await callApi('PATCH /v2/friends/:friendId/display-name', {
          params: { friendId: id },
          body: { displayName },
        }),
      ),
    onSuccess: (friend) =>
      queryClient.setQueryData(friendQueries.list('active').queryKey, (list) =>
        list?.map((item) => (item.id === friend.id ? friend : item)),
      ),
  });
};
