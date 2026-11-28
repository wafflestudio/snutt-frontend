import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import type { SocialProvider } from '@/domain/user';
import { callApi, clearAuthTokens, getAuthTokens, setAuthTokens, subscribeAuthTokens } from './client';
import { toApiSocialProvider } from './mappers/user';

// 아이디 · 소셜 로그인, 회원가입, 로그아웃. 비밀번호 재설정은 3-3

/**
 * 로그인했는지. 토큰이 바뀌면(다른 탭 포함) 다시 그린다.
 * 서버 렌더링과 첫 hydration 에서는 토큰을 읽을 수 없어 null 이다.
 */
export const useSignedIn = () =>
  useSyncExternalStore(
    subscribeAuthTokens,
    () => getAuthTokens() !== null,
    () => null,
  );

/** 토큰을 저장하고, 이전 사용자의 데이터를 지운다 */
const useSignIn = () => {
  const queryClient = useQueryClient();
  return ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
    queryClient.clear();
    setAuthTokens({ accessToken, refreshToken });
  };
};

export const useLocalLogin = () => {
  const signIn = useSignIn();
  return useMutation({
    mutationFn: (body: { localId: string; password: string }) => callApi('POST /v2/auth/login', { body }),
    onSuccess: signIn,
  });
};

/**
 * provider 가 준 access token 으로 로그인한다. 처음 쓰는 소셜 계정이면 서버가 가입시킨다.
 * 토큰은 shared/lib/social-auth 가 받는다
 */
export const useSocialLogin = () => {
  const signIn = useSignIn();
  return useMutation({
    mutationFn: ({ provider, token }: { provider: SocialProvider; token: string }) =>
      callApi('POST /v2/auth/login/:provider', { params: { provider: toApiSocialProvider(provider) }, body: { token } }),
    onSuccess: signIn,
  });
};

/** 가입하면 바로 로그인된다 (서버가 토큰을 준다) */
export const useRegister = () => {
  const signIn = useSignIn();
  return useMutation({
    mutationFn: (body: { localId: string; password: string; email: string }) =>
      callApi('POST /v2/auth/register', { body }),
    onSuccess: signIn,
  });
};

/**
 * 서버에서 refresh token 을 폐기하고 토큰과 받은 데이터를 지운다.
 * 서버 요청이 실패해도 이 브라우저에서는 로그아웃한다 (access token 은 만료될 때까지 남지만 저장하지 않는다)
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  return async () => {
    const tokens = getAuthTokens();
    clearAuthTokens();
    queryClient.clear();
    if (tokens) await callApi('POST /v2/auth/logout', { body: { refreshToken: tokens.refreshToken } }).catch(() => {});
  };
};
