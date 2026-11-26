import { infiniteQueryOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/domain/notification';
import { callApi, clearAuthTokens, setAuthTokens } from './client';
import { toNotification, toUser } from './mappers/user';

// 더보기의 내 계정 · 알림 · 개발자 괴롭히기. 소셜 연동/해제는 SDK 와 앱 키가 필요해 3-2 에서 붙인다

export const userQueries = {
  all: () => ['user'] as const,
  me: () =>
    queryOptions({
      queryKey: [...userQueries.all(), 'me'],
      queryFn: async () => toUser(await callApi('GET /v2/users/me')),
    }),
};

/** 알림 목록 한 쪽 */
type NotificationPage = { notifications: Notification[]; next: string | null };

export const notificationQueries = {
  all: () => ['notifications'] as const,
  /**
   * 최근 알림부터 커서로 받는다. explicit=true 는 앱처럼 "목록을 열어 봤다" 고 서버에 알린다
   * (읽지 않은 알림 수 `GET /v2/notifications/count` 의 기준. 웹에는 아직 개수를 보여 줄 자리가 없다)
   */
  list: () =>
    infiniteQueryOptions({
      queryKey: [...notificationQueries.all(), 'list'],
      queryFn: async ({ pageParam }): Promise<NotificationPage> => {
        const page = await callApi('GET /v2/notifications', {
          query: { cursor: pageParam ?? undefined, explicit: 'true' },
        });
        return { notifications: page.content.map(toNotification), next: page.last ? null : (page.cursor ?? null) };
      },
      initialPageParam: null as string | null,
      getNextPageParam: (page) => page.next,
    }),
};

/** 닉네임을 바꾼다. 서버가 새 태그를 붙여 바뀐 내 정보를 돌려준다 */
export const useUpdateNickname = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nickname: string) => toUser(await callApi('PATCH /v2/users/me', { body: { nickname } })),
    onSuccess: (user) => queryClient.setQueryData(userQueries.me().queryKey, user),
  });
};

/** 비밀번호를 바꾼다. 서버가 새 토큰을 주므로(이전 토큰은 버려진다) 바로 저장한다 */
export const useChangePassword = () =>
  useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      callApi('PATCH /v2/users/me/password', { body }),
    onSuccess: ({ accessToken, refreshToken }) => setAuthTokens({ accessToken, refreshToken }),
  });

/** 계정을 지운다. 토큰과 받은 데이터를 지워 로그인 화면으로 보낸다 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => callApi('DELETE /v2/users/me'),
    onSuccess: () => {
      clearAuthTokens();
      queryClient.clear();
    },
  });
};

/** 개발자 괴롭히기 (피드백). 이메일은 비우면 null 로 보낸다 */
export const useSendFeedback = () =>
  useMutation({
    mutationFn: (body: { email: string | null; message: string }) => callApi('POST /v2/feedback', { body }),
  });
