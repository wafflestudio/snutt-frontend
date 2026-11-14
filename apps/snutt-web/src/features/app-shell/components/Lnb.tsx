'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';
import { useLogout } from '@/api/auth';
import { useTheme } from '@/shared/lib/use-theme';
import {
  IconDarkMode,
  IconLightMode,
  IconTabFriend,
  IconTabMore,
  IconTabReview,
  IconTabSearch,
} from '@/shared/ui/icons';
import { Menu, MenuItem } from '@/shared/ui/Menu';
import { SnuttLogo } from '@/shared/ui/SnuttLogo';

type NavItem = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** null 이면 아직 화면이 없다. 'menu' 는 누르면 동작 목록을 연다 */
  href: string | null | 'menu';
};

const NAV_ITEMS: NavItem[] = [
  { label: '검색', icon: IconTabSearch, href: '/' },
  // 어떤 화면이 열리는지 디자인 확인 중 (디자이너 문의 4-3)
  { label: '강의평', icon: IconTabReview, href: null },
  { label: '친구 시간표', icon: IconTabFriend, href: '/friends' },
  // 지금은 로그아웃만 있다. 마이페이지 · 알림 등은 Phase 9 (디자인 문의 4-12)
  { label: '더보기', icon: IconTabMore, href: 'menu' },
];

const isActive = (href: string, pathname: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

/** 좌측 바 (Figma `LNB`). 위에서부터 로고, 화면 이동, 맨 아래 테마 전환. */
export function Lnb() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  // 로그아웃하면 토큰이 지워져 RequireSignIn 이 로그인 화면으로 보낸다
  const logout = useLogout();

  return (
    <nav
      aria-label="주 메뉴"
      className="flex w-20 shrink-0 flex-col items-center border-r border-line-light bg-light-field py-5"
    >
      <Link href="/" aria-label="SNUTT 홈">
        <SnuttLogo className="size-6" />
      </Link>

      <ul className="mt-10 flex flex-col gap-7.5">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = href !== null && href !== 'menu' && isActive(href, pathname);
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
              {href === 'menu' ? (
                <Menu
                  trigger={
                    <button type="button" className={clsx(className, 'outline-none focus-visible:text-normal')}>
                      {content}
                    </button>
                  }
                >
                  <MenuItem onClick={() => void logout()}>로그아웃</MenuItem>
                </Menu>
              ) : href === null ? (
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
        // Figma `Theme Toggle`: 40px, 둥글기 10, 테두리 Line/border, 배경 Line/lightField, 아이콘 Icon/nomal (11-09)
        className="mt-auto flex size-10 items-center justify-center rounded-[10px] border border-line-border bg-line-light-field text-icon-normal hover:text-icon-on-item focus-visible:outline-2 focus-visible:outline-snutt-mint"
      >
        {theme === 'dark' ? <IconDarkMode className="size-6" /> : <IconLightMode className="size-6" />}
      </button>
    </nav>
  );
}
