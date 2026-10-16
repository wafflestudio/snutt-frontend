import type { SnuttV2 } from '@sf/snutt-api';
import type { ColorPair, LectureColor, Theme } from '@/domain/color';
import type { ClassTime, CustomLectureInput, Lecture, TimetableLecture } from '@/domain/lecture';
import type { Semester } from '@/domain/semester';
import type { Timetable, TimetableSummary } from '@/domain/timetable';

// v2 응답 → domain 타입. ID 는 문자열로 바꾸고, 응답에서 빠진 값은 null 로 채운다 (서버는 null 인 필드를 보내지 않는다)

export const toSemester = ({ year, semester }: { year: number; semester: 1 | 2 | 3 | 4 }): Semester => ({
  year,
  term: semester,
});

export const toColorPair = ({ backgroundColor, foregroundColor }: SnuttV2.ColorSet): ColorPair => ({
  bg: backgroundColor,
  fg: foregroundColor,
});

/** 직접 고른 색(customColor)이 있으면 그 색, 없으면 테마 팔레트의 paletteIndex 번째 색 (0부터) */
export const toLectureColor = ({
  customColor,
  paletteIndex,
}: Pick<SnuttV2.TimetableLectureResponse, 'customColor' | 'paletteIndex'>): LectureColor =>
  customColor ? { type: 'custom', color: toColorPair(customColor) } : { type: 'palette', index: paletteIndex };

export const toClassTime = ({ day, place, startMinute, endMinute }: SnuttV2.ClassPlaceAndTime): ClassTime => ({
  day,
  startMinute,
  endMinute,
  place: place || null,
});

export const toTimetableLecture = (lecture: SnuttV2.TimetableLectureResponse): TimetableLecture => ({
  id: String(lecture.id),
  lectureId: lecture.lectureId == null ? null : String(lecture.lectureId),
  title: lecture.courseTitle,
  instructor: lecture.instructor ?? null,
  remark: lecture.remark ?? null,
  classTimes: lecture.classPlaceAndTimes.map(toClassTime),
  department: lecture.department ?? null,
  academicYear: lecture.academicYear ?? null,
  category: lecture.category ?? null,
  categoryPre2025: lecture.categoryPre2025 ?? null,
  classification: lecture.classification ?? null,
  quota: lecture.quota ?? null,
  freshmanQuota: lecture.freshmanQuota ?? null,
  credit: lecture.credit ?? null,
  courseNumber: lecture.courseNumber ?? null,
  lectureNumber: lecture.lectureNumber ?? null,
  color: toLectureColor(lecture),
});

/** 수강편람 강의 (검색 결과, 관심강좌). 강의평이 없으면 avgRating 이 빠지고 evalCount 는 0 이다 */
export const toLecture = (lecture: SnuttV2.LectureResponse): Lecture => ({
  id: String(lecture.id),
  semester: toSemester(lecture),
  title: lecture.courseTitle,
  instructor: lecture.instructor ?? null,
  remark: lecture.remark ?? null,
  classTimes: lecture.classPlaceAndTimes.map(toClassTime),
  department: lecture.department ?? null,
  academicYear: lecture.academicYear ?? null,
  category: lecture.category ?? null,
  categoryPre2025: lecture.categoryPre2025 ?? null,
  classification: lecture.classification ?? null,
  quota: lecture.quota,
  freshmanQuota: lecture.freshmanQuota ?? null,
  credit: lecture.credit,
  courseNumber: lecture.courseNumber,
  lectureNumber: lecture.lectureNumber,
  evaluation: lecture.evaluationSummary
    ? { rating: lecture.evaluationSummary.avgRating ?? null, count: lecture.evaluationSummary.evalCount }
    : null,
});

export const toTimetableSummary = (timetable: SnuttV2.TimetableBriefResponse): TimetableSummary => ({
  id: String(timetable.id),
  title: timetable.title,
  semester: toSemester(timetable),
  totalCredit: timetable.totalCredit,
  isPrimary: timetable.isPrimary,
  updatedAt: new Date(timetable.updatedAt),
});

export const toTimetable = (timetable: SnuttV2.TimetableResponse): Timetable => ({
  id: String(timetable.id),
  title: timetable.title,
  semester: toSemester(timetable),
  themeId: String(timetable.themeId),
  isPrimary: timetable.isPrimary,
  updatedAt: new Date(timetable.updatedAt),
  lectures: timetable.lectures.map(toTimetableLecture),
});

export const toTheme = (theme: SnuttV2.ThemeResponse): Theme => ({
  id: String(theme.id),
  name: theme.name,
  colors: theme.colors.map(toColorPair),
});

// domain → v2 요청

const toColorSet = ({ bg, fg }: ColorPair): SnuttV2.ColorSet => ({ backgroundColor: bg, foregroundColor: fg });

/** 팔레트 색이면 paletteIndex, 직접 고른 색이면 customColor 를 보낸다. paletteIndex 를 받으면 서버가 customColor 를 지운다 */
export const toColorRequest = (color: LectureColor) =>
  color.type === 'palette'
    ? { paletteIndex: color.index, customColor: null }
    : { paletteIndex: null, customColor: toColorSet(color.color) };

const toClassPlaceAndTime = ({ day, startMinute, endMinute, place }: ClassTime): SnuttV2.ClassPlaceAndTime => ({
  day,
  startMinute,
  endMinute,
  place: place ?? '',
});

/** 시간이 겹치는 강의는 서버가 거절한다 (isForced: false). 겹칠 때 확인받고 넣는 흐름은 5-1 */
export const toCustomLectureRequest = (input: CustomLectureInput): SnuttV2.CustomTimetableLectureAddRequest => ({
  courseTitle: input.title,
  instructor: input.instructor,
  credit: input.credit,
  remark: input.remark,
  classPlaceAndTimes: input.classTimes.map(toClassPlaceAndTime),
  ...toColorRequest(input.color),
  isForced: false,
});

/**
 * 바뀐 필드만 보낸다 (CLAUDE.md "수정 요청(PATCH)은 사용자가 바꾼 필드만").
 * 이 요청에서 null 은 "바꾸지 않음"이라, 값을 지울 때는 resetFields 에 넣는다.
 * (직접 추가한 강의는 null 이 되고, 수강편람 강의는 수강편람 값으로 돌아간다. dev 서버에서 확인, 2026-10-15)
 */
export const toLectureModifyRequest = (change: Partial<CustomLectureInput>): SnuttV2.TimetableLectureModifyRequest => {
  const resetFields: SnuttV2.TimetableLectureModifyRequest['resetFields'] = [];
  const nullable = (key: 'instructor' | 'credit' | 'remark') => {
    if (!(key in change)) return {};
    if (change[key] === null) {
      resetFields.push(key);
      return {};
    }
    return { [key]: change[key] };
  };

  return {
    ...(change.title !== undefined && { courseTitle: change.title }),
    ...nullable('instructor'),
    ...nullable('credit'),
    ...nullable('remark'),
    ...(change.classTimes && { classPlaceAndTimes: change.classTimes.map(toClassPlaceAndTime) }),
    ...(change.color && toColorRequest(change.color)),
    resetFields,
    isForced: false,
  };
};
