'use client';

import { useMemo, useReducer } from 'react';
import { isSameSemester, type Semester } from '@/domain/semester';
import {
  getTotalCredit,
  pickDefaultTimetable,
  type Timetable,
  type TimetableId,
  type TimetableSummary,
} from '@/domain/timetable';
import { SAMPLE_SEMESTERS, SAMPLE_TIMETABLES } from '@/features/main/sample-data';

export type TimetablesState = {
  timetables: Timetable[];
  semester: Semester;
  /** null 이거나 이 학기에 없는 시간표면 학기의 기본 시간표를 보여 준다 */
  selectedId: TimetableId | null;
};

export type TimetablesAction =
  | { type: 'select-semester'; semester: Semester }
  | { type: 'select'; id: TimetableId }
  | { type: 'create'; id: TimetableId; title: string }
  | { type: 'rename'; id: TimetableId; title: string }
  | { type: 'remove'; id: TimetableId }
  | { type: 'set-primary'; id: TimetableId; isPrimary: boolean };

const update = (timetables: Timetable[], id: TimetableId, change: (timetable: Timetable) => Timetable) =>
  timetables.map((timetable) => (timetable.id === id ? change(timetable) : timetable));

export function timetablesReducer(state: TimetablesState, action: TimetablesAction): TimetablesState {
  switch (action.type) {
    case 'select-semester':
      return { ...state, semester: action.semester, selectedId: null };
    case 'select':
      return { ...state, selectedId: action.id };
    case 'create': {
      const timetable: Timetable = {
        id: action.id,
        title: action.title,
        semester: state.semester,
        themeId: 'sample',
        isPrimary: false,
        updatedAt: new Date(),
        lectures: [],
      };
      return { ...state, timetables: [...state.timetables, timetable], selectedId: action.id };
    }
    case 'rename':
      return { ...state, timetables: update(state.timetables, action.id, (t) => ({ ...t, title: action.title })) };
    case 'remove':
      return {
        ...state,
        timetables: state.timetables.filter((timetable) => timetable.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    case 'set-primary': {
      const target = state.timetables.find((timetable) => timetable.id === action.id);
      if (!target) return state;
      // 기본 시간표는 학기마다 하나다
      return {
        ...state,
        timetables: state.timetables.map((timetable) =>
          isSameSemester(timetable.semester, target.semester)
            ? { ...timetable, isPrimary: timetable.id === action.id && action.isPrimary }
            : timetable,
        ),
      };
    }
  }
}

const toSummary = ({ id, title, semester, isPrimary, updatedAt, lectures }: Timetable): TimetableSummary => ({
  id,
  title,
  semester,
  totalCredit: getTotalCredit(lectures),
  isPrimary,
  updatedAt,
});

const INITIAL_STATE: TimetablesState = {
  timetables: SAMPLE_TIMETABLES,
  semester: SAMPLE_SEMESTERS[0],
  selectedId: null,
};

/**
 * 학기 선택과 그 학기의 시간표 목록 · 고른 시간표.
 * 1-2 (API) 전까지 예시 데이터를 메모리에서 고친다. 새로고침하면 처음으로 돌아간다.
 * API 를 연결하면 목록은 query, 바꾸는 함수는 mutation 으로 바꾸고, 처음 학기 · 시간표는 `GET /v2/timetables/recent` 로 정한다.
 */
export function useTimetables() {
  const [state, dispatch] = useReducer(timetablesReducer, INITIAL_STATE);
  const { semester } = state;

  // API 와 같은 모양으로 둔다: 목록(GET /v2/timetables)은 요약, 고른 시간표(GET /v2/timetables/{id})는 강의까지
  const timetables = useMemo(
    () => state.timetables.filter((timetable) => isSameSemester(timetable.semester, semester)).map(toSummary),
    [state.timetables, semester],
  );
  const selectedSummary =
    timetables.find((timetable) => timetable.id === state.selectedId) ?? pickDefaultTimetable(timetables);
  const getTimetable = (id: TimetableId) => state.timetables.find((timetable) => timetable.id === id) ?? null;

  return {
    semesters: SAMPLE_SEMESTERS,
    semester,
    /** 고른 학기의 시간표 */
    timetables,
    selected: selectedSummary && getTimetable(selectedSummary.id),
    getTimetable,
    selectSemester: (next: Semester) => dispatch({ type: 'select-semester', semester: next }),
    select: (id: TimetableId) => dispatch({ type: 'select', id }),
    /** 고른 학기에 시간표를 만들고 그것을 고른다 */
    create: (title: string) => dispatch({ type: 'create', id: crypto.randomUUID(), title }),
    rename: (id: TimetableId, title: string) => dispatch({ type: 'rename', id, title }),
    remove: (id: TimetableId) => dispatch({ type: 'remove', id }),
    setPrimary: (id: TimetableId, isPrimary: boolean) => dispatch({ type: 'set-primary', id, isPrimary }),
  };
}

export type TimetablesController = ReturnType<typeof useTimetables>;
