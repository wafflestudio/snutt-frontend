'use client';

import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { type ComponentType, type SVGProps, Suspense } from 'react';
import { useTheme } from '@/shared/lib/use-theme';
import {
  IconDarkMode,
  IconLightMode,
  IconTabFriend,
  IconTabMore,
  IconTabReview,
  IconTabSearch,
} from '@/shared/ui/icons';
import { SnuttLogo } from '@/shared/ui/SnuttLogo';

type NavItem = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** null 이면 아직 화면이 없다 */
  href: string | null;
};

const MORE_HREF = '/?panel=more';

const NAV_ITEMS: NavItem[] = [
  { label: '검색', icon: IconTabSearch, href: '/' },
  // 강의평 탭 (8-6, 디자인 문의 4-30)
  { label: '강의평', icon: IconTabReview, href: '/reviews' },
  { label: '친구 시간표', icon: IconTabFriend, href: '/friends' },
  // 메인 화면의 목록 패널 자리에 더보기 패널을 연다 (Figma `더보기` 섹션, MainView 의 panel=more)
  { label: '더보기', icon: IconTabMore, href: MORE_HREF },
];

/**
 * 더보기는 메인 화면(`/`)의 패널이라 주소가 같고 search params 의 `panel` 로 가른다.
 * 패널을 접으면(`panel=closed`, MainView 의 panel 이 null) 검색도 더보기도 고르지 않는다.
 */
const isActive = (href: string, pathname: string, panel: string | null) => {
  if (href === MORE_HREF) return pathname === '/' && panel === 'more';
  if (href === '/') return pathname === '/' && panel !== 'more' && panel !== 'closed';
  return pathname.startsWith(href);
};

/** 좌측 바 (Figma `LNB`). 위에서부터 로고, 화면 이동, 맨 아래 테마 전환. */
export function Lnb() {
  const { theme, setTheme } = useTheme();

  return (
    <nav
      aria-label="주 메뉴"
      className="flex w-20 shrink-0 flex-col items-center border-r border-line-light bg-light-field py-5"
    >
      <Link href="/" aria-label="SNUTT 홈">
        <SnuttLogo className="size-6" />
      </Link>

      {/* search params 를 읽는 부분만 Suspense 로 감싼다. 정적 내보내기에서는 패널 상태를 모른 채(검색) 먼저 그려진다 */}
      <Suspense fallback={<NavList panel={null} />}>
        <NavListWithParams />
      </Suspense>

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

function NavListWithParams() {
  return <NavList panel={useSearchParams().get('panel')} />;
}

/** 화면 이동 목록. panel: 메인 화면 URL 의 `panel` 값 (closed · more · custom, 없으면 null) */
function NavList({ panel }: { panel: string | null }) {
  const pathname = usePathname();
  return (
    <ul className="mt-10 flex flex-col gap-7.5">
      {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
        const active = href !== null && isActive(href, pathname, panel);
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
  );
}
