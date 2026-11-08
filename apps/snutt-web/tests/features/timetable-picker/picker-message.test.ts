import { describe, expect, it } from 'vitest';
import type { ClassTime } from '@/domain/lecture';
import { createPickerMessage, getClassTimeMask, toSharedTimetable } from '@/features/timetable-picker/picker-message';
import type { Timetable } from '@/domain/timetable';

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
  it('기본 필드(title, year, semester, lecture_list)를 포함한다', () => {
    const result = toSharedTimetable(makeTimetable());
    expect(result).toMatchObject({ title: '나의 시간표', year: 2026, semester: 3, lecture_list: [] });
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

  it('레거시 형태와 같은 키 순서로 직렬화된다', () => {
    const lecture = makeLecture({
      classTimes: [{ day: 1, startMinute: 660, endMinute: 735, place: '302-208' }],
    });
    const result = toSharedTimetable(makeTimetable({ lectures: [lecture] }));
    const shared = result.lecture_list[0]!;

    // 키 순서: course_title → instructor → credit → class_time_json → remark → class_time_mask → lecture_id → ...
    const keys = Object.keys(shared);
    const indexOf = (k: string) => keys.indexOf(k);
    expect(indexOf('course_title')).toBeLessThan(indexOf('instructor'));
    expect(indexOf('instructor')).toBeLessThan(indexOf('credit'));
    expect(indexOf('credit')).toBeLessThan(indexOf('class_time_json'));
    expect(indexOf('class_time_json')).toBeLessThan(indexOf('remark'));
    expect(indexOf('remark')).toBeLessThan(indexOf('class_time_mask'));
    expect(indexOf('class_time_mask')).toBeLessThan(indexOf('lecture_id'));
  });

  it('class_time_json 에 start · len 을 계산해 넣는다', () => {
    const lecture = makeLecture({
      classTimes: [{ day: 1, startMinute: 660, endMinute: 735, place: '302-208' }],
    });
    const result = toSharedTimetable(makeTimetable({ lectures: [lecture] }));
    const ct = result.lecture_list[0]!.class_time_json[0]!;
    expect(ct.start).toBe(11); // 660 / 60
    expect(ct.len).toBeCloseTo(1.25); // (735 - 660) / 60
  });

  it('class_time_json 에서 place 가 null 이면 키를 뺀다', () => {
    const lecture = makeLecture({
      classTimes: [{ day: 2, startMinute: 930, endMinute: 1040, place: null }],
    });
    const result = toSharedTimetable(makeTimetable({ lectures: [lecture] }));
    const ct = result.lecture_list[0]!.class_time_json[0]!;
    expect('place' in ct).toBe(false);
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

  it('lectureBuildings 는 포함하지 않는다 (v2 응답에 없음)', () => {
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
