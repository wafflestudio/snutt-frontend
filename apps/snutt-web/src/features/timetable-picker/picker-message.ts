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
 * timetable-picker 가 소비자에게 전달하는 강의 형태.
 * 내부 식별자(TimetableLectureId)·색상은 제거하고, 소비자에게 필요한 필드만 남긴다.
 * 값이 없는 필드는 키를 뺀다 (레거시 undefined 와 동일).
 */
export type SharedClassTime = {
  day: number;
  place?: string;
  startMinute: number;
  endMinute: number;
  len: number;
  start: number;
  // lectureBuildings: v2 응답에 없으므로 포함하지 않는다
};

export type SharedLecture = {
  course_title: string;
  instructor?: string;
  credit?: number;
  class_time_json: SharedClassTime[];
  remark?: string;
  class_time_mask: number[];
  lecture_id?: string;
  course_number?: string;
  classification?: string;
  department?: string;
  academic_year?: string;
  category?: string;
  quota?: number;
  lecture_number?: string;
};

export type SharedTimetable = {
  title: string;
  year: number;
  semester: Term;
  lecture_list: SharedLecture[];
};

export type PickerMessage = {
  type: typeof PICKER_MESSAGE_TYPE;
  payload: SharedTimetable;
};

/** 수업 시간 하나를 SharedClassTime 으로 변환한다 */
const toSharedClassTime = ({ day, place, startMinute, endMinute }: ClassTime): SharedClassTime => ({
  day,
  ...(place ? { place } : {}),
  startMinute,
  endMinute,
  len: (endMinute - startMinute) / 60,
  start: startMinute / 60,
});

/**
 * domain Timetable → SharedTimetable (소비자 계약 형태).
 * 키 순서와 undefined 처리는 레거시와 동일하다.
 */
export const toSharedTimetable = (timetable: Timetable): SharedTimetable => ({
  title: timetable.title,
  year: timetable.semester.year,
  semester: timetable.semester.term,
  lecture_list: timetable.lectures.map((lecture): SharedLecture => ({
    course_title: lecture.title,
    ...(lecture.instructor !== null ? { instructor: lecture.instructor } : {}),
    ...(lecture.credit !== null ? { credit: lecture.credit } : {}),
    class_time_json: lecture.classTimes.map(toSharedClassTime),
    ...(lecture.remark !== null ? { remark: lecture.remark } : {}),
    class_time_mask: buildClassTimeMask(lecture.classTimes),
    ...(lecture.lectureId !== null ? { lecture_id: lecture.lectureId } : {}),
    ...(lecture.courseNumber !== null ? { course_number: lecture.courseNumber } : {}),
    ...(lecture.classification !== null ? { classification: lecture.classification } : {}),
    ...(lecture.department !== null ? { department: lecture.department } : {}),
    ...(lecture.academicYear !== null ? { academic_year: lecture.academicYear } : {}),
    ...(lecture.category !== null ? { category: lecture.category } : {}),
    ...(lecture.quota !== null ? { quota: lecture.quota } : {}),
    ...(lecture.lectureNumber !== null ? { lecture_number: lecture.lectureNumber } : {}),
  })),
});

/** postMessage 로 보낼 메시지 객체를 만든다 */
export const createPickerMessage = (timetable: Timetable): PickerMessage => ({
  type: PICKER_MESSAGE_TYPE,
  payload: toSharedTimetable(timetable),
});
