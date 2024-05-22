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
      const { status, data } = await snuttApi['POST /auth/login_fb']({
        body: {
          fb_id: body.facebookId,
          fb_token: body.facebookToken,
        },
      });
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
      const { status, data } = await snuttApi['POST /v1/auth/password/reset/email/check']({
        body: { user_id: body.userId },
      });
      if (status === 200) return { type: 'success', data };
      else return { type: 'error', errcode: data.errcode };
    },
    sendPasswordResetVerificationEmail: async (body) => {
      const { status, data } = await snuttApi['POST /v1/auth/password/reset/email/send']({
        body: { user_email: body.userEmail },
      });
      if (status === 200) return { type: 'success', data };
      else throw data;
    },
    verifyPasswordResetCode: async (body) => {
      const { status, data } = await snuttApi['POST /v1/auth/password/reset/verification/code']({
        body: { user_id: body.userId, code: body.code },
      });
      if (status === 200) return { type: 'success' };
      else return { type: 'error', errcode: data.errcode };
    },
    resetPassword: async (body) => {
      const { status, data } = await snuttApi['POST /v1/auth/password/reset']({
        body: { user_id: body.userId, password: body.password },
      });
      if (status === 200) return { type: 'success', data };
      else throw data;
    },
    deleteUser: async ({ token }) => {
      const { status, data } = await snuttApi['DELETE /v1/user/account']({ token });
      if (status === 200) return { type: 'success' };
      return { type: 'error', errcode: data.errcode };
    },
    changePassword: async ({ oldPassword, newPassword, token }) => {
      const { status, data } = await snuttApi['PUT /v1/user/password']({
        token,
        body: { old_password: oldPassword, new_password: newPassword },
      });
      if (status === 200) return { type: 'success', data };
      return { type: 'error', errcode: data.errcode };
    },
  };
};
