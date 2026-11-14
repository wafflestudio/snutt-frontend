/**
 * timetable-picker 메시지 계약.
 * 레거시 snutt-webclient 의 postMessage 계약을 그대로 유지한다.
 *
 * 소비자(RN 앱, 팝업 오프너)가 받는 메시지:
 *   { type: 'SNUTT_TIMETABLE_SELECTED', payload: SharedTimetable }
 *
 * 레거시 계약 출처: apps/snutt-webclient/src/usecases/timetablePickerService.ts
 */
import type { ClassTime } from '@/domain/lecture';
import type { Term } from '@/domain/semester';
import type { Timetable } from '@/domain/timetable';

export const PICKER_MESSAGE_TYPE = 'SNUTT_TIMETABLE_SELECTED' as const;

/** 그리드 하루에 해당하는 30분 슬롯 마스크 계산 기준 */
const MASK_START_MINUTE = 7 * 60; // 07:00
const MASK_END_MINUTE = 23 * 60; // 23:00
const MASK_SLOT_MINUTES = 30;
const MASK_SLOTS = (MASK_END_MINUTE - MASK_START_MINUTE) / MASK_SLOT_MINUTES; // 32

/**
 * 하루의 수업 시간 목록으로 class_time_mask 1개 값을 계산한다.
 * 07:00 부터 30분 슬롯 k(0..31) 마다 bit `1 << (31 - k)` (unsigned).
 * 수업과 겹치는 슬롯을 모두 켠다 (끝은 올림). 07:00 전/23:00 후 슬롯은 버린다.
 *
 * 2026-11-14 dev 의 v1 `GET /v1/tables/:id` 응답에는 이 필드가 없어 서버 값과 대조하지 못했다.
 * 계산식은 옛 v1(Node) 시절 레거시 mock fixture 에 맞춘 것이다.
 *
 * 검증값(레거시 fixture):
 *   660–735  → 14680064
 *   1110–1220 → 480
 *   930–1040  → 30720
 */
export const getClassTimeMask = (classTimes: readonly Pick<ClassTime, 'startMinute' | 'endMinute'>[]): number => {
  let mask = 0;
  for (const { startMinute, endMinute } of classTimes) {
    const slotStart = Math.max(0, Math.floor((startMinute - MASK_START_MINUTE) / MASK_SLOT_MINUTES));
    const slotEnd = Math.min(MASK_SLOTS, Math.ceil((endMinute - MASK_START_MINUTE) / MASK_SLOT_MINUTES));
    for (let k = slotStart; k < slotEnd; k++) {
      mask = (mask | (1 << (31 - k))) >>> 0;
    }
  }
  return mask;
};

/** 한 강의의 수업 시간 목록을 요일(0~6)별로 분류해 class_time_mask[7] 을 만든다 */
const buildClassTimeMask = (classTimes: readonly ClassTime[]): number[] => {
  const byDay: ClassTime[][] = Array.from({ length: 7 }, () => []);
  for (const ct of classTimes) byDay[ct.day]!.push(ct);
  return byDay.map((times) => getClassTimeMask(times));
};

/**
 * timetable-picker 가 소비자에게 전달하는 수업 시간 형태 (v1 `class_time_json[]`).
 * `start` · `len` 은 08:00 부터의 교시(30분 단위)다. 시작은 내림, 끝은 올림.
 * 계산식 출처: snutt-v2 `v1compat/.../LegacyTimetableDtos.kt` (`startPeriod` · `endPeriod`)
 */
export type SharedClassTime = {
  day: number;
  /** 장소가 없으면 '' (v1 과 같다) */
  place: string;
  startMinute: number;
  endMinute: number;
  /** 'HH:MM' */
  start_time: string;
  end_time: string;
  len: number;
  start: number;
  // lectureBuildings: v1 시간표 응답에도 없다 (2026-11-14 dev 확인)
};

