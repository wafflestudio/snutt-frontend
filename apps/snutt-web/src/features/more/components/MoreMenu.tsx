'use client';

import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { type ReactNode, useState } from 'react';
import { useLogout } from '@/api/auth';
import { userQueries } from '@/api/users';
import { formatNicknameWithTag } from '@/domain/friend';
import type { MorePage } from '@/shared/lib/more-page';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { IconButton } from '@/shared/ui/IconButton';
import { IconChevronRight, IconDockToRight, IconPerson } from '@/shared/ui/icons';
import { PanelColumn } from '@/shared/ui/Panel';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/features/more/links';

type MoreMenuProps = {
  onNavigate: (page: MorePage) => void;
  /** 제목 오른쪽의 패널 접기 */
  onCollapse: () => void;
};

/**
 * 더보기 목록 (Figma `더보기`): 내 계정 · 알림 · 디스플레이 · 정보 및 제안 · 개발자 괴롭히기 · 로그아웃.
 * Figma: 위 여백 30, 양옆 20, 묶음 사이 15 와 Line/light 선, 묶음 이름 15/SemiBold Text/Plain,
 * 줄은 높이 40 · 여백 10 · 둥글기 10, 글자 14 Text/alternative, 커서를 올리면 Background/light.
 */
export function MoreMenu({ onNavigate, onCollapse }: MoreMenuProps) {
  const me = useQuery(userQueries.me());
  // 로그아웃하면 토큰이 지워져 RequireSignIn 이 로그인 화면으로 보낸다
  const logout = useLogout();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <PanelColumn label="더보기" className="min-h-0">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-5 pb-7.5">
        {/* 목록 패널의 학기 줄처럼 제목 오른쪽에 패널 접기 (Figma `dock_to_right`) */}
        <div className="flex items-center justify-between">
          <h2 className="text-22-bold">더보기</h2>
          <IconButton label="패널 접기" icon={<IconDockToRight className="size-4!" />} onClick={onCollapse} />
        </div>

        <div className="mt-7.5 flex flex-col">
          <MenuGroup label="내 계정">
            <MenuRow
              onClick={() => onNavigate('account')}
              icon={<IconPerson className="size-5 shrink-0 text-icon-normal" />}
            >
              {me.data ? formatNicknameWithTag(me.data) : me.isError ? '내 계정' : '불러오는 중'}
            </MenuRow>
          </MenuGroup>
          <MenuGroup label="알림">
            <MenuRow onClick={() => onNavigate('notifications')}>알림</MenuRow>
          </MenuGroup>
          <MenuGroup label="디스플레이">
            <MenuRow onClick={() => onNavigate('color-mode')}>색상 모드</MenuRow>
            <MenuRow onClick={() => onNavigate('timetable-settings')}>시간표 설정</MenuRow>
          </MenuGroup>
          <MenuGroup label="정보 및 제안">
            {/* 화면이 없다 (디자인 문의 4-32) */}
            <MenuRow disabled>개발자 정보</MenuRow>
            <MenuRow href={TERMS_OF_SERVICE_URL}>서비스 약관</MenuRow>
            <MenuRow href={PRIVACY_POLICY_URL}>개인정보처리방침</MenuRow>
          </MenuGroup>
          <MenuGroup>
            <MenuRow onClick={() => onNavigate('feedback')} emphasis>
              개발자 괴롭히기
            </MenuRow>
          </MenuGroup>
          <div className="pt-3.75">
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="rounded-sm text-15-medium text-snutt-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Figma `alert`: `로그아웃 하시겠습니까?` 취소 · 확인 */}
      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        message="로그아웃 하시겠습니까?"
        onConfirm={() => void logout()}
      />
    </PanelColumn>
  );
}

function MenuGroup({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.25 border-b border-line-light py-3.75 first:pt-0">
      {label && <h3 className="text-15-semibold text-plain">{label}</h3>}
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

type MenuRowProps = {
  children: ReactNode;
  icon?: ReactNode;
  /** 더보기 안의 화면으로 */
  onClick?: () => void;
  /** 새 탭으로 여는 바깥 페이지 */
  href?: string;
  /** 아직 화면이 없다 */
  disabled?: boolean;
  /** 묶음 이름 없이 혼자 있는 줄 (`개발자 괴롭히기`): 글자가 묶음 이름처럼 15/SemiBold */
  emphasis?: boolean;
};

function MenuRow({ children, icon, onClick, href, disabled, emphasis }: MenuRowProps) {
  const className = clsx(
    'flex h-10 w-full items-center justify-between gap-2.5 rounded-[10px] text-left',
    emphasis ? 'text-15-semibold text-plain' : 'px-2.5 text-14-regular text-alternative',
    disabled
      ? 'cursor-not-allowed opacity-40'
      : 'hover:bg-light focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-snutt-mint',
  );
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-2.5">
        {icon}
        <span className="truncate">{children}</span>
      </span>
      <IconChevronRight className="size-4 shrink-0 text-icon-normal" />
    </>
  );

  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? '준비 중' : undefined}
      className={className}
    >
      {content}
    </button>
  );
}
