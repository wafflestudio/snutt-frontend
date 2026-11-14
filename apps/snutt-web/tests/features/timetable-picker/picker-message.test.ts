import type { SnuttV2 } from '@sf/snutt-api';
import { describe, expect, it } from 'vitest';
import { toTimetable } from '@/api/mappers/timetable';
import type { ClassTime } from '@/domain/lecture';
import type { Timetable } from '@/domain/timetable';
import { createPickerMessage, getClassTimeMask, toSharedTimetable } from '@/features/timetable-picker/picker-message';

// 단위 테스트용 최소 Timetable 픽스처
const makeTimetable = (overrides: Partial<Timetable> = {}): Timetable => ({
  id: 'tt-1',
  title: '나의 시간표',
  semester: { year: 2026, term: 3 },
  themeId: 'default',
  isPrimary: false,
  updatedAt: new Date('2026-09-01'),
  lectures: [],
  ...overrides,
});

const makeLecture = (overrides: Partial<Timetable['lectures'][number]> = {}): Timetable['lectures'][number] => ({
  id: 'lec-1',
  lectureId: 'lid-1',
  courseId: null,
  title: '컴퓨터프로그래밍',
  instructor: '이영기',
  remark: '비고',
  classTimes: [],
  department: '컴퓨터공학부',
  academicYear: '2학년',
  category: '',
  categoryPre2025: null,
  classification: '전필',
  quota: 100,
  freshmanQuota: null,
  credit: 4,
  courseNumber: 'M1522.000600',
  lectureNumber: '001',
  color: { type: 'palette', index: 0 },
  ...overrides,
});

// ── getClassTimeMask ────────────────────────────────────────────────────────

describe('getClassTimeMask', () => {
  // 레거시 fixture 검증값 (apps/snutt-webclient/src/mocks/fixtures/timetable.ts)
  it('660–735 → 14680064', () => {
    const times: ClassTime[] = [{ day: 0, startMinute: 660, endMinute: 735, place: null }];
    expect(getClassTimeMask(times)).toBe(14680064);
  });

  it('1110–1220 → 480', () => {
    const times: ClassTime[] = [{ day: 2, startMinute: 1110, endMinute: 1220, place: null }];
    expect(getClassTimeMask(times)).toBe(480);
  });

  it('930–1040 → 30720', () => {
    const times: ClassTime[] = [{ day: 2, startMinute: 930, endMinute: 1040, place: null }];
    expect(getClassTimeMask(times)).toBe(30720);
  });

  it('07:00 이전 시작은 슬롯 0 부터 계산한다', () => {
    const times: ClassTime[] = [{ day: 0, startMinute: 300, endMinute: 450, place: null }]; // 05:00–07:30
    // 슬롯 0 (07:00–07:30) 만 겹침 → bit 31 → 2^31 >>> 0 = 2147483648
    expect(getClassTimeMask(times)).toBe(2147483648);
  });

  it('23:00 이후 끝은 슬롯 31 까지만 계산한다', () => {
    const times: ClassTime[] = [{ day: 0, startMinute: 1350, endMinute: 1440, place: null }]; // 22:30–24:00
    // 슬롯 31 (22:30–23:00) 만 겹침 → bit 0 → 1
    expect(getClassTimeMask(times)).toBe(1);
  });

  it('빈 목록이면 0 이다', () => {
    expect(getClassTimeMask([])).toBe(0);
  });

  it('여러 수업 시간이 같은 날이면 OR 를 한다', () => {
    // 660-690 (슬롯 8, bit 23) + 720-750 (슬롯 10, bit 21)
    const times: ClassTime[] = [
      { day: 0, startMinute: 660, endMinute: 690, place: null },
      { day: 0, startMinute: 720, endMinute: 750, place: null },
    ];
    expect(getClassTimeMask(times)).toBe((1 << 23) + (1 << 21));
  });
});

// ── toSharedTimetable ───────────────────────────────────────────────────────

