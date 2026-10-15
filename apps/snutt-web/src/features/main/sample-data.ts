import type { ColorPair } from '@/domain/color';
import type { ClassTime, TimetableLecture } from '@/domain/lecture';
import type { Semester } from '@/domain/semester';
import type { Timetable } from '@/domain/timetable';
import { type Day, toMinute } from '@/domain/time';

/*
 * 개발 페이지(`/grid`, `/ui`)와 테스트에서 쓰는 예시 데이터. 메인 화면은 서버에서 받는다.
 * 테스트는 이 시간표로 가짜 서버(`tests/msw/fake-snutt.ts`)를 만든다.
 */

// 서버의 기본 테마(SNUTT)와 같은 색
export const SAMPLE_PALETTE: ColorPair[] = [
  '#e54459',
  '#f58d3d',
  '#fac42d',
  '#a6d930',
  '#2bc267',
  '#1bd0c8',
  '#1d99e8',
  '#4f48c4',
  '#af56b3',
].map((bg) => ({ bg, fg: '#ffffff' }));

/** 수강편람이 있는 학기. 최근 학기가 앞에 온다 */
export const SAMPLE_SEMESTERS: Semester[] = [
  { year: 2026, term: 3 },
  { year: 2026, term: 2 },
  { year: 2026, term: 1 },
  { year: 2025, term: 4 },
  { year: 2025, term: 3 },
  { year: 2025, term: 2 },
  { year: 2025, term: 1 },
];

const time = (day: Day, start: string, end: string, place: string | null = '058-331'): ClassTime => {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  return { day, startMinute: toMinute(startHour, startMinute), endMinute: toMinute(endHour, endMinute), place };
};

/** 수강편람 강의. 강의 상세에 보일 값은 info 로 채운다 */
const lecture = (
  id: string,
  title: string,
  colorIndex: number,
  classTimes: ClassTime[],
  info: Partial<TimetableLecture> = {},
): TimetableLecture => ({
  id,
  lectureId: `lecture-${id}`,
  title,
  instructor: null,
  remark: null,
  classTimes,
  department: null,
  academicYear: null,
  category: null,
  categoryPre2025: null,
  classification: null,
  quota: null,
  freshmanQuota: null,
  credit: 3,
  courseNumber: null,
  lectureNumber: null,
  color: { type: 'palette', index: colorIndex },
  ...info,
});

const timetable = (
  id: string,
  title: string,
  semester: Semester,
  lectures: TimetableLecture[],
  isPrimary = false,
): Timetable => ({ id, title, semester, themeId: 'sample', isPrimary, updatedAt: new Date(2026, 8, 1), lectures });

const FALL_2026: Semester = { year: 2026, term: 3 };
const SPRING_2026: Semester = { year: 2026, term: 1 };
const WINTER_2025: Semester = { year: 2025, term: 4 };

export const SAMPLE_TIMETABLES: Timetable[] = [
  timetable(
    'sample-1',
    '시간표 1',
    FALL_2026,
    [
      lecture('1-1', '경영전략', 0, [time(0, '9:00', '11:45')], {
        instructor: '김민준',
        department: '경영대학 경영학과',
        academicYear: '3학년',
        classification: '전선',
        courseNumber: 'M1313.001400',
        lectureNumber: '001',
        quota: 60,
        freshmanQuota: 0,
        remark: '경영대학 학생만 수강 가능',
      }),
      lecture('1-2', '공공커뮤니케이션 미디어', 8, [time(3, '9:00', '11:45')]),
      lecture('1-3', '서양근대윤리학의 이해', 3, [time(1, '15:00', '16:50'), time(3, '15:00', '16:50')], {
        instructor: '이서연',
        department: '인문대학 철학과',
        academicYear: '1학년',
        classification: '교양',
        category: '인간과 사회',
        categoryPre2025: '사상과 가치',
        courseNumber: '045.019',
        lectureNumber: '002',
        quota: 80,
        freshmanQuota: 20,
      }),
      lecture('1-4', '재무관리', 2, [time(2, '14:00', '17:00', null)]),
      lecture('1-5', '행정학', 6, [time(4, '14:30', '17:00')]),
    ],
    true,
  ),
  timetable('sample-2', '시간표 2', FALL_2026, [
    lecture('2-1', '자료구조', 6, [time(0, '10:00', '11:15'), time(2, '10:00', '11:15')]),
    lecture('2-2', '컴퓨터구조', 0, [time(0, '11:30', '12:45'), time(2, '11:30', '12:45')]),
    lecture('2-3', '이산수학', 4, [time(1, '13:00', '14:15'), time(3, '13:00', '14:15')]),
    lecture('2-4', '동아리 모임', 7, [time(4, '18:00', '20:00', null)], { lectureId: null, credit: null }),
  ]),
  timetable('sample-3', '시간표 3', FALL_2026, []),
  timetable(
    'sample-4',
    '나의 시간표',
    SPRING_2026,
    [
      lecture('4-1', '대학 글쓰기 1', 1, [time(1, '9:30', '10:45'), time(3, '9:30', '10:45')], { credit: 2 }),
      lecture('4-2', '미적분학 1', 5, [time(0, '14:00', '15:50'), time(2, '14:00', '15:50')]),
    ],
    true,
  ),
  timetable('sample-5', '계절학기', WINTER_2025, [
    lecture('5-1', '통계학', 3, [time(0, '9:00', '12:00'), time(2, '9:00', '12:00')]),
  ]),
];
