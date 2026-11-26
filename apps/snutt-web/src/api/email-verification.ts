import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi } from './client';
import { evaluationQueries } from './evaluations';

// 강의평은 이메일(서울대 메일)을 인증한 사용자만 쓸 수 있다. 인증하지 않으면 강의평 API 가 모두 403 `email-not-verified` 다

/** 서울대 메일 주소. 강의평 탭의 인증 팝업은 아이디만 받고 뒤에 이 주소를 붙인다 (Figma `강의평_인증_메일 입력`) */
export const SNU_MAIL_DOMAIN = '@snu.ac.kr';

/** 인증번호를 메일로 보낸다. 이미 다른 계정에서 인증한 메일이면 서버가 거절한다 */
export const useSendVerificationEmail = () =>
  useMutation({
    mutationFn: (email: string) => callApi('POST /v2/users/me/email/verification', { body: { email } }),
  });

/** 메일로 받은 인증번호를 확인한다. 인증되면 막혀 있던 강의평을 다시 받는다 */
export const useConfirmVerificationCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) =>
      (await callApi('POST /v2/users/me/email/verification/code', { body: { code } })).isEmailVerified,
    onSuccess: (verified) => {
      if (verified) void queryClient.invalidateQueries({ queryKey: evaluationQueries.all() });
    },
  });
};
