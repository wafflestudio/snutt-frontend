import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi, clearAuthTokens, setAuthTokens } from './client';

// 1-2 에서는 API 확인용으로 아이디 로그인만 둔다. 로그인 화면 · 회원가입 · 토큰 갱신은 3-1

export const useLocalLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { localId: string; password: string }) => callApi('POST /v2/auth/login', { body }),
    onSuccess: ({ accessToken, refreshToken }) => {
      setAuthTokens({ accessToken, refreshToken });
      // 이전 사용자의 데이터를 지우고, 화면에 있는 query 는 새 토큰으로 다시 받는다
      void queryClient.resetQueries();
    },
  });
};

/** 서버의 로그아웃(refresh token 폐기)은 3-1 에서 붙인다 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  return () => {
    clearAuthTokens();
    void queryClient.resetQueries();
  };
};
