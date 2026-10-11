'use client';

import { useMemo, useState } from 'react';
import { DevHeader } from '@/app/(dev)/_components/DevHeader';
import { SAMPLE_PALETTE } from '@/features/main/sample-data';
import { getGridRange } from '@/domain/grid-layout';
import type { ClassTime, TimetableLecture } from '@/domain/lecture';
import { type Day, toMinute } from '@/domain/time';
import { LectureLayer } from '@/shared/timetable-grid/LectureLayer';
import { TimetableGrid } from '@/shared/timetable-grid/TimetableGrid';
import { Tab, TabList, Tabs } from '@/shared/ui/Tabs';

const time = (day: Day, start: string, end: string, place: string | null = '058-331'): ClassTime => {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  return { day, startMinute: toMinute(startHour, startMinute), endMinute: toMinute(endHour, endMinute), place };
};

const lecture = (id: string, title: string, colorIndex: number, classTimes: ClassTime[]): TimetableLecture => ({
  id,
  lectureId: id,
  title,
  instructor: null,
  remark: null,
  classTimes,
  department: null,
  academicYear: null,
  category: null,
  classification: null,
  credit: 3,
  courseNumber: null,
  lectureNumber: null,
  color: { type: 'palette', index: colorIndex },
});

const SAMPLES = {
  basic: [
    lecture('1', '경영전략', 0, [time(0, '9:00', '11:45')]),
    lecture('2', '공공커뮤니케이션 미디어', 8, [time(3, '9:00', '11:45')]),
    lecture('3', '서양근대윤리학의 이해', 3, [time(1, '15:00', '16:50'), time(3, '15:00', '16:50')]),
    lecture('4', '경영전략', 2, [time(2, '14:00', '17:00', null)]),
    lecture('5', '행정학', 6, [time(4, '14:30', '17:00')]),
  ],
  extended: [
    lecture('1', '자료구조', 6, [time(0, '10:00', '11:15'), time(2, '10:00', '11:15')]),
    lecture('2', '컴퓨터구조', 0, [time(0, '11:30', '12:45'), time(2, '11:30', '12:45')]),
    lecture('3', '짧은 수업', 8, [time(4, '13:00', '13:50', null)]),
    lecture('4', '토요 특강', 5, [time(5, '9:00', '12:00')]),
    lecture('5', '야간 세미나', 7, [time(3, '20:00', '23:30', '301-118')]),
    lecture('6', '이른 수업', 1, [time(1, '8:00', '9:15')]),
  ],
} satisfies Record<string, TimetableLecture[]>;

type SampleName = keyof typeof SAMPLES;

export function GridPreview() {
  const [sample, setSample] = useState<SampleName>('basic');
  const [readonly, setReadonly] = useState(false);
  const [clicked, setClicked] = useState<string | null>(null);

  const lectures = SAMPLES[sample];
  const range = useMemo(() => getGridRange(lectures.flatMap((l) => l.classTimes)), [lectures]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-10">
      <DevHeader title="시간표 그리드" />

      <div className="flex flex-wrap items-center gap-4">
        <Tabs value={sample} onValueChange={setSample} variant="segmented">
          <TabList>
            <Tab value="basic">기본</Tab>
            <Tab value="extended">토요일 · 범위 밖</Tab>
          </TabList>
        </Tabs>
        <label className="flex items-center gap-2 text-14-regular text-plain">
          <input type="checkbox" checked={readonly} onChange={(e) => setReadonly(e.target.checked)} />
          읽기 전용
        </label>
        <span className="text-14-regular text-assistive">클릭한 강의: {clicked ?? '없음'}</span>
      </div>

      <TimetableGrid range={range}>
        <LectureLayer
          lectures={lectures}
          palette={SAMPLE_PALETTE}
          onLectureClick={readonly ? undefined : (l) => setClicked(l.title)}
        />
      </TimetableGrid>
    </main>
  );
}
