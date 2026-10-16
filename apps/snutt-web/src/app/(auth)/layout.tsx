import type { ReactNode } from 'react';
import { RedirectIfSignedIn } from '@/features/auth/components/AuthGuard';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <RedirectIfSignedIn>{children}</RedirectIfSignedIn>;
}
