import type { HttpClient } from '@/clients/HttpClient';
import type { User } from '@/entities/user';

export interface UserRepository {
  getUserInfo(): Promise<User>;
  deleteUser(): Promise<{ message: 'ok' }>;
  changePassword(body: { old_password: string; new_password: string }): Promise<{ token: string }>;
  attachFacebookAccount(body: { fb_id: string; fb_token: string }): Promise<{ token: string }>;
  detachFacebookAccount(): Promise<{ token: string }>;
  addIdPassword(body: { id: string; password: string }): Promise<{ token: string }>;
}

export const getUserRepository = ({ httpClient }: { httpClient: HttpClient }): UserRepository => {
  return {
    getUserInfo: async () => (await httpClient.get<User>('/v1/user/info')).data,
    deleteUser: async () => (await httpClient.delete<{ message: 'ok' }>('/v1/user/account')).data,
    changePassword: async (body) => (await httpClient.put<{ token: string }>('/v1/user/password', body)).data,
    addIdPassword: async (body) => (await httpClient.post<{ token: string }>('/v1/user/password', body)).data,
    attachFacebookAccount: async (body) => (await httpClient.post<{ token: string }>('/v1/user/facebook', body)).data,
    detachFacebookAccount: async () => (await httpClient.delete<{ token: string }>('/v1/user/facebook')).data,
  };
};
