'use client';

import type { TimetableId, TimetableSummary } from '@/domain/timetable';
import { IconCheckCircleFill } from '@/shared/ui/icons';
import { Tab, TabList, Tabs } from '@/shared/ui/Tabs';

type TimetableTabsProps = {
  timetables: readonly TimetableSummary[];
  selectedId: TimetableId;
  onSelect: (id: TimetableId) => void;
  /** 탭 묶음의 이름. 시간표 비교에서는 두 묶음을 구별한다 */
  label: string;
};

/**
 * 헤더의 시간표 탭 (Figma: 기본 시간표는 민트 체크, 고른 탭에만 학점).
 * 탭이 많으면 가로로 스크롤한다.
 */
export function TimetableTabs({ timetables, selectedId, onSelect, label }: TimetableTabsProps) {
  return (
    <Tabs
      value={selectedId}
      onValueChange={onSelect}
      variant="pill"
      className="min-w-0 [scrollbar-width:none] overflow-x-auto"
    >
      <TabList aria-label={label}>
        {timetables.map(({ id, title, isPrimary, totalCredit }) => (
          <Tab key={id} value={id}>
            {isPrimary && <IconCheckCircleFill className="size-3.75 text-snutt-mint" />}
            {title}
            {isPrimary && <span className="sr-only">, 기본 시간표</span>}
            {id === selectedId && <span className="text-14-regular text-med">({totalCredit}학점)</span>}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
}