describe('toSharedTimetable', () => {
  it('기본 필드(year, semester, lecture_list, title, isPrimary)를 v1 순서로 넣는다', () => {
    const result = toSharedTimetable(makeTimetable());
    expect(result).toEqual({ year: 2026, semester: 3, lecture_list: [], title: '나의 시간표', isPrimary: false });
    expect(Object.keys(result)).toEqual(['year', 'semester', 'lecture_list', 'title', 'isPrimary']);
  });

  it('null 값은 키를 뺀다', () => {
    const lecture = makeLecture({
      instructor: null,
      credit: null,
      remark: null,
      lectureId: null,
      courseNumber: null,
      classification: null,
      department: null,
      academicYear: null,
      category: null,
      quota: null,
      lectureNumber: null,
    });
    const result = toSharedTimetable(makeTimetable({ lectures: [lecture] }));
    const shared = result.lecture_list[0]!;
    expect('instructor' in shared).toBe(false);
    expect('credit' in shared).toBe(false);
    expect('remark' in shared).toBe(false);
    expect('lecture_id' in shared).toBe(false);
    expect('course_number' in shared).toBe(false);
    expect('classification' in shared).toBe(false);
    expect('department' in shared).toBe(false);
    expect('academic_year' in shared).toBe(false);
    expect('category' in shared).toBe(false);
    expect('quota' in shared).toBe(false);
    expect('lecture_number' in shared).toBe(false);
  });

  it('v1 응답과 같은 키 순서로 직렬화된다 (class_time_mask 는 class_time_json 뒤)', () => {
    const lecture = makeLecture({
      courseId: '2451',
      categoryPre2025: '과학적 사고와 실험',
      freshmanQuota: 70,
      classTimes: [{ day: 1, startMinute: 660, endMinute: 735, place: '302-208' }],
    });
    const shared = toSharedTimetable(makeTimetable({ lectures: [lecture] })).lecture_list[0]!;
    expect(Object.keys(shared)).toEqual([
      'academic_year',
      'category',
      'class_time_json',
      'class_time_mask',
      'classification',
      'credit',
      'department',
      'instructor',
      'lecture_number',
      'quota',
      'freshman_quota',
      'remark',
      'course_number',
      'course_title',
      'lecture_id',
      'snuttEvLecture',
      'categoryPre2025',
    ]);
    expect(Object.keys(shared.class_time_json[0]!)).toEqual([
      'day',
      'place',
      'startMinute',
      'endMinute',
      'start_time',
      'end_time',
      'len',
      'start',
    ]);
    expect(shared.snuttEvLecture).toEqual({ evLectureId: 2451 });
  });

  it('class_time_json 에 start · len 을 계산해 넣는다', () => {
    const lecture = makeLecture({
      classTimes: [{ day: 1, startMinute: 660, endMinute: 735, place: '302-208' }],
    });
    const result = toSharedTimetable(makeTimetable({ lectures: [lecture] }));
    const ct = result.lecture_list[0]!.class_time_json[0]!;
    // 08:00 부터의 교시. 시작은 30분 단위 내림, 끝은 올림
    expect(ct).toMatchObject({ start_time: '11:00', end_time: '12:15', start: 3, len: 1.5 });
  });

  it('class_time_json 에서 place 가 null 이면 빈 문자열이다 (v1 과 같다)', () => {
    const lecture = makeLecture({
      classTimes: [{ day: 2, startMinute: 930, endMinute: 1040, place: null }],
    });
    const result = toSharedTimetable(makeTimetable({ lectures: [lecture] }));
    const ct = result.lecture_list[0]!.class_time_json[0]!;
    expect(ct.place).toBe('');
  });

  it('class_time_mask 는 요일 7개 배열이다', () => {
    const lecture = makeLecture({
      classTimes: [
        { day: 1, startMinute: 660, endMinute: 735, place: '302-208' },
        { day: 2, startMinute: 1110, endMinute: 1220, place: null },
        { day: 3, startMinute: 660, endMinute: 735, place: '302-208' },
      ],
    });
    const result = toSharedTimetable(makeTimetable({ lectures: [lecture] }));
    const mask = result.lecture_list[0]!.class_time_mask;
    expect(mask).toHaveLength(7);
    expect(mask[1]).toBe(14680064); // 레거시 fixture 값
    expect(mask[2]).toBe(480);
    expect(mask[3]).toBe(14680064);
    expect(mask[0]).toBe(0);
  });

  it('직접 추가한 강의는 lecture_id 키를 뺀다', () => {
    const lecture = makeLecture({ lectureId: null });
    const result = toSharedTimetable(makeTimetable({ lectures: [lecture] }));
    expect('lecture_id' in result.lecture_list[0]!).toBe(false);
  });

  it('lectureBuildings 는 포함하지 않는다 (v1 · v2 시간표 응답 모두 없음)', () => {
    const lecture = makeLecture({
      classTimes: [{ day: 0, startMinute: 540, endMinute: 615, place: '302-208' }],
    });
    const result = toSharedTimetable(makeTimetable({ lectures: [lecture] }));
    const ct = result.lecture_list[0]!.class_time_json[0]!;
    expect('lectureBuildings' in ct).toBe(false);
  });
});

