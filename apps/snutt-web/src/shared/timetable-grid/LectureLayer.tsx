'use client';

import { clsx } from 'clsx';
import { useMemo } from 'react';
import { type ColorPair, resolveLectureColor } from '@/domain/color';
import { layoutGridBlocks, toGridEntries } from '@/domain/grid-layout';
import type { TimetableLecture } from '@/domain/lecture';
import { formatDayTimeRange } from '@/domain/time';
import { getBlockStyle, useGridRange } from './TimetableGrid';

export type LectureLayerProps = {
  lectures: readonly TimetableLecture[];
  /** 시간표 테마의 색 목록. 강의의 palette 색은 여기서 고른다 */
  palette: readonly ColorPair[];
  /** 없으면 읽기 전용이다 (친구 시간표, 비교의 오른쪽) */
  onLectureClick?: (lecture: TimetableLecture) => void;
};

/** 시간표에 담긴 강의 블록. 수업 시간마다 블록 하나에 강의명과 장소를 쓴다. */
export function LectureLayer({ lectures, palette, onLectureClick }: LectureLayerProps) {
  const range = useGridRange();
  const blocks = useMemo(() => layoutGridBlocks(toGridEntries(lectures), range), [lectures, range]);

  return (
    <div className="absolute inset-0">
      {blocks.map((block) => {
        const { item: lecture, time } = block;
        const color = resolveLectureColor(lecture.color, palette);
        const key = `${lecture.id}-${time.day}-${time.startMinute}`;
        const className = clsx(
          'absolute flex flex-col items-center justify-center gap-0.5 overflow-hidden px-1.5 text-center break-keep',
          onLectureClick &&
            'cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current',
        );
        const style = { ...getBlockStyle(block, range.days.length), backgroundColor: color.bg, color: color.fg };
        const content = (
          <>
            <span className="text-12-regular">{lecture.title}</span>
            {time.place && <span className="text-12-bold">{time.place}</span>}
          </>
        );

        return onLectureClick ? (
          <button
            key={key}
            type="button"
            onClick={() => onLectureClick(lecture)}
            // 화면에서는 위치로 알 수 있는 요일 · 시간을 스크린 리더에도 알려 준다
            aria-label={[lecture.title, formatDayTimeRange(time), time.place].filter(Boolean).join(', ')}
            className={className}
            style={style}
          >
            {content}
          </button>
        ) : (
          <div key={key} className={className} style={style}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
