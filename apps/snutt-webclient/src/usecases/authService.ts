import { getErrorMessage } from '@/entities/error';
import { type RepositoryResponse, type UsecaseResponse } from '@/entities/response';
import { type UserRepository } from '@/repositories/userRepository';

export interface AuthService {
  isValidPassword(password: string): boolean;
  changePassword(body: { old_password: string; new_password: string }): Promise<{ token: string }>;
  signIn(
    params: { type: 'LOCAL'; id: string; password: string } | { type: 'FACEBOOK'; fb_id: string; fb_token: string },
  ): UsecaseResponse<{ token: string }>;
  signUp(body: { id: string; password: string }): UsecaseResponse<{ token: string }>;
  closeAccount(): Promise<{ message: 'ok' }>;
  findIdByEmail(body: { email: string }): UsecaseResponse<void>;
  passwordResetCheckEmail(body: { user_id: string }): UsecaseResponse<{ email: string }>;
  sendPasswordResetVerificationEmail(body: { user_email: string }): Promise<{ message: 'ok' }>;
  verifyPasswordResetCode(body: { user_id: string; code: string }): UsecaseResponse<void>;
  resetPassword(body: { user_id: string; password: string }): Promise<{ message: 'ok' }>;
}

type Deps = {
  authRepository: {
    signInWithIdPassword(args: { id: string; password: string }): RepositoryResponse<{ token: string }>;
    signInWithFacebook(args: { fb_id: string; fb_token: string }): RepositoryResponse<{ token: string }>;
    signUpWithIdPassword(body: { id: string; password: string }): RepositoryResponse<{ token: string }>;
    findId(body: { email: string }): RepositoryResponse<void>;
    passwordResetCheckEmail(body: { user_id: string }): RepositoryResponse<{ email: string }>;
    sendPasswordResetVerificationEmail(body: { user_email: string }): RepositoryResponse<{ message: 'ok' }>;
    verifyPasswordResetCode(body: { user_id: string; code: string }): RepositoryResponse<void>;
    resetPassword(body: { user_id: string; password: string }): RepositoryResponse<{ message: 'ok' }>;
  };
  userRepository: UserRepository;
};
export const getAuthService = ({ authRepository, userRepository }: Deps): AuthService => {
  return {
    isValidPassword: (password) =>
      password.split('').some((item) => /[0-9]+/.test(item)) &&
      password.split('').some((item) => /[a-zA-Z]+/.test(item)) &&
      password.length >= 6 &&
      password.length <= 20,
    changePassword: async (body) => userRepository.changePassword(body),
    signIn: async (params) => {
      const data = await (params.type === 'LOCAL'
        ? authRepository.signInWithIdPassword({ id: params.id, password: params.password })
        : authRepository.signInWithFacebook({ fb_id: params.fb_id, fb_token: params.fb_token }));

      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    signUp: async (params) => {
      const data = await authRepository.signUpWithIdPassword(params);
      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    closeAccount: () => userRepository.deleteUser(),
    findIdByEmail: async (body) => {
      const data = await authRepository.findId(body);
      if (data.type === 'success') return { type: 'success' };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    passwordResetCheckEmail: async (body) => {
      const data = await authRepository.passwordResetCheckEmail(body);
      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    sendPasswordResetVerificationEmail: async (body) => {
      const data = await authRepository.sendPasswordResetVerificationEmail(body);
      if (data.type === 'success') return { message: 'ok' };
      else throw data;
    },
    verifyPasswordResetCode: async (body) => {
      const data = await authRepository.verifyPasswordResetCode(body);
      if (data.type === 'success') return { type: 'success' };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    resetPassword: async (body) => {
      const data = await authRepository.resetPassword(body);
      if (data.type === 'success') return { message: 'ok' };
      else throw data;
    },
  };
};
