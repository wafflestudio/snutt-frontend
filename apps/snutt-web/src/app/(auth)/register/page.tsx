import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = { title: '회원가입 | SNUTT' };

export default function RegisterPage() {
  // RegisterForm 이 useSearchParams 를 써서 Suspense 가 필요하다
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
