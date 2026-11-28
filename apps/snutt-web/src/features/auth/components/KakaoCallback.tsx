'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSocialLogin } from '@/api/auth';
import { getFailureMessage } from '@/api/errors';
import { useLinkSocial } from '@/api/users';
import { getLoginPath, getNextPath } from '@/features/auth/redirect';
import {
  exchangeKakaoCode,
  type KakaoAuthRequest,
  SocialAuthError,
  takeKakaoAuthRequest,
} from '@/shared/lib/social-auth';
import { AuthPage, FormError } from './AuthPage';

/** 시작할 때 정한 돌아갈 곳. 이 사이트 안의 경로만 받는다 */
const toSafePath = (path: string) => getNextPath(`?${new URLSearchParams({ next: path })}`);

/** 실패하거나 취소했을 때 돌아갈 곳: 로그인이면 로그인 화면, 연동이면 시작한 화면 */
const getBackPath = (request: KakaoAuthRequest | null) => {
  if (!request) return '/login';
  const next = toSafePath(request.next);
  return request.purpose === 'login' ? getLoginPath(next) : next;
};

/**
 * 카카오 Redirect URI(`/oauth/kakao`). 카카오가 붙여 준 인가 코드를 토큰으로 바꾸고,
 * 시작할 때 정한 대로 로그인하거나 지금 계정에 연동한 뒤 돌아간다 (shared/lib/social-auth)
 */
export function KakaoCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { mutateAsync: login } = useSocialLogin();
  const { mutateAsync: link } = useLinkSocial();
  const [failure, setFailure] = useState<{ message: string; back: string } | null>(null);
  // 저장한 요청은 한 번만 꺼낼 수 있다. 개발 모드(StrictMode)에서 effect 가 두 번 불려도 한 번만 처리한다
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const request = takeKakaoAuthRequest(searchParams.get('state'));
    const code = searchParams.get('code');
    void (async () => {
      try {
        if (!request) throw new SocialAuthError('잘못된 요청입니다. 처음부터 다시 시도해 주세요');
        // 동의 화면에서 취소하면 code 없이 error=access_denied 로 돌아온다
        if (!code) return router.replace(getBackPath(request));
        const token = await exchangeKakaoCode(code);
        if (request.purpose === 'login') await login({ provider: 'kakao', token });
        else await link({ provider: 'kakao', token });
        router.replace(toSafePath(request.next));
      } catch (error) {
        setFailure({
          message: error instanceof SocialAuthError ? error.message : getFailureMessage(error as Error),
          back: getBackPath(request),
        });
      }
    })();
  }, [searchParams, router, login, link]);

  return (
    <AuthPage title="카카오 로그인">
      {failure ? (
        <div className="flex flex-col items-center gap-4">
          <FormError>{failure.message}</FormError>
          <Link href={failure.back} className="text-13-regular text-plain underline">
            돌아가기
          </Link>
        </div>
      ) : (
        <p className="text-center text-14-regular text-alternative">카카오 계정을 확인하고 있습니다</p>
      )}
    </AuthPage>
  );
}
