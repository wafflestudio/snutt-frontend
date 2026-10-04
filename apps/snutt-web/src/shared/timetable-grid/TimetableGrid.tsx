'use client';

import { clsx } from 'clsx';
import { createContext, type CSSProperties, type ReactNode, use } from 'react';
import { getHourMarks, type GridBlock, type GridRange } from '@/domain/grid-layout';
import { DAY_LABELS, MINUTES_PER_HOUR } from '@/domain/time';

/** Figma `course`: 한 시간 칸 높이 */
const HOUR_HEIGHT = 59;

const RangeContext = createContext<GridRange | null>(null);

/** 레이어에서 그리드 범위를 읽는다. TimetableGrid 안에서만 쓸 수 있다. */
export function useGridRange() {
  const range = use(RangeContext);
  if (!range) throw new Error('useGridRange 는 TimetableGrid 안에서만 쓸 수 있습니다.');
  return range;
}

/** layoutGridBlocks 의 비율 값을 레이어 안의 절대 위치로 바꾼다 */
export const getBlockStyle = ({ column, top, height }: GridBlock<unknown>, dayCount: number): CSSProperties => ({
  top: `${top * 100}%`,
  height: `${height * 100}%`,
  left: `${(column / dayCount) * 100}%`,
  width: `${100 / dayCount}%`,
});

export type TimetableGridProps = {
  range: GridRange;
  /** 그리드 위에 겹쳐 그릴 레이어 (LectureLayer 등) */
  children?: ReactNode;
  className?: string;
};

/**
 * 시간표 그리드의 틀(요일, 시각, 선). 블록은 children 레이어가 그린다.
 * 용도(메인, 친구, 비교, 시간 필터, 미리보기)에 따라 레이어를 골라 겹친다. props 로 용도를 나누지 않는다.
 */
export function TimetableGrid({ range, children, className }: TimetableGridProps) {
  const hours = getHourMarks(range);

  return (
    <div
      className={clsx('grid border-t border-line-light bg-normal', className)}
      style={{ gridTemplateColumns: `35px repeat(${range.days.length}, minmax(0, 1fr))` }}
    >
      <div />
      {range.days.map((day) => (
        <div key={day} className="flex h-7.75 items-center justify-center text-14-regular text-med">
          {DAY_LABELS[day]}
        </div>
      ))}

      <div>
        {hours.map((minute) => (
          <div
            key={minute}
            className="border-t border-line-light pt-1.25 pl-4 text-14-regular text-med"
            style={{ height: HOUR_HEIGHT }}
          >
            {minute / MINUTES_PER_HOUR}
          </div>
        ))}
      </div>

      <div className="relative col-span-full col-start-2" style={{ height: hours.length * HOUR_HEIGHT }}>
        <div aria-hidden className="absolute inset-0 flex flex-col">
          {hours.map((minute) => (
            <div key={minute} className="relative flex-1 border-t border-line-light">
              <div className="absolute inset-x-0 top-1/2 h-px bg-line-light-field" />
            </div>
          ))}
        </div>
        <div aria-hidden className="absolute inset-0 flex">
          {range.days.map((day) => (
            <div key={day} className="flex-1 border-l border-line-light" />
          ))}
        </div>
        <RangeContext value={range}>{children}</RangeContext>
      </div>
    </div>
  );
}
