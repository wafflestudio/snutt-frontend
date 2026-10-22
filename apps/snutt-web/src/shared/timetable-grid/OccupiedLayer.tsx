'use client';

import { useMemo } from 'react';
import { layoutGridBlocks } from '@/domain/grid-layout';
import type { DayTimeRange } from '@/domain/time';
import { getBlockStyle, useGridRange } from './TimetableGrid';

export type OccupiedLayerProps = {
  /** 이미 찬 시간 (시간표에 담긴 강의의 수업 시간) */
  times: readonly DayTimeRange[];
};

/**
 * 이미 찬 시간을 글자 없는 회색 블록으로 그린다 (시간대 검색 모달에서 시간표의 빈 시간을 보여 줄 때).
 * 누를 수 없고 스크린 리더는 읽지 않는다.
 */
export function OccupiedLayer({ times }: OccupiedLayerProps) {
  const range = useGridRange();
  const blocks = useMemo(
    () =>
      layoutGridBlocks(
        times.map((time) => ({ item: null, time })),
        range,
      ),
    [times, range],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {blocks.map((block, index) => (
        <div
          // 시간이 같은 강의가 둘일 수 있어 순서로 구분한다 (다시 정렬되지 않는 목록)
          key={index}
          data-occupied-block
          // Figma `시간대 검색` 의 회색 블록은 #787880 · 20% (흰 바탕에서 #E4E4E6). 같은 값에 가까운 Line/border 로 쓴다 (디자인 문의 4-18)
          className="absolute bg-line-border"
          style={getBlockStyle(block, range.days.length)}
        />
      ))}
    </div>
  );
}
