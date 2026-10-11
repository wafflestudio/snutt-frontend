import { describe, expect, it } from 'vitest';
import type { Semester } from '@/domain/semester';
import type { Timetable } from '@/domain/timetable';
import { timetablesReducer, type TimetablesState } from '@/features/main/use-timetables';

const FALL: Semester = { year: 2026, term: 3 };
const SPRING: Semester = { year: 2026, term: 1 };

const timetable = (id: string, semester: Semester, isPrimary = false): Timetable => ({
  id,
  title: id,
  semester,
  themeId: 'theme',
  isPrimary,
  updatedAt: new Date(2026, 0, 1),
  lectures: [],
});

const state = (overrides: Partial<TimetablesState> = {}): TimetablesState => ({
  timetables: [timetable('a', FALL, true), timetable('b', FALL), timetable('c', SPRING, true)],
  semester: FALL,
  selectedId: 'b',
  ...overrides,
});

const primaryIds = ({ timetables }: TimetablesState) => timetables.filter((t) => t.isPrimary).map((t) => t.id);

describe('timetablesReducer', () => {
  it('기본 시간표는 학기마다 하나라서, 지정하면 같은 학기의 기본 시간표만 풀린다', () => {
    expect(primaryIds(timetablesReducer(state(), { type: 'set-primary', id: 'b', isPrimary: true }))).toEqual([
      'b',
      'c',
    ]);
  });

  it('기본 시간표를 해제하면 그 학기에는 기본 시간표가 없다', () => {
    expect(primaryIds(timetablesReducer(state(), { type: 'set-primary', id: 'a', isPrimary: false }))).toEqual(['c']);
  });

  it('고른 시간표를 지우면 선택이 풀려서 학기의 기본 시간표로 돌아간다', () => {
    const next = timetablesReducer(state(), { type: 'remove', id: 'b' });
    expect(next.timetables.map((t) => t.id)).toEqual(['a', 'c']);
    expect(next.selectedId).toBeNull();
  });

  it('새 시간표는 고른 학기에 만들고 바로 고른다', () => {
    const next = timetablesReducer(state({ semester: SPRING }), { type: 'create', id: 'd', title: '새 시간표' });
    expect(next.timetables.at(-1)).toMatchObject({ id: 'd', title: '새 시간표', semester: SPRING, isPrimary: false });
    expect(next.selectedId).toBe('d');
  });

  it('학기를 바꾸면 선택이 풀린다', () => {
    expect(timetablesReducer(state(), { type: 'select-semester', semester: SPRING })).toMatchObject({
      semester: SPRING,
      selectedId: null,
    });
  });
});
