export type AuthProvider = 'FACEBOOK' | 'GOOGLE' | 'KAKAO';

export interface SignInResponse {
  token: string;
  user_id: string;
}

export interface AttachAuthRequest {
  provider: AuthProvider;
  authToken: string;
}
