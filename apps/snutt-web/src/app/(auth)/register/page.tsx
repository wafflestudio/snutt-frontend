import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = { title: '회원가입 | SNUTT' };

export default function RegisterPage() {
  return <RegisterForm />;
}
