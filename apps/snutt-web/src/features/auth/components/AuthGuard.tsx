'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { useSignedIn } from '@/api/auth';
import { getLoginPath, getNextPath } from '@/features/auth/redirect';

// 토큰이 브라우저(localStorage)에만 있어서 서버는 로그인 여부를 모른다. 브라우저에서 토큰을 읽은 뒤에 화면을 정한다.
// 읽기 전(서버 렌더링, 첫 hydration)에는 아무것도 그리지 않아 다른 화면이 잠깐 보이지 않게 한다.

/** 로그인해야 볼 수 있는 화면. 로그인하지 않았거나 로그인이 만료되면 로그인 화면으로 보낸다 */
export function RequireSignIn({ children }: { children: ReactNode }) {
  const signedIn = useSignedIn();
  const router = useRouter();

  useEffect(() => {
    if (signedIn === false) router.replace(getLoginPath(window.location.pathname + window.location.search));
  }, [signedIn, router]);

  return signedIn ? children : null;
}

/** 로그인 · 회원가입 화면. 이미 로그인했으면(로그인에 성공한 직후 포함) 돌아갈 곳으로 보낸다 */
export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const signedIn = useSignedIn();
  const router = useRouter();

  useEffect(() => {
    if (signedIn) router.replace(getNextPath(window.location.search));
  }, [signedIn, router]);

  return signedIn === false ? children : null;
}
