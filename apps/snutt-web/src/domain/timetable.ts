import type { ClassTime, LectureId, TimetableLecture, TimetableLectureId } from './lecture';
import type { Semester } from './semester';
import { isOverlapping } from './time';

export type TimetableId = string;

/** 시간표 목록(탭)에 쓰는 요약 정보 */
export type TimetableSummary = {
  id: TimetableId;
  title: string;
  semester: Semester;
  totalCredit: number;
  isPrimary: boolean;
  updatedAt: Date;
};

export type Timetable = {
  id: TimetableId;
  title: string;
  semester: Semester;
  themeId: string;
  isPrimary: boolean;
  updatedAt: Date;
  lectures: TimetableLecture[];
};

export const getTotalCredit = (lectures: readonly Pick<TimetableLecture, 'credit'>[]) =>
  lectures.reduce((sum, lecture) => sum + (lecture.credit ?? 0), 0);

/** 학기를 열 때 처음 보여 줄 시간표: 기본 시간표, 없으면 목록의 첫 시간표 */
export const pickDefaultTimetable = <T extends Pick<TimetableSummary, 'isPrimary'>>(timetables: readonly T[]) =>
  timetables.find((timetable) => timetable.isPrimary) ?? timetables[0] ?? null;

/** 새 시간표의 기본 이름. 이미 있는 `시간표 N` 과 겹치지 않는 가장 작은 N 을 쓴다. */
export const getNewTimetableTitle = (titles: readonly string[]) => {
  const used = new Set(titles);
  let number = 1;
  while (used.has(`시간표 ${number}`)) number += 1;
  return `시간표 ${number}`;
};

type ConflictCandidate = {
  classTimes: readonly ClassTime[];
  /** 이미 시간표에 있는 강의를 수정하는 경우, 자기 자신과는 비교하지 않는다 */
  timetableLectureId?: TimetableLectureId;
};

/** candidate 와 시간이 겹치는 시간표 강의 목록 */
export const findConflictingLectures = (
  lectures: readonly TimetableLecture[],
  { classTimes, timetableLectureId }: ConflictCandidate,
) =>
  lectures.filter(
    (lecture) =>
      lecture.id !== timetableLectureId &&
      lecture.classTimes.some((existing) => classTimes.some((time) => isOverlapping(existing, time))),
  );

export const hasLecture = (lectures: readonly TimetableLecture[], lectureId: LectureId) =>
  lectures.some((lecture) => lecture.lectureId === lectureId);
