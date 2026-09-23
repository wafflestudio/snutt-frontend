import { describe, expect, it } from 'vitest';

import {
  compareSemester,
  formatSemester,
  isSameSemester,
  parseSemesterKey,
  type Semester,
  toSemesterKey,
} from '@/domain/semester';

describe('formatSemester', () => {
  it.each([
    [{ year: 2026, term: 1 }, '2026 1학기'],
    [{ year: 2026, term: 2 }, '2026 여름학기'],
    [{ year: 2026, term: 3 }, '2026 2학기'],
    [{ year: 2026, term: 4 }, '2026 겨울학기'],
  ] as const)('%o → %s', (semester, expected) => expect(formatSemester(semester)).toBe(expected));
});

describe('compareSemester', () => {
  it('연도, 학기 순으로 오래된 학기가 앞에 온다', () => {
    const semesters: Semester[] = [
      { year: 2026, term: 1 },
      { year: 2025, term: 4 },
      { year: 2026, term: 3 },
      { year: 2025, term: 1 },
    ];
    expect([...semesters].sort(compareSemester)).toEqual([
      { year: 2025, term: 1 },
      { year: 2025, term: 4 },
      { year: 2026, term: 1 },
      { year: 2026, term: 3 },
    ]);
  });
});

describe('isSameSemester', () => {
  it('연도와 학기가 모두 같아야 같다', () => {
    expect(isSameSemester({ year: 2026, term: 1 }, { year: 2026, term: 1 })).toBe(true);
    expect(isSameSemester({ year: 2026, term: 1 }, { year: 2026, term: 3 })).toBe(false);
    expect(isSameSemester({ year: 2026, term: 1 }, { year: 2025, term: 1 })).toBe(false);
  });
});

describe('semester key', () => {
  it('문자열로 바꿨다가 되돌리면 같은 값이다', () => {
    const semester: Semester = { year: 2026, term: 2 };
    expect(toSemesterKey(semester)).toBe('2026-2');
    expect(parseSemesterKey(toSemesterKey(semester))).toEqual(semester);
  });

  it.each(['', '2026', '2026-0', '2026-5', '26-1', '2026-1-1', 'abcd-1'])('잘못된 키 "%s" 는 null', (key) =>
    expect(parseSemesterKey(key)).toBeNull(),
  );
});
