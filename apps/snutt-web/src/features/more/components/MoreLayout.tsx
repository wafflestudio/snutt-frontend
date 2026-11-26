import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { IconChevronRight } from '@/shared/ui/icons';
import { PanelColumn, PanelNav } from '@/shared/ui/Panel';

type MoreSubPageProps = {
  /** 제목. 패널 이름으로도 읽힌다 */
  title: string;
  /** `<`: 더보기 목록으로 */
  onBack: () => void;
  /** `×`: 패널을 접는다 */
  onClose: () => void;
  children: ReactNode;
  /** 아래에 붙는 버튼 줄 (개발자 괴롭히기의 전송) */
  footer?: ReactNode;
};

/**
 * 더보기 안의 화면 (Figma `더보기_내 계정` 등): `<` · `×`, 제목(22/Bold), 내용.
 * Figma: 패널 430, 여백 20, 묶음 사이 30. 내용이 길면 이 칸만 스크롤한다.
 */
export function MoreSubPage({ title, onBack, onClose, children, footer }: MoreSubPageProps) {
  return (
    <PanelColumn label={title} className="min-h-0">
      <PanelNav backLabel="더보기로" onBack={onBack} onClose={onClose} />
      <div className="flex min-h-0 flex-1 flex-col gap-7.5 overflow-y-auto px-5 pt-5 pb-7.5">
        <h2 className="px-1.5 text-22-bold">{title}</h2>
        {children}
      </div>
      {footer}
    </PanelColumn>
  );
}

/** 묶음 하나: 위의 작은 이름(`보안`, `SNS 계정 연동 및 해제`)과 회색 카드 */
export function MoreGroup({ label, children, note }: { label?: string; children: ReactNode; note?: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      {label && <h3 className="px-4 text-13-regular text-alternative">{label}</h3>}
      <MoreCard>{children}</MoreCard>
      {note && <p className="px-4 text-12-regular text-alternative">{note}</p>}
    </section>
  );
}

/** Figma: Background/light, 둥글기 10, 여백 14 · 20, 줄 사이 Line/light 선 */
export function MoreCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('flex flex-col rounded-[10px] bg-light px-5 py-1', className)}>{children}</div>;
}

type MoreCardRowProps = {
  label: ReactNode;
  /** 오른쪽 (값, 스위치, 버튼) */
  children?: ReactNode;
  /** 글자의 id (스위치의 aria-labelledby) */
  labelId?: string;
};

/** 카드 안 한 줄: 왼쪽 이름(Text/Plain), 오른쪽 값. 줄 사이에 선을 긋는다 */
export function MoreCardRow({ label, children, labelId }: MoreCardRowProps) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b border-line-light py-2.5 last:border-b-0">
      <span id={labelId} className="shrink-0 text-14-regular text-plain">
        {label}
      </span>
      {children}
    </div>
  );
}

/** 오른쪽 값 글자 (Text/alternative) */
export function MoreValue({ children }: { children: ReactNode }) {
  return <span className="min-w-0 truncate text-14-regular text-alternative">{children}</span>;
}

/** 카드 안 한 줄 전체가 버튼 (`비밀번호 변경 >`) */
export function MoreCardButtonRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 items-center justify-between gap-3 border-b border-line-light py-2.5 text-left text-14-regular text-plain last:border-b-0 focus-visible:outline-2 focus-visible:outline-snutt-mint"
    >
      {label}
      <IconChevronRight className="size-4 shrink-0 text-icon-normal" />
    </button>
  );
}
