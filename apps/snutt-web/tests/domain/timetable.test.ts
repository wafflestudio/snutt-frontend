import { describe, expect, it } from 'vitest';

import type { ClassTime, TimetableLecture } from '@/domain/lecture';
import { findConflictingLectures, getTotalCredit, hasLecture } from '@/domain/timetable';

const lecture = (id: string, classTimes: ClassTime[], overrides: Partial<TimetableLecture> = {}): TimetableLecture => ({
  id,
  lectureId: `lecture-${id}`,
  title: `강의 ${id}`,
  instructor: null,
  credit: 3,
  remark: null,
  classTimes,
  courseNumber: null,
  lectureNumber: null,
  department: null,
  academicYear: null,
  category: null,
  classification: null,
  color: { type: 'palette', index: 0 },
  ...overrides,
});

const time = (day: ClassTime['day'], startMinute: number, endMinute: number): ClassTime => ({
  day,
  startMinute,
  endMinute,
  place: null,
});

describe('getTotalCredit', () => {
  it('학점을 더한다', () => {
    expect(getTotalCredit([{ credit: 3 }, { credit: 2 }, { credit: 0 }])).toBe(5);
  });

  it('학점이 없는 강의(직접 추가)는 0 으로 친다', () => {
    expect(getTotalCredit([{ credit: 3 }, { credit: null }])).toBe(3);
  });

  it('강의가 없으면 0', () => {
    expect(getTotalCredit([])).toBe(0);
  });
});

describe('findConflictingLectures', () => {
  const a = lecture('a', [time(0, 600, 675), time(2, 600, 675)]); // 월수 10:00~11:15
  const b = lecture('b', [time(1, 780, 855)]); // 화 13:00~14:15
  const lectures = [a, b];

  it('시간이 겹치는 강의를 찾는다', () => {
    expect(findConflictingLectures(lectures, { classTimes: [time(2, 660, 720)] })).toEqual([a]);
  });

  it('여러 강의와 겹치면 모두 찾는다', () => {
    expect(findConflictingLectures(lectures, { classTimes: [time(0, 630, 660), time(1, 800, 820)] })).toEqual([a, b]);
  });

  it('끝과 시작이 맞닿으면 충돌이 아니다', () => {
    expect(findConflictingLectures(lectures, { classTimes: [time(0, 675, 750)] })).toEqual([]);
  });

  it('수정 중인 강의 자신과는 비교하지 않는다', () => {
    expect(findConflictingLectures(lectures, { classTimes: a.classTimes, timetableLectureId: 'a' })).toEqual([]);
  });

  it('시간 정보가 없는 강의는 충돌하지 않는다', () => {
    expect(findConflictingLectures([lecture('c', [])], { classTimes: [time(0, 600, 700)] })).toEqual([]);
    expect(findConflictingLectures(lectures, { classTimes: [] })).toEqual([]);
  });
});

describe('hasLecture', () => {
  it('수강편람 강의가 이미 담겨 있는지 확인한다', () => {
    const lectures = [lecture('a', []), lecture('custom', [], { lectureId: null })];
    expect(hasLecture(lectures, 'lecture-a')).toBe(true);
    expect(hasLecture(lectures, 'lecture-b')).toBe(false);
  });
});
