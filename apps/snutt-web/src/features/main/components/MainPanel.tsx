'use client';

import { IconClose } from '@/shared/ui/icons';
import { IconButton } from '@/shared/ui/IconButton';
import { Tab, TabList, TabPanel, Tabs } from '@/shared/ui/Tabs';
import type { Semester } from '@/domain/semester';
import type { LectureDetail, PanelView } from '@/features/main/main-view';
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
 * 각 패널의 내용은 해당 단위에서 채운다. 지금은 화면 전환만 확인할 수 있는 자리다.
 *   목록 탭: 검색 5-1, 강의 목록 7-2, 관심강좌 7-1
 *   강의 상세: 6-1, 강의평 8-4
 */

/** 목록 패널(검색 · 강의 목록 · 관심강좌)과 그 옆의 강의 상세. 직접 추가 폼은 CustomLectureForm 이 목록 자리를 대신한다. */
export function MainPanel({ panel, onChange, semesters, semester, onSemesterChange }: MainPanelProps) {
  const { tab, detail } = panel;
  return (
    <>
      <PanelColumn label="강의 목록" className="gap-4 overflow-y-auto px-5 pt-5">
        <SemesterSelect
          semesters={semesters}
          value={semester}
          onValueChange={onSemesterChange}
          className="self-start"
        />
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

      {detail && (
        <LectureDetailPanel detail={detail} onChange={(next) => onChange({ type: 'list', tab, detail: next })} />
      )}
    </>
  );
}

function LectureDetailPanel({
  detail,
  onChange,
}: {
  detail: LectureDetail;
  onChange: (detail: LectureDetail | null) => void;
}) {
  return (
    // 강의 상세 패널의 폭은 6-1 에서 Figma 로 맞춘다
    <PanelColumn label="강의 상세" className="gap-4 overflow-y-auto px-5 pt-5">
      <div className="flex items-center justify-between">
        <Tabs
          value={detail.view}
          onValueChange={(view) => onChange({ ...detail, view, editing: false })}
          variant="segmented"
        >
          <TabList>
            <Tab value="info">강의 상세</Tab>
            <Tab value="review">강의평</Tab>
          </TabList>
        </Tabs>
        <IconButton label="강의 상세 닫기" icon={<IconClose />} onClick={() => onChange(null)} />
      </div>
      <p className="text-14-regular text-assistive">
        {detail.view === 'info' ? `강의 상세 (6-1): ${detail.lectureId}` : '강의평 (8-4)'}
      </p>
    </PanelColumn>
  );
}
