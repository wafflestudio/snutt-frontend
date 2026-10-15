import type { SnuttV2 } from '@sf/snutt-api';
import { http, HttpResponse } from 'msw';
import type { ColorPair, LectureColor } from '@/domain/color';
import type { ClassTime, TimetableLecture } from '@/domain/lecture';
import { isSameSemester, type Semester, type Term } from '@/domain/semester';
import { getTotalCredit, type Timetable } from '@/domain/timetable';
import { isOverlapping } from '@/domain/time';
import { problem } from './fixtures';
import { api } from './server';

type FakeSnuttOptions = {
  /** 처음 시간표. 고쳐도 원본은 바뀌지 않는다 */
  timetables: readonly Timetable[];
  /** 수강편람이 있는 학기 */
  semesters: readonly Semester[];
  /** 시간표들의 테마(themeId 가 같은 하나) 색 */
  palette: readonly ColorPair[];
};

/**
 * 메인 화면 테스트용 가짜 snutt 서버. 시간표를 메모리에 두고 v2 처럼 응답한다.
 * - ID 는 domain 의 문자열을 그대로 보낸다 (mapper 가 String() 으로 받으므로 결과가 같다)
 * - 기본 시간표는 학기마다 하나, 시간이 겹치는 강의는 isForced 없이 넣지 못한다
 */