// ── createPickerMessage ─────────────────────────────────────────────────────

describe('createPickerMessage', () => {
  it('type 이 SNUTT_TIMETABLE_SELECTED 이다', () => {
    const msg = createPickerMessage(makeTimetable());
    expect(msg.type).toBe('SNUTT_TIMETABLE_SELECTED');
  });

  it('payload 가 SharedTimetable 형태다', () => {
    const msg = createPickerMessage(makeTimetable());
    expect(msg.payload).toMatchObject({ title: '나의 시간표', year: 2026, semester: 3 });
  });
});

// ── dev 서버 대조 ──────────────────────────────────────────────────────────
// 2026-11-14 dev 서버에서 같은 시간표를 v2 `GET /v2/timetables/:id` 와 v1 `GET /v1/tables/:id` 로 받은 실제 값.
// 레거시 picker 는 v1 응답에서 _id · user_id · updated_at · theme(· lecture_list 의 _id · color · colorIndex)만 빼고 보낸다.
// v1 응답에 없는 class_time_mask 는 빼고 비교한다.

const DEV_V2_TIMETABLE: SnuttV2.TimetableResponse = {
  id: 33725,
  year: 2018,
  semester: 1,
  title: '나의 시간표',
  themeId: 1,
  isPrimary: false,
  updatedAt: 1519220415709,
  lectures: [
    {
      id: 88143,
      lectureId: 66150,
      courseId: 24736,
      academicYear: '1학년',
      category: '컴퓨터와 정보 활용',
      classification: '교양',
      courseNumber: '035.001',
      lectureNumber: '017',
      department: '컴퓨터공학부',
      quota: 70,
      courseTitle: '컴퓨터의 개념 및 실습',
      instructor: '김석준',
      credit: 3,
      remark: '®컴퓨터공학부 1학년만 수강 가능',
      classPlaceAndTimes: [
        { day: 0, place: '301-203', startMinute: 870, endMinute: 980 },
        { day: 2, place: '301-203', startMinute: 870, endMinute: 980 },
      ],
      color: { backgroundColor: '#4F48C4', foregroundColor: '#ffffff' },
      paletteIndex: 7,
    },
    {
      id: 88144,
      lectureId: 65958,
      courseId: 2451,
      academicYear: '1학년',
      category: '과학적 사고와 실험',
      classification: '교양',
      courseNumber: '034.005',
      lectureNumber: '002',
      department: '물리·천문학부(물리학전공)',
      quota: 200,
      freshmanQuota: 140,
      courseTitle: '물리의 기본 1',
      instructor: '김경태',
      credit: 3,
      classPlaceAndTimes: [
        { day: 1, place: '028-301', startMinute: 750, endMinute: 825 },
        { day: 3, place: '028-301', startMinute: 750, endMinute: 825 },
      ],
      color: { backgroundColor: '#1D99E8', foregroundColor: '#ffffff' },
      paletteIndex: 6,
    },
    // 직접 추가한 강의 (dev 시간표 516951, 517146 에서 가져옴)
    {
      id: 1397843,
      courseTitle: '1',
      instructor: '1',
      credit: 1,
      remark: '1',
      classPlaceAndTimes: [
        { day: 0, place: '장소', startMinute: 480, endMinute: 510 },
        { day: 1, place: '장소', startMinute: 855, endMinute: 860 },
      ],
      color: { backgroundColor: '#EAA32A', foregroundColor: '#ffffff' },
      paletteIndex: 2,
    },
    {
      id: 1398173,
      courseTitle: 'asd',
      instructor: 'asdasd',
      credit: 1,
      classPlaceAndTimes: [{ day: 0, place: '', startMinute: 965, endMinute: 1270 }],
      color: { backgroundColor: '#3BD01B', foregroundColor: '#FFFFFF' },
      paletteIndex: 0,
    },
  ],
};

