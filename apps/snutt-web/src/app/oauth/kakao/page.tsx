import type { Metadata } from 'next';
import { Suspense } from 'react';
import { KakaoCallback } from '@/features/auth/components/KakaoCallback';

export const metadata: Metadata = { title: '카카오 로그인 | SNUTT' };

/**
 * 카카오 Redirect URI. 로그인과 연동(로그인한 상태)에 함께 쓰므로 (auth) · (main) 레이아웃 밖에 둔다.
 * 카카오 콘솔에 `<origin>/oauth/kakao` 로 등록한다 (끝에 / 없이)
 */
export default function KakaoCallbackPage() {
  // KakaoCallback 이 useSearchParams 를 써서 Suspense 가 필요하다
  return (
    <Suspense>
      <KakaoCallback />
    </Suspense>
  );
}
