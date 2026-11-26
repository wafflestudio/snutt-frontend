/** 로그인 방법. LOCAL 은 아이디 · 비밀번호 */
export type AuthProvider = 'local' | 'kakao' | 'google' | 'apple' | 'facebook';

/** 내 계정 화면의 SNS 연동 목록 순서 (Figma `더보기_내 계정`) */
export const SOCIAL_PROVIDERS = ['kakao', 'google', 'apple', 'facebook'] as const satisfies readonly AuthProvider[];

export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export const SOCIAL_PROVIDER_LABELS: Record<SocialProvider, string> = {
  kakao: '카카오 계정',
  google: '구글 계정',
  apple: '애플 계정',
  facebook: '페이스북 계정',
};

export type User = {
  /** 서버가 정한 닉네임과 네 자리 태그. `닉네임#0000` 으로 보여 준다 */
  nickname: string;
  nicknameTag: string;
  /** 없으면 null */
  email: string | null;
  isEmailVerified: boolean;
  /** 연결된 로그인 방법 */
  providers: AuthProvider[];
};

/** 아이디 · 비밀번호로 로그인할 수 있는지 (비밀번호 변경을 보여 줄지) */
export const hasLocalAccount = (user: Pick<User, 'providers'>) => user.providers.includes('local');

/** 서버 규칙(`invalid-password`): 영문과 숫자를 모두 포함한 6~20자 */
export const isValidPassword = (password: string) =>
  password.length >= 6 && password.length <= 20 && /[A-Za-z]/.test(password) && /\d/.test(password);
