// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { GridRange } from '@/domain/grid-layout';
import type { TimetableLecture } from '@/domain/lecture';
import { LectureLayer } from '@/shared/timetable-grid/LectureLayer';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';

// 월~금, 9~12시
const range: GridRange = { days: [0, 1, 2, 3, 4], startMinute: 540, endMinute: 720 };

const lecture: TimetableLecture = {
  id: 'tl-1',
  lectureId: 'l-1',
  title: '자료구조',
  instructor: null,
  remark: null,
  classTimes: [
    { day: 0, startMinute: 600, endMinute: 660, place: '302-208' },
    { day: 2, startMinute: 600, endMinute: 660, place: null },
  ],
  department: null,
  academicYear: null,
  category: null,
  classification: null,
  credit: 3,
  courseNumber: null,
  lectureNumber: null,
  color: { type: 'palette', index: 0 },
};

const palette = [{ bg: '#e54459', fg: '#ffffff' }];

describe('TimetableGrid', () => {
  it('범위의 요일과 정시를 표시한다', () => {
    render(<TimetableGrid range={range} />);
    for (const day of ['월', '화', '수', '목', '금']) expect(screen.getByText(day)).toBeInTheDocument();
    for (const hour of ['9', '10', '11']) expect(screen.getByText(hour)).toBeInTheDocument();
    expect(screen.queryByText('토')).not.toBeInTheDocument();
    expect(screen.queryByText('12')).not.toBeInTheDocument();
  });
});

describe('LectureLayer', () => {
  it('수업 시간마다 블록에 강의명과 장소를 쓴다', () => {
    render(
      <TimetableGrid range={range}>
        <LectureLayer lectures={[lecture]} palette={palette} />
      </TimetableGrid>,
    );
    expect(screen.getAllByText('자료구조')).toHaveLength(2);
    expect(screen.getByText('302-208')).toBeInTheDocument();
  });

  it('onLectureClick 이 있으면 블록을 눌러 강의를 고른다', async () => {
    const onLectureClick = vi.fn();
    render(
      <TimetableGrid range={range}>
        <LectureLayer lectures={[lecture]} palette={palette} onLectureClick={onLectureClick} />
      </TimetableGrid>,
    );
    await userEvent.click(screen.getByRole('button', { name: '자료구조, 월 10:00~11:00, 302-208' }));
    expect(onLectureClick).toHaveBeenCalledWith(lecture);
    expect(screen.getByRole('button', { name: '자료구조, 수 10:00~11:00' })).toBeInTheDocument();
  });

  it('onLectureClick 이 없으면 읽기 전용이라 버튼이 없다', () => {
    render(
      <TimetableGrid range={range}>
        <LectureLayer lectures={[lecture]} palette={palette} />
      </TimetableGrid>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('TimetableGrid 밖에서 쓰면 에러를 낸다', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<LectureLayer lectures={[]} palette={palette} />)).toThrow('TimetableGrid 안에서만');
  });
});
