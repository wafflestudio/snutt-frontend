/** 1 = 1학기, 2 = 여름학기, 3 = 2학기, 4 = 겨울학기 (학사 일정 순서) */
export type Term = 1 | 2 | 3 | 4;

export type Semester = { year: number; term: Term };

export const TERMS: readonly Term[] = [1, 2, 3, 4];

export const TERM_LABELS: Record<Term, string> = { 1: '1학기', 2: '여름학기', 3: '2학기', 4: '겨울학기' };

/** 학기 선택 UI 의 짧은 표기 (1 / S / 2 / W) */
export const TERM_SHORT_LABELS: Record<Term, string> = { 1: '1', 2: 'S', 3: '2', 4: 'W' };

/** { year: 2026, term: 2 } → '2026 여름학기' */
export const formatSemester = ({ year, term }: Semester) => `${year} ${TERM_LABELS[term]}`;

export const isSameSemester = (a: Semester, b: Semester) => a.year === b.year && a.term === b.term;

/** 오래된 학기가 앞에 오도록 정렬 */
export const compareSemester = (a: Semester, b: Semester) => a.year - b.year || a.term - b.term;

/** URL, query key 용 문자열. { year: 2026, term: 2 } → '2026-2' */
export const toSemesterKey = ({ year, term }: Semester) => `${year}-${term}`;

export const parseSemesterKey = (key: string): Semester | null => {
  const match = /^(\d{4})-([1-4])$/.exec(key);
  if (!match) return null;
  return { year: Number(match[1]), term: Number(match[2]) as Term };
};
