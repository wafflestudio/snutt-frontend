// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GridRange } from '@/domain/grid-layout';
import { SAMPLE_PALETTE, SAMPLE_TIMETABLES } from '@/features/main/sample-data';
import { LectureLayer } from '@/shared/timetable-grid/LectureLayer';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';

const range: GridRange = { days: [0, 1, 2, 3, 4], startMinute: 0, endMinute: 24 * 60 };
const [lecture] = SAMPLE_TIMETABLES[0].lectures;

const renderLayer = (display?: Parameters<typeof LectureLayer>[0]['display']) =>
  render(
    <TimetableGrid range={range}>
      <LectureLayer lectures={[lecture]} palette={SAMPLE_PALETTE} display={display} />
    </TimetableGrid>,
  );

describe('LectureLayer', () => {
  it('기본은 강의명과 장소만 쓴다', () => {
    renderLayer();
    expect(screen.getAllByText(lecture.title).length).toBeGreaterThan(0);
    expect(screen.queryByText(`(${lecture.lectureNumber})`)).not.toBeInTheDocument();
  });

  it('시간표 설정에 따라 분반 · 교수를 쓰고 강의명을 뺀다', () => {
    renderLayer({ title: false, place: true, lectureNumber: true, instructor: true });
    expect(screen.queryByText(lecture.title)).not.toBeInTheDocument();
    expect(screen.getAllByText(`(${lecture.lectureNumber})`).length).toBeGreaterThan(0);
    expect(screen.getAllByText(lecture.instructor ?? '').length).toBeGreaterThan(0);
  });
});
