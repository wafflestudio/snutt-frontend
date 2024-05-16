import { type HttpClient } from '@/clients/HttpClient';
import type { SignInResponse } from '@/entities/auth';

export interface AuthRepository {
  signInWithIdPassword(args: { id: string; password: string }): Promise<SignInResponse>;
  signInWithFacebook(args: { fb_id: string; fb_token: string }): Promise<SignInResponse>;
  signUpWithIdPassword(body: {
    id: string;
    password: string;
  }): Promise<{ message: 'ok'; token: string; user_id: string }>;
  findId(body: { email: string }): Promise<{ message: 'ok' }>;
  passwordResetCheckEmail(body: { user_id: string }): Promise<{ email: string }>;
  sendPasswordResetVerificationEmail(body: { user_email: string }): Promise<{ message: 'ok' }>;
  verifyPasswordResetCode(body: { user_id: string; code: string }): Promise<{ message: 'ok' }>;
  resetPassword(body: { user_id: string; password: string }): Promise<{ message: 'ok' }>;
}

export const getAuthRepository = ({ httpClient }: { httpClient: HttpClient }): AuthRepository => {
  return {
    signInWithIdPassword: async (body) => (await httpClient.post<SignInResponse>(`/v1/auth/login_local`, body)).data,
    signInWithFacebook: async (body) => (await httpClient.post<SignInResponse>(`/auth/login_fb`, body)).data,
    signUpWithIdPassword: async (body) =>
      (await httpClient.post<{ message: 'ok'; token: string; user_id: string }>(`/v1/auth/register_local`, body)).data,
    findId: async (body) => (await httpClient.post<{ message: 'ok' }>(`/v1/auth/id/find`, body)).data,
    passwordResetCheckEmail: async (body) =>
      (await httpClient.post<{ email: string }>(`/v1/auth/password/reset/email/check`, body)).data,
    sendPasswordResetVerificationEmail: async (body) =>
      (await httpClient.post<{ message: 'ok' }>(`/v1/auth/password/reset/email/send`, body)).data,
    verifyPasswordResetCode: async (body) =>
      (await httpClient.post<{ message: 'ok' }>(`/v1/auth/password/reset/verification/code`, body)).data,
    resetPassword: async (body) => (await httpClient.post<{ message: 'ok' }>(`/v1/auth/password/reset`, body)).data,
  };
};
