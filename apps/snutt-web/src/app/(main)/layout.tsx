import type { ReactNode } from 'react';
import { AppShell } from '@/features/app-shell/components/AppShell';
import { RequireSignIn } from '@/features/auth/components/AuthGuard';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <RequireSignIn>
      <AppShell>{children}</AppShell>
    </RequireSignIn>
  );
}
