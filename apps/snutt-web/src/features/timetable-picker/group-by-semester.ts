/**
 * 시간표 목록을 학기별로 묶는다.
 * 묶음 순서: year*10+semester 내림차순 (최근 학기 먼저).
 * 묶음 안 순서: 서버 순서 (변경 없음).
 *
 * 레거시 snutt-webclient 의 groupTimetablesBySemester 와 같은 정렬 규칙을 유지한다.
 */
import type { Semester } from '@/domain/semester';
import { toSemesterKey } from '@/domain/semester';
import type { TimetableSummary } from '@/domain/timetable';

export type SemesterGroup = {
  semester: Semester;
  /** 그룹 key: `year-term` (예: 2026-3) */
  key: string;
  timetables: TimetableSummary[];
};

/** `year*10 + term` 으로 비교. 큰 값이 최근이므로 내림차순 */
const semesterSortKey = ({ year, term }: Semester) => year * 10 + term;

/** 시간표 목록을 학기별 그룹으로 묶고 최근 학기부터 정렬한다 */
export const groupBySemester = (timetables: readonly TimetableSummary[]): SemesterGroup[] => {
  const map = new Map<string, SemesterGroup>();

  for (const timetable of timetables) {
    const key = toSemesterKey(timetable.semester);
    const group = map.get(key);
    if (group) {
      group.timetables.push(timetable);
    } else {
      map.set(key, { semester: timetable.semester, key, timetables: [timetable] });
    }
  }

  return [...map.values()].sort((a, b) => semesterSortKey(b.semester) - semesterSortKey(a.semester));
};
