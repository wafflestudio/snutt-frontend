import type { SnuttV2 } from '@sf/snutt-api';
import type { ColorPair, LectureColor, Theme } from '@/domain/color';
import type { ClassTime, TimetableLecture } from '@/domain/lecture';
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
