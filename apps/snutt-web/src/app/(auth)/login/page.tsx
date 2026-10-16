import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = { title: '로그인 | SNUTT' };

export default function LoginPage() {
  return <LoginForm />;
}
