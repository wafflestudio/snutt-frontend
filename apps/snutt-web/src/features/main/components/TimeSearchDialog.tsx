'use client';

import { useState } from 'react';
import { getGridRange } from '@/domain/grid-layout';
import type { DayTimeRange } from '@/domain/time';
import {
  createTimeSelection,
  rangesToSelection,
  selectionToRanges,
  type TimeFilter,
  type TimeSelection,
} from '@/domain/time-filter';
import { OccupiedLayer } from '@/shared/timetable-grid/OccupiedLayer';
import { SelectableLayer } from '@/shared/timetable-grid/SelectableLayer';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Dialog, DialogCloseButton, DialogTitle } from '@/shared/ui/Dialog';
import { IconRefresh } from '@/shared/ui/icons';

type TimeSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 지금 검색에 쓰는 시간 조건. 열 때마다 이 값으로 시작한다 */
  value: TimeFilter;
  /** 완료를 누르면 고친 조건을 준다. 닫기(×) · Esc · 바깥을 누르면 고친 것을 버린다 */
  onChange: (value: TimeFilter) => void;
  /** 고른 시간표의 수업 시간. 그리드에 회색으로 보여 준다 */
  occupied: readonly DayTimeRange[];
};

/**
 * 시간대 검색 모달 (Figma `시간대 검색`, 10-14 완료 영역): 그리드를 드래그해 검색할 시간을 고르고(민트),
 * `빈 시간대만 검색` 으로 시간표의 강의와 겹치지 않는 강의만 찾는다. 초기화는 모달 안의 선택만 지우고, 완료를 눌러야 검색에 쓴다.
 */
export function TimeSearchDialog({ open, onOpenChange, ...props }: TimeSearchDialogProps) {
  return (
    // Figma: 695 × 838, 제목 위 · 옆 여백 약 24 · 34, 아래 줄 여백 27 · 23 · 16
    <Dialog open={open} onOpenChange={onOpenChange} className="flex h-209.5 w-173.75 flex-col px-6 pt-6 pb-4">
      {/* 열 때마다 새로 그려서 value 로 돌아간다 */}
      <TimeSearchForm {...props} onClose={() => onOpenChange(false)} />
    </Dialog>
  );
}

function TimeSearchForm({
  value,
  onChange,
  occupied,
  onClose,
}: Omit<TimeSearchDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }) {
  // 그리드 범위는 열 때 한 번 정한다. 메인 시간표처럼 월~금 9~22시에, 범위 밖의 강의 · 고른 시간이 있으면 넓힌다
  const [range] = useState(() => getGridRange([...occupied, ...value.times]));
  const [selection, setSelection] = useState<TimeSelection>(() => rangesToSelection(value.times, range));
  const [emptyOnly, setEmptyOnly] = useState(value.emptyOnly);
  const [guideOpen, setGuideOpen] = useState(true);

  return (
    <>
      <div className="relative flex h-7.5 items-center justify-between pl-2.5">
        <DialogTitle className="text-20-semibold">시간대 검색</DialogTitle>
        {guideOpen && (
          // Figma: 336 × 41, 여백 12 · 16, 둥글기 10, 검정 50% 에 배경 흐림 4. 모달 가운데 위
          <div className="absolute top-1/2 left-1/2 flex w-84 -translate-x-1/2 -translate-y-1/2 items-center justify-between rounded-[10px] bg-guide px-4 py-3 text-14-medium text-on-bg backdrop-blur-xs">
            <p>검색하고 싶은 시간을 드래그하세요.</p>
            <button type="button" onClick={() => setGuideOpen(false)} className="text-snutt-milk-mint">
              확인
            </button>
          </div>
        )}
        <DialogCloseButton />
      </div>

      <TimetableGrid range={range} className="mt-4 min-h-0 flex-1">
        <OccupiedLayer times={occupied} />
        <SelectableLayer selection={selection} onSelectionChange={setSelection} label="검색할 시간" />
      </TimetableGrid>

      <div className="mt-3 flex h-8 items-center justify-between pl-0.75">
        <Checkbox checked={emptyOnly} onCheckedChange={setEmptyOnly}>
          빈 시간대만 검색
        </Checkbox>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setSelection(createTimeSelection(range));
              setEmptyOnly(false);
            }}
            className="flex items-center gap-1 text-14-medium text-plain"
          >
            <IconRefresh className="size-4" />
            초기화
          </button>
          <Button
            className="w-20"
            onClick={() => {
              onChange({ times: selectionToRanges(selection, range), emptyOnly });
              onClose();
            }}
          >
            완료
          </Button>
        </div>
      </div>
    </>
  );
}
