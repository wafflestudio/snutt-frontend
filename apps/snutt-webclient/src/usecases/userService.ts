import { type UserAuthProviderInfo } from '@sf/snutt-api/src/apis/snutt/schemas';

import { getErrorMessage } from '@/entities/error';
import { type RepositoryResponse, type UsecaseResponse } from '@/entities/response';
import { type User } from '@/entities/user';

export interface UserService {
  getUserInfo(_: { token: string }): UsecaseResponse<User>;
  getMyAuthProviders(_: { token: string }): UsecaseResponse<UserAuthProviderInfo>;
  addIdPassword(body: { id: string; password: string; token: string }): UsecaseResponse<{ token: string }>;
  attachFacebookAccount(body: {
    facebookId: string;
    facebookToken: string;
    token: string;
  }): UsecaseResponse<{ token: string }>;
  detachFacebookAccount(_: { token: string }): UsecaseResponse<{ token: string }>;
  isFbOnlyUser(user: User): boolean;
  // isProviderAvailable()
}

export const getUserService = ({
  userRepository,
}: {
  userRepository: {
    getUserInfo(_: { token: string }): RepositoryResponse<User>;
    getMyAuthProviders(_: { token: string }): RepositoryResponse<UserAuthProviderInfo>;
    attachFacebookAccount(body: {
      facebookId: string;
      facebookToken: string;
      token: string;
    }): RepositoryResponse<{ token: string }>;
    detachFacebookAccount(_: { token: string }): RepositoryResponse<{ token: string }>;
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
    attachFacebookAccount: async (body) => {
      const data = await userRepository.attachFacebookAccount(body);
      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    detachFacebookAccount: async ({ token }) => {
      const data = await userRepository.detachFacebookAccount({ token });
      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    getMyAuthProviders: async ({ token }) => {
      const data = await userRepository.getMyAuthProviders({ token });
      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    isFbOnlyUser: (user) => !!user.facebookName && !user.localId,
  };
};
