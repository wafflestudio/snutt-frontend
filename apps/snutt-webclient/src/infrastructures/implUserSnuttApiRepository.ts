import { type SnuttApi } from '@sf/snutt-api';

import { type getUserService } from '@/usecases/userService';

export const implUserSnuttApiRepository = ({
  snuttApi,
}: {
  snuttApi: SnuttApi;
}): Parameters<typeof getUserService>[0]['userRepository'] => {
  return {
    getUserInfo: async ({ token }) => {
      const { status, data } = await snuttApi['GET /v1/user/info']({ token });
      if (status === 200)
        return {
          type: 'success',
          data: {
            email: data.email ?? null,
            facebookName: data.fb_name ?? null,
            isAdmin: data.isAdmin,
            localId: data.local_id ?? null,
            notificationCheckedAt: data.notificationCheckedAt,
            regDate: data.regDate,
          },
        };
      return { type: 'error', errcode: data.errcode, displayMessage: data.displayMessage };
    },
    getMyAuthProviders: async ({ token }) => {
      const { status, data } = await snuttApi['GET /v1/users/me/auth-providers']({ token });
      if (status === 200)
        return {
          type: 'success',
          data,
        };
      return { type: 'error', errcode: data.errcode, displayMessage: data.displayMessage };
    },
    addIdPassword: async ({ id, password, token }) => {
      const { status, data } = await snuttApi['POST /v1/user/password']({ body: { id, password }, token });
      if (status === 200) return { type: 'success', data };
      return { type: 'error', errcode: data.errcode, displayMessage: data.displayMessage };
    },
    attachFacebook: async ({ authToken, token }) => {
      const { status, data } = await snuttApi['POST /v1/user/facebook']({
        body: { token: authToken },
        token,
      });
      if (status === 200) return { type: 'success', data };
      return { type: 'error', errcode: data.errcode, displayMessage: data.displayMessage };
    },
    attachGoogle: async ({ authToken, token }) => {
      const { status, data } = await snuttApi['POST /v1/user/google']({
        body: { token: authToken },
        token,
      });
      if (status === 200) return { type: 'success', data };
      return { type: 'error', errcode: data.errcode, displayMessage: data.displayMessage };
    },
    attachKakao: async ({ authToken, token }) => {
      const { status, data } = await snuttApi['POST /v1/user/kakao']({
        body: { token: authToken },
        token,
      });
      if (status === 200) return { type: 'success', data };
      return { type: 'error', errcode: data.errcode, displayMessage: data.displayMessage };
    },
    detachFacebook: async ({ token }) => {
      const { status, data } = await snuttApi['DELETE /v1/user/facebook']({
        token,
      });
      if (status === 200) return { type: 'success', data };
      return { type: 'error', errcode: data.errcode, displayMessage: data.displayMessage };
    },
    detachGoogle: async ({ token }) => {
      const { status, data } = await snuttApi['DELETE /v1/user/google']({
        token,
      });
      if (status === 200) return { type: 'success', data };
      return { type: 'error', errcode: data.errcode, displayMessage: data.displayMessage };
    },
    detachKakao: async ({ token }) => {
      const { status, data } = await snuttApi['DELETE /v1/user/kakao']({
        token,
      });
      if (status === 200) return { type: 'success', data };
      return { type: 'error', errcode: data.errcode, displayMessage: data.displayMessage };
    },
  };
};
