'use client';

import type { ReactNode } from 'react';
import { IconButton } from '@/shared/ui/IconButton';
import { IconDockToRight } from '@/shared/ui/icons';
import { Tab, TabList, TabPanel, Tabs } from '@/shared/ui/Tabs';
import type { Semester } from '@/domain/semester';
import type { PanelView } from '@/features/main/main-view';
import { PanelColumn } from './PanelColumn';
import { SemesterSelect } from './SemesterSelect';

type ListPanelView = Extract<PanelView, { type: 'list' }>;

type MainPanelProps = {
  panel: ListPanelView;
  onChange: (panel: ListPanelView) => void;
  semesters: readonly Semester[];
  semester: Semester;
  onSemesterChange: (semester: Semester) => void;
  /** 학기 오른쪽의 패널 접기 버튼 */
  onCollapse: () => void;
  /** 검색 탭의 내용 (SearchPanel) */
  search: ReactNode;
  /** 관심강좌 탭의 내용 (BookmarkPanel) */
  bookmark: ReactNode;
};

/*
 * 아직 채우지 않은 탭은 화면 전환만 확인할 수 있는 자리다.
 *   강의 목록 7-2
 */

/** 목록 패널(검색 · 강의 목록 · 관심강좌). 옆의 강의 상세는 LectureDetailPanel, 직접 추가 폼은 CustomLectureForm 이 목록 자리를 대신한다. */
export function MainPanel({
  panel,
  onChange,
  semesters,
  semester,
  onSemesterChange,
  onCollapse,
  search,
  bookmark,
}: MainPanelProps) {
  const { tab } = panel;
  return (
    // Figma `검색 목록 영역`: 여백 위 · 양옆 20, 학기 · 탭 · 검색창 사이 20. 패널은 스크롤하지 않고 탭 안의 목록만 스크롤한다
    <PanelColumn label="강의 목록" className="min-h-0 gap-5 px-5 pt-5">
      <div className="flex items-center justify-between">
        <SemesterSelect semesters={semesters} value={semester} onValueChange={onSemesterChange} />
        {/* Figma `토글 버튼`: dock_to_right 아이콘, Text/med */}
        <IconButton label="패널 접기" icon={<IconDockToRight />} onClick={onCollapse} />
      </div>
      <Tabs
        value={tab}
        onValueChange={(next) => onChange({ type: 'list', tab: next, detail: null })}
        className="flex min-h-0 flex-1 flex-col gap-5"
      >
        <TabList>
          <Tab value="search">검색</Tab>
          <Tab value="lectures">강의 목록</Tab>
          <Tab value="bookmark">관심강좌</Tab>
        </TabList>
        <TabPanel value="search" keepMounted className="flex min-h-0 flex-1 flex-col">
          {search}
        </TabPanel>
        <TabPanel value="lectures" className="text-14-regular text-assistive">
          강의 목록 (7-2)
        </TabPanel>
        <TabPanel value="bookmark" className="flex min-h-0 flex-1 flex-col">
          {bookmark}
        </TabPanel>
      </Tabs>
    </PanelColumn>
  );
}
