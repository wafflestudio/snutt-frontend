'use client';

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
};

/*
 * 각 탭의 내용은 해당 단위에서 채운다. 지금은 화면 전환만 확인할 수 있는 자리다.
 *   검색 5-1, 강의 목록 7-2, 관심강좌 7-1
 */

/** 목록 패널(검색 · 강의 목록 · 관심강좌). 옆의 강의 상세는 LectureDetailPanel, 직접 추가 폼은 CustomLectureForm 이 목록 자리를 대신한다. */
export function MainPanel({ panel, onChange, semesters, semester, onSemesterChange }: MainPanelProps) {
  const { tab } = panel;
  return (
    <PanelColumn label="강의 목록" className="gap-4 overflow-y-auto px-5 pt-5">
      <SemesterSelect semesters={semesters} value={semester} onValueChange={onSemesterChange} className="self-start" />
      <Tabs value={tab} onValueChange={(next) => onChange({ type: 'list', tab: next, detail: null })}>
        <TabList>
          <Tab value="search">검색</Tab>
          <Tab value="lectures">강의 목록</Tab>
          <Tab value="bookmark">관심강좌</Tab>
        </TabList>
        <TabPanel value="search" className="py-4 text-14-regular text-assistive">
          검색 (5-1)
        </TabPanel>
        <TabPanel value="lectures" className="py-4 text-14-regular text-assistive">
          강의 목록 (7-2)
        </TabPanel>
        <TabPanel value="bookmark" className="py-4 text-14-regular text-assistive">
          관심강좌 (7-1)
        </TabPanel>
      </Tabs>
    </PanelColumn>
  );
}
