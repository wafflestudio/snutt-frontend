import type { LectureColor } from './color';
import type { Semester, Term } from './semester';
import { compareDayTimeRange, type DayTimeRange, formatDayTimeRange } from './time';

/** 수강편람 강의 ID */
export type LectureId = string;
/** 시간표에 담긴 강의의 ID (같은 강의라도 시간표마다 다르다) */
export type TimetableLectureId = string;

export type ClassTime = DayTimeRange & { place: string };

export type LectureEvaluation = { rating: number | null; count: number };

/** 강의 정보 중 수강편람에서 오는 부분. 텍스트 필드는 값이 없으면 빈 문자열이다. */
type LectureInfo = {
  title: string;
  instructor: string;
  credit: number;
  remark: string;
  classTimes: ClassTime[];
  courseNumber: string;
  lectureNumber: string;
  department: string;
  academicYear: string;
  category: string;
  classification: string;
};

/** 수강편람 강의 (검색 결과, 관심강좌) */
export type Lecture = LectureInfo & {
  id: LectureId;
  semester: Semester;
  quota: number | null;
  freshmanQuota: number | null;
  evaluation: LectureEvaluation | null;
};

/** 시간표에 담긴 강의. lectureId 가 null 이면 직접 추가한 강의다. */
export type TimetableLecture = LectureInfo & {
  id: TimetableLectureId;
  lectureId: LectureId | null;
  color: LectureColor;
};

export const isCustomLecture = (lecture: TimetableLecture) => lecture.lectureId === null;

/** ['월 10:00~11:15', '수 10:00~11:15'] */
export const getClassTimeTexts = (lecture: Pick<LectureInfo, 'classTimes'>) =>
  [...lecture.classTimes].sort(compareDayTimeRange).map(formatDayTimeRange);

const SUGANG_SEMESTER_CODES: Record<Term, { openShtmFg: string; openDetaShtmFg: string }> = {
  1: { openShtmFg: 'U000200001', openDetaShtmFg: 'U000300001' },
  2: { openShtmFg: 'U000200001', openDetaShtmFg: 'U000300002' },
  3: { openShtmFg: 'U000200002', openDetaShtmFg: 'U000300001' },
  4: { openShtmFg: 'U000200002', openDetaShtmFg: 'U000300002' },
};

/** 수강신청 사이트의 강의계획서 URL. 직접 추가한 강의처럼 강좌번호가 없으면 null */
export const getSyllabusUrl = (
  { courseNumber, lectureNumber }: Pick<LectureInfo, 'courseNumber' | 'lectureNumber'>,
  { year, term }: Semester,
) => {
  if (!courseNumber || !lectureNumber) return null;
  const { openShtmFg, openDetaShtmFg } = SUGANG_SEMESTER_CODES[term];
  const params = new URLSearchParams({
    openSchyy: String(year),
    openShtmFg,
    openDetaShtmFg,
    sbjtCd: courseNumber,
    ltNo: lectureNumber,
    sbjtSubhCd: '000',
  });
  return `https://snutt-proxy.wafflestudio.com/sugang/cc/cc103.action?${params}`;
};
