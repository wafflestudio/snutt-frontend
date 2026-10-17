import { queryOptions, type QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Friend, FriendId, FriendState } from '@/domain/friend';
import { callApi } from './client';
import { toFriend, toFriendStateQuery } from './mappers/friend';

export const friendQueries = {
  all: () => ['friends'] as const,
  /** 친구 · 받은 요청 · 보낸 요청 목록. 쪽을 나누지 않고 한 번에 온다 */
  list: (state: FriendState) =>
    queryOptions({
      queryKey: [...friendQueries.all(), 'list', state],
      queryFn: async () =>
        (await callApi('GET /v2/friends', { query: { state: toFriendStateQuery(state) } })).map(toFriend),
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
