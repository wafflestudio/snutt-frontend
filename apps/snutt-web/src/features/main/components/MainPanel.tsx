'use client';

import type { ReactNode } from 'react';
import { Button } from '@/shared/ui/Button';
import { IconClose } from '@/shared/ui/icons';
import { IconButton } from '@/shared/ui/IconButton';
import { Tab, TabList, TabPanel, Tabs } from '@/shared/ui/Tabs';
import type { Semester } from '@/domain/semester';
import { DEFAULT_PANEL, type LectureDetail, type PanelView } from '@/features/main/main-view';
import { SemesterSelect } from './SemesterSelect';

type MainPanelProps = {
  panel: PanelView;
  onChange: (panel: PanelView) => void;
  semesters: readonly Semester[];
  semester: Semester;
  onSemesterChange: (semester: Semester) => void;
};

/*
 * 각 패널의 내용은 해당 단위에서 채운다. 지금은 화면 전환만 확인할 수 있는 자리다.
 *   목록 탭: 검색 5-1, 강의 목록 7-2, 관심강좌 7-1
 *   강의 상세: 6-1, 강의평 8-4 / 직접 추가: 6-4
 */

/** 패널 자리. 목록(+ 옆에 강의 상세) 또는 직접 추가 폼을 보여 준다. 폭은 Figma 기준 430px 고정. */
export function MainPanel({ panel, onChange, semesters, semester, onSemesterChange }: MainPanelProps) {
  if (panel.type === 'custom-form') {
    return (
      <PanelColumn label="직접 추가">
        <h2 className="text-22-bold">직접 추가</h2>
        <p className="text-14-regular text-assistive">직접 추가 폼 (6-4)</p>
        <Button variant="secondary" className="self-start" onClick={() => onChange(DEFAULT_PANEL)}>
          취소
        </Button>
      </PanelColumn>
    );
  }

  const { tab, detail } = panel;
  return (
    <>
      <PanelColumn label="강의 목록">
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
    <PanelColumn label="강의 상세">
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

function PanelColumn({ label, children }: { label: string; children: ReactNode }) {
  return (
    <aside
      aria-label={label}
      className="flex w-107.5 shrink-0 flex-col gap-4 overflow-y-auto border-r border-line-light bg-normal px-5 pt-5"
    >
      {children}
    </aside>
  );
}
