import { infiniteQueryOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/domain/notification';
import type { SocialProvider, User } from '@/domain/user';
import { callApi, clearAuthTokens, setAuthTokens } from './client';
import { toApiSocialProvider, toNotification, toProviders, toUser } from './mappers/user';

// 더보기의 내 계정(소셜 연동 · 해제 포함) · 알림 · 개발자 괴롭히기

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

/**
 * 소셜 계정 연동 · 해제의 응답: 연결된 로그인 방법과 새 토큰(이전 토큰은 버려진다).
 * 토큰을 저장하고 내 정보의 로그인 방법을 바꾼다
 */
const useApplyProviders = () => {
  const queryClient = useQueryClient();
  return (response: { authProviders: Parameters<typeof toProviders>[0]; accessToken: string; refreshToken: string }) => {
    setAuthTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
    queryClient.setQueryData(userQueries.me().queryKey, (user: User | undefined) =>
      user ? { ...user, providers: toProviders(response.authProviders) } : user,
    );
  };
};

/** 소셜 계정을 연동한다. provider 가 준 access token 은 shared/lib/social-auth 가 받는다 */
export const useLinkSocial = () => {
  const applyProviders = useApplyProviders();
  return useMutation({
    mutationFn: ({ provider, token }: { provider: SocialProvider; token: string }) =>
      callApi('POST /v2/users/me/social/:provider', {
        params: { provider: toApiSocialProvider(provider) },
        body: { token },
      }),
    onSuccess: applyProviders,
  });
};

/** 소셜 계정 연동을 해제한다 */
export const useUnlinkSocial = () => {
  const applyProviders = useApplyProviders();
  return useMutation({
    mutationFn: (provider: SocialProvider) =>
      callApi('DELETE /v2/users/me/social/:provider', { params: { provider: toApiSocialProvider(provider) } }),
    onSuccess: applyProviders,
  });
};

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
