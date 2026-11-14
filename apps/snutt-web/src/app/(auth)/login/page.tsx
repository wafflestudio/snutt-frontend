import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = { title: '로그인 | SNUTT' };

export default function LoginPage() {
  // LoginForm 이 useSearchParams 를 써서 Suspense 가 필요하다
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
