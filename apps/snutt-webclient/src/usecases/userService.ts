import { type UserAuthProviderInfo } from '@sf/snutt-api/src/apis/snutt/schemas';

import { type AuthProvider } from '@/entities/auth';
import { getErrorMessage } from '@/entities/error';
import { type RepositoryResponse, type UsecaseResponse } from '@/entities/response';
import { type User } from '@/entities/user';

export interface UserService {
  getUserInfo(_: { token: string }): UsecaseResponse<User>;
  getMyAuthProviders(_: { token: string }): UsecaseResponse<UserAuthProviderInfo>;
  addIdPassword(body: { id: string; password: string; token: string }): UsecaseResponse<{ token: string }>;
  attachAuth(body: { provider: AuthProvider; authToken: string; token: string }): UsecaseResponse<{ token: string }>;
  detachAuth(body: { provider: AuthProvider; token: string }): UsecaseResponse<{ token: string }>;
}

export const getUserService = ({
  userRepository,
}: {
  userRepository: {
    getUserInfo(_: { token: string }): RepositoryResponse<User>;
    getMyAuthProviders(_: { token: string }): RepositoryResponse<UserAuthProviderInfo>;
    attachFacebook(body: { authToken: string; token: string }): RepositoryResponse<{ token: string }>;
    attachGoogle(body: { authToken: string; token: string }): RepositoryResponse<{ token: string }>;
    attachKakao(body: { authToken: string; token: string }): RepositoryResponse<{ token: string }>;
    detachFacebook(body: { token: string }): RepositoryResponse<{ token: string }>;
    detachGoogle(body: { token: string }): RepositoryResponse<{ token: string }>;
    detachKakao(body: { token: string }): RepositoryResponse<{ token: string }>;
    addIdPassword(body: { id: string; password: string; token: string }): RepositoryResponse<{ token: string }>;
  };
}): UserService => {
  return {
    getUserInfo: async ({ token }) => {
      const data = await userRepository.getUserInfo({ token });
      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    addIdPassword: async (body) => {
      const data = await userRepository.addIdPassword(body);
      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    attachAuth: async (body) => {
      let data = null;
      switch (body.provider) {
        case 'FACEBOOK':
          data = await userRepository.attachFacebook(body);
          break;
        case 'GOOGLE':
          data = await userRepository.attachGoogle(body);
          break;
        case 'KAKAO':
          data = await userRepository.attachKakao(body);
          break;
      }

      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    detachAuth: async (body) => {
      let data = null;
      switch (body.provider) {
        case 'FACEBOOK':
          data = await userRepository.detachFacebook(body);
          break;
        case 'GOOGLE':
          data = await userRepository.detachGoogle(body);
          break;
        case 'KAKAO':
          data = await userRepository.detachKakao(body);
          break;
      }

      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    getMyAuthProviders: async ({ token }) => {
      const data = await userRepository.getMyAuthProviders({ token });
      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
  };
};
