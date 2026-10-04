import type { ReactNode } from 'react';
import { Lnb } from '@/features/app-shell/components/Lnb';

/**
 * 로그인 후 화면의 틀: 좌측 바 + 내용. 데스크톱 전용이라 최소 너비 1200px 아래에서는 가로 스크롤한다.
 * (docs/snutt-web-dev-plan.md 설계 포인트 4)
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen min-w-300">
      <Lnb />
      <div className="flex min-w-0 flex-1">{children}</div>
    </div>
  );
}
