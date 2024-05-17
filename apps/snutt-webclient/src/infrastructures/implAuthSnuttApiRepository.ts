import { type SnuttApi } from '@sf/snutt-api';

import { type getAuthService } from '@/usecases/authService';

export const implAuthSnuttApiRepository = ({
  snuttApi,
}: {
  snuttApi: SnuttApi;
}): Parameters<typeof getAuthService>[0]['authRepository'] => {
  return {
    signInWithIdPassword: async (body) => {
      const { status, data } = await snuttApi['POST /v1/auth/login_local']({ body });

      if (status === 200) return { type: 'success', data };
      else return { type: 'error', errcode: data.errcode };
    },
    signInWithFacebook: async (body) => {
      const { status, data } = await snuttApi['POST /auth/login_fb']({ body });
      if (status === 200) return { type: 'success', data };
      else return { type: 'error', errcode: data.errcode };
    },
    signUpWithIdPassword: async (body) => {
      const { status, data } = await snuttApi['POST /v1/auth/register_local']({ body });
      if (status === 200) return { type: 'success', data };
      else return { type: 'error', errcode: data.errcode };
    },
    findId: async (body) => {
      const { status, data } = await snuttApi['POST /v1/auth/id/find']({ body });
      if (status === 200) return { type: 'success' };
      else return { type: 'error', errcode: data.errcode };
    },
    passwordResetCheckEmail: async (body) => {
      const { status, data } = await snuttApi['POST /v1/auth/password/reset/email/check']({ body });
      if (status === 200) return { type: 'success', data };
      else return { type: 'error', errcode: data.errcode };
    },
    sendPasswordResetVerificationEmail: async (body) =>
      snuttApi['POST /v1/auth/password/reset/email/send']({ body }).then((r) => r.data),
    verifyPasswordResetCode: async (body) => {
      const { status, data } = await snuttApi['POST /v1/auth/password/reset/verification/code']({ body });
      if (status === 200) return { type: 'success' };
      else return { type: 'error', errcode: data.errcode };
    },
    resetPassword: async (body) => snuttApi['POST /v1/auth/password/reset']({ body }).then((r) => r.data),
  };
};
