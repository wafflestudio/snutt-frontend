import { describe, expect, it } from 'vitest';
import type { TimetableSummary } from '@/domain/timetable';
import { groupBySemester } from '@/features/timetable-picker/group-by-semester';

const makeSummary = (
  id: string,
  year: number,
  term: 1 | 2 | 3 | 4,
  overrides: Partial<TimetableSummary> = {},
): TimetableSummary => ({
  id,
  title: `시간표 ${id}`,
  semester: { year, term },
  totalCredit: 0,
  isPrimary: false,
  updatedAt: new Date(),
  ...overrides,
});

describe('groupBySemester', () => {
  it('같은 학기의 시간표를 한 묶음으로 모은다', () => {
    const timetables = [makeSummary('a', 2026, 3), makeSummary('b', 2026, 3)];
    const groups = groupBySemester(timetables);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.timetables).toHaveLength(2);
  });

  it('다른 학기는 별도 묶음이 된다', () => {
    const timetables = [makeSummary('a', 2026, 3), makeSummary('b', 2026, 1), makeSummary('c', 2025, 3)];
    const groups = groupBySemester(timetables);
    expect(groups).toHaveLength(3);
  });

  it('최근 학기가 앞에 오도록 year*10+term 내림차순으로 정렬한다', () => {
    const timetables = [
      makeSummary('a', 2025, 1),
      makeSummary('b', 2026, 3),
      makeSummary('c', 2026, 1),
    ];
    const groups = groupBySemester(timetables);
    expect(groups[0]!.semester).toEqual({ year: 2026, term: 3 });
    expect(groups[1]!.semester).toEqual({ year: 2026, term: 1 });
    expect(groups[2]!.semester).toEqual({ year: 2025, term: 1 });
  });

  it('묶음 안의 순서는 서버 순서(입력 순서)를 유지한다', () => {
    const timetables = [makeSummary('z', 2026, 3), makeSummary('a', 2026, 3), makeSummary('m', 2026, 3)];
    const groups = groupBySemester(timetables);
    expect(groups[0]!.timetables.map((t) => t.id)).toEqual(['z', 'a', 'm']);
  });

  it('key 는 year-term 형태다', () => {
    const groups = groupBySemester([makeSummary('a', 2026, 3)]);
    expect(groups[0]!.key).toBe('2026-3');
  });

  it('빈 목록이면 빈 배열을 반환한다', () => {
    expect(groupBySemester([])).toEqual([]);
  });
});
