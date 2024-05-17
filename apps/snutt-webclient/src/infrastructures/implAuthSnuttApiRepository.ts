import { type SnuttApi } from '@sf/snutt-api';

import { type getAuthService } from '@/usecases/authService';

export const implAuthSnuttApiRepository = ({
  snuttApi,
}: {
  snuttApi: SnuttApi;
}): Parameters<typeof getAuthService>[0]['authRepository'] => {
  return {
    signInWithIdPassword: (body) => snuttApi['POST /v1/auth/login_local']({ body }).then((r) => r.data),
    signInWithFacebook: async (body) => snuttApi['POST /auth/login_fb']({ body }).then((r) => r.data),
    signUpWithIdPassword: async (body) => {
      const response = await snuttApi['POST /v1/auth/register_local']({ body });
      if (response.status === 403) throw response.data;
      return response.data;
    },
    findId: async (body) => snuttApi['POST /v1/auth/id/find']({ body }).then((r) => r.data),
    passwordResetCheckEmail: async (body) =>
      snuttApi['POST /v1/auth/password/reset/email/check']({ body }).then((r) => r.data),
    sendPasswordResetVerificationEmail: async (body) =>
      snuttApi['POST /v1/auth/password/reset/email/send']({ body }).then((r) => r.data),
    verifyPasswordResetCode: async (body) =>
      snuttApi['POST /v1/auth/password/reset/verification/code']({ body }).then((r) => r.data),
    resetPassword: async (body) => snuttApi['POST /v1/auth/password/reset']({ body }).then((r) => r.data),
  };
};
