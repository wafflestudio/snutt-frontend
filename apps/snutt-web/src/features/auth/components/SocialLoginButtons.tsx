'use client';

import { useState } from 'react';
import { useSocialLogin } from '@/api/auth';
import { getFailureMessage } from '@/api/errors';
import {
  getPopupAccessToken,
  SOCIAL_LOGIN_PROVIDERS,
  SocialAuthCancelled,
  SocialAuthError,
  type SocialLoginProvider,
  startKakaoAuth,
} from '@/shared/lib/social-auth';
import { Button } from '@/shared/ui/Button';
import { FormError } from './AuthPage';

const LABELS: Record<SocialLoginProvider, string> = {
  kakao: '카카오로 로그인',
  google: '구글로 로그인',
  facebook: '페이스북으로 로그인',
};

/**
 * 소셜 로그인 버튼. 구글 · 페이스북은 팝업에서 토큰을 받아 바로 로그인하고(그 뒤는 RedirectIfSignedIn 이 보낸다),
 * 카카오는 카카오 화면에 다녀와 `/oauth/kakao` 가 로그인한 뒤 next 로 보낸다.
 * 신규 Figma 에 버튼 디자인이 없어 임시 모양이다 (디자인 문의 4-12)
 */
export function SocialLoginButtons({ next }: { next: string }) {
  const login = useSocialLogin();
  const [pending, setPending] = useState<SocialLoginProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async (provider: SocialLoginProvider) => {
    setError(null);
    login.reset();
    setPending(provider);
    try {
      // 카카오는 페이지를 떠나므로 버튼을 막아 둔 채로 둔다
      if (provider === 'kakao') return startKakaoAuth({ purpose: 'login', next });
      const token = await getPopupAccessToken(provider);
      await login.mutateAsync({ provider, token });
      setPending(null);
    } catch (failure) {
      setPending(null);
      if (failure instanceof SocialAuthCancelled) return;
      setError(failure instanceof SocialAuthError ? failure.message : getFailureMessage(failure as Error));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {SOCIAL_LOGIN_PROVIDERS.map((provider) => (
        <Button
          key={provider}
          variant="outline"
          className="w-full"
          disabled={pending !== null}
          onClick={() => void start(provider)}
        >
          {LABELS[provider]}
        </Button>
      ))}
      {error && <FormError>{error}</FormError>}
    </div>
  );
}
