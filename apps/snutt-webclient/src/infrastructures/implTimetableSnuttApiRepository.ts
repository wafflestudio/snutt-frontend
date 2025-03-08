import { type SnuttApi, type SnuttApiSuccessResponseData } from '@sf/snutt-api';

import type { FullTimetable, Timetable } from '@/entities/timetable';
import { type getTimetableService } from '@/usecases/timetableService';
import { convertToMinute } from '@/utils/time';

export const implTimetableSnuttApiRepository = ({
  snuttApi,
}: {
  snuttApi: SnuttApi;
}): Parameters<typeof getTimetableService>[0]['timetableRepository'] => {
  return {
    getTimetables: async ({ token }) => {
      const { status, data } = await snuttApi['GET /v1/tables']({ token });
      if (status === 200) return { type: 'success', data: data.map(timetableMapper) };
      return { type: 'error', errcode: data.errcode };
    },
    getFullTimetable: async ({ id, token }) => {
      const { status, data } = await snuttApi['GET /v1/tables/:timetableId']({ token, params: { timetableId: id } });
      if (status === 200) return { type: 'success', data: fullTimetableMapper(data) };
      return { type: 'error', errcode: data.errcode };
    },
    deleteTimetable: async ({ id, token }) => {
      const { status, data } = await snuttApi['DELETE /v1/tables/:timetableId']({ params: { timetableId: id }, token });
      if (status === 200) return { type: 'success', data: data.map(timetableMapper) };
      return { type: 'error', errcode: data.errcode };
    },
    createTimetable: async ({ token, title, year, semester }) => {
      const { status, data } = await snuttApi['POST /v1/tables']({ body: { title, year, semester }, token });
      if (status === 200) return { type: 'success', data: data.map(timetableMapper) };
      return { type: 'error', errcode: data.errcode };
    },
    updateLecture: async ({ id, lecture_id, token }, body) => {
      const { status, data } = await snuttApi['PUT /v1/tables/:timetableId/lecture/:timetableLectureId']({
        body: { ...body, is_forced: false },
        token,
        params: { timetableId: id, timetableLectureId: lecture_id },
      });
      if (status === 200) return { type: 'success', data: fullTimetableMapper(data) };
      return { type: 'error', errcode: data.errcode };
    },
    createLecture: async ({ id, token }, body) => {
      const { status, data } = await snuttApi['POST /v1/tables/:timetableId/lecture']({
        body: {
          ...body,
          is_forced: false,
          class_time_json: body.class_time_json.map((it) => ({
            ...it,
            startMinute: convertToMinute(it.start_time),
            endMinute: convertToMinute(it.end_time),
          })),
        },
        token,
        params: { timetableId: id },
      });
      if (status === 200) return { type: 'success', data: fullTimetableMapper(data) };
      return { type: 'error', errcode: data.errcode };
    },
    deleteLecture: async ({ id, lecture_id, token }) => {
      const { status, data } = await snuttApi['DELETE /v1/tables/:timetableId/lecture/:timetableLectureId']({
        token,
        params: { timetableId: id, timetableLectureId: lecture_id },
      });
      if (status === 200) return { type: 'success', data: fullTimetableMapper(data) };
      return { type: 'error', errcode: data.errcode };
    },
    addLecture: async ({ id, lecture_id, token }) => {
      const { status, data } = await snuttApi['POST /v1/tables/:timetableId/lecture/:timetableLectureId']({
        token,
        params: { timetableId: id, timetableLectureId: lecture_id },
      });
      if (status === 200) return { type: 'success', data: fullTimetableMapper(data) };
      return { type: 'error', errcode: data.errcode };
    },
    updateTimetable: async ({ id, token }, body) => {
      const { status, data } = await snuttApi['PUT /v1/tables/:timetableId']({
        body,
        token,
        params: { timetableId: id },
      });
      if (status === 200) return { type: 'success', data: data.map(timetableMapper) };
      return { type: 'error', errcode: data.errcode };
    },
  };
};

const timetableMapper = (timetable: SnuttApiSuccessResponseData<'GET /v1/tables'>[number]): Timetable => ({
  _id: timetable._id,
  title: timetable.title,
  year: timetable.year,
  semester: (() => {
    if (timetable.semester === 1 || timetable.semester === 2 || timetable.semester === 3 || timetable.semester === 4)
      return timetable.semester;
    throw new Error('Invalid semester');
  })(),
  total_credit: timetable.total_credit,
  updated_at: timetable.updated_at,
});

const fullTimetableMapper = (timetable: SnuttApiSuccessResponseData<'GET /v1/tables/:timetableId'>): FullTimetable => ({
  _id: timetable._id,
  title: timetable.title,
  year: timetable.year,
  semester: (() => {
    if (timetable.semester === 1 || timetable.semester === 2 || timetable.semester === 3 || timetable.semester === 4)
      return timetable.semester;
    throw new Error('Invalid semester');
  })(),
  theme: timetable.theme,
  updated_at: timetable.updated_at,
  user_id: timetable.user_id,
  lecture_list: timetable.lecture_list.map(lectureMapper),
});

const lectureMapper = (
  lecture: SnuttApiSuccessResponseData<'GET /v1/tables/:timetableId'>['lecture_list'][number],
): FullTimetable['lecture_list'][number] => ({
  _id: lecture._id,
  course_title: lecture.course_title,
  instructor: lecture.instructor,
  credit: lecture.credit,
  class_time_json: lecture.class_time_json,
  remark: lecture.remark,
  color: lecture.color,
  colorIndex: (() => {
    if (
      lecture.colorIndex === 0 ||
      lecture.colorIndex === 1 ||
      lecture.colorIndex === 2 ||
      lecture.colorIndex === 3 ||
      lecture.colorIndex === 4 ||
      lecture.colorIndex === 5 ||
      lecture.colorIndex === 6 ||
      lecture.colorIndex === 7 ||
      lecture.colorIndex === 8 ||
      lecture.colorIndex === 9
    )
      return lecture.colorIndex;
    throw new Error('Invalid colorIndex');
  })(),
  class_time_mask: lecture.class_time_mask,
  lecture_id: lecture.lecture_id,
  course_number: lecture.course_number,
  classification: lecture.classification,
  department: lecture.department,
  academic_year: lecture.academic_year,
  category: lecture.category,
  quota: lecture.quota,
  lecture_number: lecture.lecture_number,
});
