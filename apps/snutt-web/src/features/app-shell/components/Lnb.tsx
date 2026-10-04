'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';
import { useTheme } from '@/shared/lib/use-theme';
import {
  IconDarkMode,
  IconGroupFill,
  IconLightMode,
  IconMoreHorizontal,
  IconReviewFill,
  IconSearch,
} from '@/shared/ui/icons';
import { SnuttLogo } from '@/shared/ui/SnuttLogo';

type NavItem = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** null 이면 아직 화면이 없다 */
  href: string | null;
};

const NAV_ITEMS: NavItem[] = [
  { label: '검색', icon: IconSearch, href: '/' },
  // 어떤 화면이 열리는지 디자인 확인 중 (디자이너 문의 4-3)
  { label: '강의평', icon: IconReviewFill, href: null },
  { label: '친구 시간표', icon: IconGroupFill, href: '/friends' },
  // 마이페이지 · 알림 등 (Phase 9)
  { label: '더보기', icon: IconMoreHorizontal, href: null },
];

const isActive = (href: string, pathname: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

/** 좌측 바 (Figma `LNB`). 위에서부터 로고, 화면 이동, 맨 아래 테마 전환. */
export function Lnb() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <nav
      aria-label="주 메뉴"
      className="flex w-20 shrink-0 flex-col items-center border-r border-line-light bg-light-field py-5"
    >
      <Link href="/" aria-label="SNUTT 홈">
        <SnuttLogo className="size-7" />
      </Link>

      <ul className="mt-10 flex flex-col gap-7.5">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = href !== null && isActive(href, pathname);
          const className = clsx(
            'flex w-15.5 flex-col items-center gap-0.5 text-14-semibold',
            active ? 'text-normal' : 'text-assistive',
          );
          const content = (
            <>
              <Icon className="size-7.5" />
              {label}
            </>
          );
          return (
            <li key={label}>
              {href === null ? (
                <span aria-disabled className={clsx(className, 'cursor-not-allowed')} title="준비 중">
                  {content}
                </span>
              ) : (
                <Link href={href} aria-current={active ? 'page' : undefined} className={className}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {/* 서버 렌더링 중에는 테마를 몰라서(theme === null) 해 아이콘을 보여 준다 */}
      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
        className="mt-auto flex size-10 items-center justify-center rounded-md text-assistive hover:bg-light focus-visible:outline-2 focus-visible:outline-snutt-mint"
      >
        {theme === 'dark' ? <IconDarkMode className="size-6" /> : <IconLightMode className="size-6" />}
      </button>
    </nav>
  );
}