/**
 * timetable-picker 가 소비자에게 전달하는 강의 형태.
 * 레거시 picker 는 v1 `GET /v1/tables/:id` 의 강의에서 `_id` · `color` · `colorIndex` 만 뺀 것을 보낸다.
 * 키 이름 · 순서 · 값은 그것과 같다. `class_time_mask` 만 v1 응답에 없는 것을 더 보낸다(옛 v1 에는 있었다).
 * 값이 없는 필드는 키를 뺀다 (v1 응답과 같다).
 */
export type SharedLecture = {
  academic_year?: string;
  category?: string;
  class_time_json: SharedClassTime[];
  class_time_mask: number[];
  classification?: string;
  credit?: number;
  department?: string;
  instructor?: string;
  lecture_number?: string;
  quota?: number;
  freshman_quota?: number;
  remark?: string;
  course_number?: string;
  course_title: string;
  lecture_id?: string;
  snuttEvLecture?: { evLectureId: number };
  categoryPre2025?: string;
};

/**
 * v1 시간표에서 `_id` · `user_id` · `updated_at` · `theme` · `themeId` 를 뺀 것.
 * 레거시 picker 는 사용자 테마 시간표면 `themeId` 가 따라갔지만, 테마 정보를 빼려던 의도라 보내지 않는다.
 */
export type SharedTimetable = {
  year: number;
  semester: Term;
  lecture_list: SharedLecture[];
  title: string;
  isPrimary: boolean;
};

export type PickerMessage = {
  type: typeof PICKER_MESSAGE_TYPE;
  payload: SharedTimetable;
};

const PERIOD_START_MINUTE = 8 * 60; // 1교시 08:00 (0 교시)

const toPeriod = (minute: number, round: (x: number) => number) => round(((minute - PERIOD_START_MINUTE) / 60) * 2) / 2;

const formatHHMM = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

/** 수업 시간 하나를 SharedClassTime 으로 변환한다 */
const toSharedClassTime = ({ day, place, startMinute, endMinute }: ClassTime): SharedClassTime => {
  const start = toPeriod(startMinute, Math.floor);
  return {
    day,
    place: place ?? '',
    startMinute,
    endMinute,
    start_time: formatHHMM(startMinute),
    end_time: formatHHMM(endMinute),
    len: toPeriod(endMinute, Math.ceil) - start,
    start,
  };
};

/** 값이 null 이면 키를 뺀다 */
const optional = <K extends string, V>(key: K, value: V | null) =>
  (value === null ? {} : { [key]: value }) as Partial<Record<K, V>>;

/** domain Timetable → SharedTimetable (소비자 계약 형태) */
export const toSharedTimetable = (timetable: Timetable): SharedTimetable => ({
  year: timetable.semester.year,
  semester: timetable.semester.term,
  lecture_list: timetable.lectures.map((lecture): SharedLecture => ({
    ...optional('academic_year', lecture.academicYear),
    ...optional('category', lecture.category),
    class_time_json: lecture.classTimes.map(toSharedClassTime),
    class_time_mask: buildClassTimeMask(lecture.classTimes),
    ...optional('classification', lecture.classification),
    ...optional('credit', lecture.credit),
    ...optional('department', lecture.department),
    ...optional('instructor', lecture.instructor),
    ...optional('lecture_number', lecture.lectureNumber),
    ...optional('quota', lecture.quota),
    ...optional('freshman_quota', lecture.freshmanQuota),
    ...optional('remark', lecture.remark),
    ...optional('course_number', lecture.courseNumber),
    course_title: lecture.title,
    ...optional('lecture_id', lecture.lectureId),
    ...optional('snuttEvLecture', lecture.courseId === null ? null : { evLectureId: Number(lecture.courseId) }),
    ...optional('categoryPre2025', lecture.categoryPre2025),
  })),
  title: timetable.title,
  isPrimary: timetable.isPrimary,
});

/** postMessage 로 보낼 메시지 객체를 만든다 */
export const createPickerMessage = (timetable: Timetable): PickerMessage => ({
  type: PICKER_MESSAGE_TYPE,
  payload: toSharedTimetable(timetable),
});