export const fakeSnutt = ({ timetables, semesters, palette }: FakeSnuttOptions) => {
  let state: Timetable[] = structuredClone([...timetables]);
  let nextId = 1;

  /** 서버 ID 는 숫자지만 테스트에서는 문자열 ID 를 그대로 쓴다 */
  const asId = (id: string) => id as unknown as number;
  const toColorSet = ({ bg, fg }: ColorPair): SnuttV2.ColorSet => ({ backgroundColor: bg, foregroundColor: fg });
  const toColor = (request: { customColor?: SnuttV2.ColorSet | null; paletteIndex?: number | null }): LectureColor =>
    request.customColor
      ? { type: 'custom', color: { bg: request.customColor.backgroundColor, fg: request.customColor.foregroundColor } }
      : { type: 'palette', index: request.paletteIndex ?? 0 };
  const toClassTimes = (times: SnuttV2.ClassPlaceAndTime[]): ClassTime[] =>
    times.map(({ day, startMinute, endMinute, place }) => ({ day, startMinute, endMinute, place: place || null }));

  const toLectureResponse = (lecture: TimetableLecture): SnuttV2.TimetableLectureResponse => ({
    id: asId(lecture.id),
    lectureId: lecture.lectureId === null ? null : asId(lecture.lectureId),
    courseTitle: lecture.title,
    instructor: lecture.instructor,
    remark: lecture.remark,
    department: lecture.department,
    academicYear: lecture.academicYear,
    category: lecture.category,
    categoryPre2025: lecture.categoryPre2025,
    classification: lecture.classification,
    quota: lecture.quota,
    freshmanQuota: lecture.freshmanQuota,
    credit: lecture.credit,
    courseNumber: lecture.courseNumber,
    lectureNumber: lecture.lectureNumber,
    classPlaceAndTimes: lecture.classTimes.map(({ day, startMinute, endMinute, place }) => ({
      day,
      startMinute,
      endMinute,
      place: place ?? '',
    })),
    color: toColorSet(lecture.color.type === 'custom' ? lecture.color.color : palette[lecture.color.index]),
    customColor: lecture.color.type === 'custom' ? toColorSet(lecture.color.color) : null,
    paletteIndex: lecture.color.type === 'palette' ? lecture.color.index : 0,
  });

  const toBrief = (timetable: Timetable): SnuttV2.TimetableBriefResponse => ({
    id: asId(timetable.id),
    year: timetable.semester.year,
    semester: timetable.semester.term,
    title: timetable.title,
    isPrimary: timetable.isPrimary,
    updatedAt: timetable.updatedAt.getTime(),
    totalCredit: getTotalCredit(timetable.lectures),
  });

  const toResponse = (timetable: Timetable): SnuttV2.TimetableResponse => ({
    ...toBrief(timetable),
    themeId: asId(timetable.themeId),
    lectures: timetable.lectures.map(toLectureResponse),
  });

  const list = () => HttpResponse.json(state.map(toBrief));
  const notFound = () =>
    HttpResponse.json(problem(404, 'timetable-not-found', '시간표 없음', '존재하지 않는 시간표입니다'), {
      status: 404,
    });

  /** 시간표를 찾아 change 로 바꾸고 상세를 돌려준다 */
  const updateTimetable = (id: unknown, change: (timetable: Timetable) => Timetable) => {
    const target = state.find((timetable) => timetable.id === id);
    if (!target) return notFound();
    const next = { ...change(target), updatedAt: new Date() };
    state = state.map((timetable) => (timetable.id === id ? next : timetable));
    return HttpResponse.json(toResponse(next));
  };

  const conflict = (timetable: Timetable, classTimes: ClassTime[], exceptId?: string) =>
    timetable.lectures.some(
      (lecture) =>
        lecture.id !== exceptId &&
        lecture.classTimes.some((existing) => classTimes.some((time) => isOverlapping(existing, time))),
    );
  const conflictResponse = () =>
    HttpResponse.json(problem(409, 'lecture-time-overlap', '시간 겹침', '강의 시간이 서로 겹칩니다'), { status: 409 });

  const setPrimary = (id: unknown, isPrimary: boolean) => {
    const target = state.find((timetable) => timetable.id === id);
    if (!target) return notFound();
    state = state.map((timetable) =>
      isSameSemester(timetable.semester, target.semester)
        ? { ...timetable, isPrimary: timetable.id === id && isPrimary }
        : timetable,
    );
    return list();
  };

  const handlers = [
    http.get(api('/v2/coursebooks'), () =>
      HttpResponse.json(
        semesters.map(({ year, term }, index) => ({ id: index + 1, year, semester: term, updatedAt: 0 })),
      ),
    ),
    http.get(api('/v2/themes'), () =>
      HttpResponse.json([
        {
          id: asId(state[0]?.themeId ?? 'sample'),
          name: 'SNUTT',
          colors: palette.map(toColorSet),
          kind: 'BUILTIN',
          isDefault: false,
        } satisfies SnuttV2.ThemeResponse,
      ]),
    ),

    http.get(api('/v2/timetables'), list),
    // 마지막으로 고친 시간표 (같으면 목록의 앞쪽)
    http.get(api('/v2/timetables/recent'), () => {
      const latest = state.reduce<Timetable | null>(
        (found, timetable) => (found && found.updatedAt >= timetable.updatedAt ? found : timetable),
        null,
      );
      return latest ? HttpResponse.json(toResponse(latest)) : notFound();
    }),
    http.get(api('/v2/timetables/:timetableId'), ({ params }) => {
      const timetable = state.find(({ id }) => id === params.timetableId);
      return timetable ? HttpResponse.json(toResponse(timetable)) : notFound();
    }),
    http.post(api('/v2/timetables'), async ({ request }) => {
      const body = (await request.json()) as SnuttV2.TimetableAddRequest;
      state = [
        ...state,
        {
          id: `new-${nextId++}`,
          title: body.title,
          semester: { year: body.year, term: body.semester as Term },
          themeId: state[0]?.themeId ?? 'sample',
          isPrimary: false,
          updatedAt: new Date(),
          lectures: [],
        },
      ];
      return list();
    }),
    http.patch(api('/v2/timetables/:timetableId'), async ({ params, request }) => {
      const { title } = (await request.json()) as SnuttV2.TimetableModifyRequest;
      if (!state.some(({ id }) => id === params.timetableId)) return notFound();
      state = state.map((timetable) => (timetable.id === params.timetableId ? { ...timetable, title } : timetable));
      return list();
    }),
    http.delete(api('/v2/timetables/:timetableId'), ({ params }) => {
      if (!state.some(({ id }) => id === params.timetableId)) return notFound();
      state = state.filter(({ id }) => id !== params.timetableId);
      return list();
    }),
    http.put(api('/v2/timetables/:timetableId/primary'), ({ params }) => setPrimary(params.timetableId, true)),
    http.delete(api('/v2/timetables/:timetableId/primary'), ({ params }) => setPrimary(params.timetableId, false)),

    http.post(api('/v2/timetables/:timetableId/lectures/custom'), async ({ params, request }) => {
      const body = (await request.json()) as SnuttV2.CustomTimetableLectureAddRequest;
      const classTimes = toClassTimes(body.classPlaceAndTimes);
      const target = state.find(({ id }) => id === params.timetableId);
      if (target && !body.isForced && conflict(target, classTimes)) return conflictResponse();
      return updateTimetable(params.timetableId, (timetable) => ({
        ...timetable,
        lectures: [
          ...timetable.lectures,
          {
            id: `new-lecture-${nextId++}`,
            lectureId: null,
            title: body.courseTitle,
            instructor: body.instructor ?? null,
            credit: body.credit ?? null,
            remark: body.remark ?? null,
            classTimes,
            color: toColor(body),
            department: null,
            academicYear: null,
            category: null,
            categoryPre2025: null,
            classification: null,
            quota: null,
            freshmanQuota: null,
            courseNumber: null,
            lectureNumber: null,
          },
        ],
      }));
    }),
    http.patch(api('/v2/timetables/:timetableId/lectures/:lectureId'), async ({ params, request }) => {
      const body = (await request.json()) as SnuttV2.TimetableLectureModifyRequest;
      return updateTimetable(params.timetableId, (timetable) => ({
        ...timetable,
        lectures: timetable.lectures.map((lecture) =>
          lecture.id === params.lectureId
            ? {
                ...lecture,
                // null 은 "바꾸지 않음", 지우는 것은 resetFields (직접 추가한 강의라 null 이 된다)
                ...(body.courseTitle != null && { title: body.courseTitle }),
                ...(body.instructor != null && { instructor: body.instructor }),
                ...(body.credit != null && { credit: body.credit }),
                ...(body.remark != null && { remark: body.remark }),
                ...Object.fromEntries(
                  body.resetFields
                    .filter((field) => field === 'instructor' || field === 'credit' || field === 'remark')
                    .map((field) => [field, null]),
                ),
                ...(body.classPlaceAndTimes && { classTimes: toClassTimes(body.classPlaceAndTimes) }),
                // paletteIndex 를 받으면 직접 고른 색을 지운다
                ...(body.paletteIndex != null
                  ? { color: { type: 'palette' as const, index: body.paletteIndex } }
                  : body.customColor && { color: toColor(body) }),
              }
            : lecture,
        ),
      }));
    }),
    http.delete(api('/v2/timetables/:timetableId/lectures/:lectureId'), ({ params }) =>
      updateTimetable(params.timetableId, (timetable) => ({
        ...timetable,
        lectures: timetable.lectures.filter(({ id }) => id !== params.lectureId),
      })),
    ),
  ];

  return { handlers };
};
