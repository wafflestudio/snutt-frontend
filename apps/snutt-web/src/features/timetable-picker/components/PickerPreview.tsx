'use client';

/**
 * timetable-picker 오른쪽 미리보기 패널.
 * 선택한 시간표를 읽기 전용 그리드로 보여 주고 확인 버튼을 제공한다.
 */
import { clsx } from 'clsx';
import type { ColorPair } from '@/domain/color';
import { getGridRange, toGridEntries } from '@/domain/grid-layout';
import type { Timetable } from '@/domain/timetable';
import { Button } from '@/shared/ui/Button';
import { LectureLayer } from '@/shared/timetable-grid/LectureLayer';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';

type Props = {
  timetable: Timetable | null;
  palette: readonly ColorPair[];
  isLoading: boolean;
  confirmError: string | null;
  onConfirm: () => void;
};

export function PickerPreview({ timetable, palette, isLoading, confirmError, onConfirm }: Props) {
  const allTimes = timetable ? toGridEntries(timetable.lectures).map((e) => e.time) : [];
  const range = getGridRange(allTimes);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
      <div className={clsx('min-h-0 flex-1 transition-opacity', isLoading && 'opacity-50')}>
        <TimetableGrid range={range} className="h-full">
          {timetable && <LectureLayer lectures={timetable.lectures} palette={palette} />}
        </TimetableGrid>
      </div>

      {confirmError && (
        <p role="alert" className="text-right text-13-regular text-warning">
          {confirmError}
        </p>
      )}

      <div className="flex justify-end">
        <Button onClick={onConfirm} disabled={!timetable || isLoading} data-testid="timetable-picker-confirm">
          확인
        </Button>
      </div>
    </div>
  );
}
