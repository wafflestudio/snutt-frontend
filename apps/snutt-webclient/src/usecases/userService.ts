import { type User } from '@/entities/user';
import { type UserRepository } from '@/repositories/userRepository';

export interface UserService {
  getUserInfo(): Promise<User>;
  addIdPassword(body: { id: string; password: string }): Promise<{ token: string }>;
  attachFacebookAccount(body: { fb_id: string; fb_token: string }): Promise<{ token: string }>;
  detachFacebookAccount(): Promise<{ token: string }>;
  isFbOnlyUser(user: User): boolean;
}

type Deps = { repositories: [UserRepository] };
export const getUserService = ({ repositories: [userRepository] }: Deps): UserService => {
  return {
    getUserInfo: () => userRepository.getUserInfo(),
    addIdPassword: (body) => userRepository.addIdPassword(body),
    attachFacebookAccount: (body: { fb_id: string; fb_token: string }) => userRepository.attachFacebookAccount(body),
    detachFacebookAccount: () => userRepository.detachFacebookAccount(),
    isFbOnlyUser: (user) => !!user.fb_name && !user.local_id,
  };
};
