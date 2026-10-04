import type { ReactNode } from 'react';
import { AppShell } from '@/features/app-shell/components/AppShell';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