/** 같은 시간표의 v1 응답에서 레거시 picker 가 보내는 부분 */
const DEV_V1_PAYLOAD = {
  year: 2018,
  semester: 1,
  lecture_list: [
    {
      academic_year: '1학년',
      category: '컴퓨터와 정보 활용',
      class_time_json: [
        {
          day: 0,
          place: '301-203',
          startMinute: 870,
          endMinute: 980,
          start_time: '14:30',
          end_time: '16:20',
          len: 2,
          start: 6.5,
        },
        {
          day: 2,
          place: '301-203',
          startMinute: 870,
          endMinute: 980,
          start_time: '14:30',
          end_time: '16:20',
          len: 2,
          start: 6.5,
        },
      ],
      classification: '교양',
      credit: 3,
      department: '컴퓨터공학부',
      instructor: '김석준',
      lecture_number: '017',
      quota: 70,
      remark: '®컴퓨터공학부 1학년만 수강 가능',
      course_number: '035.001',
      course_title: '컴퓨터의 개념 및 실습',
      lecture_id: '66150',
      snuttEvLecture: { evLectureId: 24736 },
    },
    {
      academic_year: '1학년',
      category: '과학적 사고와 실험',
      class_time_json: [
        {
          day: 1,
          place: '028-301',
          startMinute: 750,
          endMinute: 825,
          start_time: '12:30',
          end_time: '13:45',
          len: 1.5,
          start: 4.5,
        },
        {
          day: 3,
          place: '028-301',
          startMinute: 750,
          endMinute: 825,
          start_time: '12:30',
          end_time: '13:45',
          len: 1.5,
          start: 4.5,
        },
      ],
      classification: '교양',
      credit: 3,
      department: '물리·천문학부(물리학전공)',
      instructor: '김경태',
      lecture_number: '002',
      quota: 200,
      freshman_quota: 140,
      course_number: '034.005',
      course_title: '물리의 기본 1',
      lecture_id: '65958',
      snuttEvLecture: { evLectureId: 2451 },
    },
    {
      class_time_json: [
        {
          day: 0,
          place: '장소',
          startMinute: 480,
          endMinute: 510,
          start_time: '08:00',
          end_time: '08:30',
          len: 0.5,
          start: 0,
        },
        {
          day: 1,
          place: '장소',
          startMinute: 855,
          endMinute: 860,
          start_time: '14:15',
          end_time: '14:20',
          len: 0.5,
          start: 6,
        },
      ],
      credit: 1,
      instructor: '1',
      remark: '1',
      course_title: '1',
    },
    {
      class_time_json: [
        {
          day: 0,
          place: '',
          startMinute: 965,
          endMinute: 1270,
          start_time: '16:05',
          end_time: '21:10',
          len: 5.5,
          start: 8,
        },
      ],
      credit: 1,
      instructor: 'asdasd',
      course_title: 'asd',
    },
  ],
  title: '나의 시간표',
  isPrimary: false,
};

describe('dev 서버 v1 응답 대조', () => {
  it('v2 응답을 변환한 payload 가 v1 레거시 payload 와 키 순서까지 같다 (class_time_mask 제외)', () => {
    const payload = toSharedTimetable(toTimetable(DEV_V2_TIMETABLE));
    const withoutMask = JSON.stringify(payload, (key, value: unknown) =>
      key === 'class_time_mask' ? undefined : value,
    );
    expect(withoutMask).toBe(JSON.stringify(DEV_V1_PAYLOAD));
  });
});
