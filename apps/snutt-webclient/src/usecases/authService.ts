import { getErrorMessage } from '@/entities/error';
import { type RepositoryResponse, type UsecaseResponse } from '@/entities/response';

export interface AuthService {
  isValidPassword(password: string): boolean;
  changePassword(body: { oldPassword: string; newPassword: string; token: string }): UsecaseResponse<{ token: string }>;
  signIn(
    params:
      | { type: 'LOCAL'; id: string; password: string }
      | { type: 'FACEBOOK'; facebookId: string; facebookToken: string },
  ): UsecaseResponse<{ token: string }>;
  signUp(body: { id: string; password: string }): UsecaseResponse<{ token: string }>;
  closeAccount(_: { token: string }): UsecaseResponse<void>;
  findIdByEmail(body: { email: string }): UsecaseResponse<void>;
  passwordResetCheckEmail(body: { userId: string }): UsecaseResponse<{ email: string }>;
  sendPasswordResetVerificationEmail(body: { userEmail: string }): Promise<{ message: 'ok' }>;
  verifyPasswordResetCode(body: { userId: string; code: string }): UsecaseResponse<void>;
  resetPassword(body: { userId: string; password: string }): Promise<{ message: 'ok' }>;
}

export const getAuthService = ({
  authRepository,
}: {
  authRepository: {
    signInWithIdPassword(args: { id: string; password: string }): RepositoryResponse<{ token: string }>;
    signInWithFacebook(args: { facebookId: string; facebookToken: string }): RepositoryResponse<{ token: string }>;
    signUpWithIdPassword(body: { id: string; password: string }): RepositoryResponse<{ token: string }>;
    findId(body: { email: string }): RepositoryResponse<void>;
    passwordResetCheckEmail(body: { userId: string }): RepositoryResponse<{ email: string }>;
    sendPasswordResetVerificationEmail(body: { userEmail: string }): RepositoryResponse<{ message: 'ok' }>;
    verifyPasswordResetCode(body: { userId: string; code: string }): RepositoryResponse<void>;
    resetPassword(body: { userId: string; password: string }): RepositoryResponse<{ message: 'ok' }>;
    deleteUser(_: { token: string }): RepositoryResponse<void>;
    changePassword(body: {
      oldPassword: string;
      newPassword: string;
      token: string;
    }): RepositoryResponse<{ token: string }>;
  };
}): AuthService => {
  return {
    isValidPassword: (password) =>
      password.split('').some((item) => /[0-9]+/.test(item)) &&
      password.split('').some((item) => /[a-zA-Z]+/.test(item)) &&
      password.length >= 6 &&
      password.length <= 20,
    changePassword: async (body) => {
      const data = await authRepository.changePassword(body);
      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    signIn: async (params) => {
      const data = await (params.type === 'LOCAL'
        ? authRepository.signInWithIdPassword({ id: params.id, password: params.password })
        : authRepository.signInWithFacebook({ facebookId: params.facebookId, facebookToken: params.facebookToken }));

      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    signUp: async (params) => {
      const data = await authRepository.signUpWithIdPassword(params);
      if (data.type === 'success') return { type: 'success', data: data.data };
      else return { type: 'error', message: getErrorMessage(data) };
    },
    closeAccount: async ({ token }) => {
      const data = await authRepository.deleteUser({ token });
      if (data.type === 'success') return { type: 'success' };
      else return { type: 'error', message: getErrorMessage(data) };
    },
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
