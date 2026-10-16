'use client';

import { useMemo } from 'react';
import { layoutGridBlocks, toGridEntries } from '@/domain/grid-layout';
import type { ClassTime } from '@/domain/lecture';
import { getBlockStyle, useGridRange } from './TimetableGrid';

export type PreviewLayerProps = {
  /** 미리 보여 줄 강의. null 이면 아무것도 그리지 않는다 */
  lecture: { title: string; classTimes: readonly ClassTime[] } | null;
};

/**
 * 검색 결과에 커서를 올렸을 때 그 강의가 들어갈 자리 (5-2). 강의 블록 위에 반투명한 검정으로 겹쳐 그려
 * 시간이 겹치는 강의가 비쳐 보인다. 누를 수 없고(아래 블록을 그대로 누른다) 스크린 리더는 읽지 않는다.
 * 그리드 범위 밖의 시간(토요일, 22시 이후 등)은 그리드를 늘리지 않고 보이는 만큼만 그린다. (디자인 문의 4-13)
 */
export function PreviewLayer({ lecture }: PreviewLayerProps) {
  const range = useGridRange();
  const blocks = useMemo(() => (lecture ? layoutGridBlocks(toGridEntries([lecture]), range) : []), [lecture, range]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {blocks.map((block) => (
        <div
          key={`${block.time.day}-${block.time.startMinute}`}
          data-preview-block
          // 강의 블록과 같은 배치(여백 12, 강의명 · 장소 사이 1). 배경은 Background/deem(검정 20%)
          className="absolute flex flex-col items-center justify-center gap-px overflow-hidden bg-deem px-3 text-center break-keep text-normal"
          style={getBlockStyle(block, range.days.length)}
        >
          <span className="text-12-regular">{block.item.title}</span>
          {block.time.place && <span className="text-12-bold">{block.time.place}</span>}
        </div>
      ))}
    </div>
  );
}
