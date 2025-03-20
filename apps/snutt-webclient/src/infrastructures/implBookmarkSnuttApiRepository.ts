import { type SnuttApi } from '@sf/snutt-api';

import { type getBookmarkService } from '@/usecases/bookmarkService';

export const implBookmarkSnuttApiRepository = ({
  snuttApi,
}: {
  snuttApi: SnuttApi;
}): Parameters<typeof getBookmarkService>[0]['bookmarkRepository'] => {
  return {
    getBookmarkLectures: async ({ token, year, semester }) => {
      const { status, data } = await snuttApi['GET /v1/bookmarks']({
        token,
        query: { year: `${year}`, semester: `${semester}` },
      });

      if (status === 200)
        return {
          type: 'success',
          data: data.lectures.map((l) => ({
            _id: l._id,
            class_time_json: l.class_time_json,
            course_title: l.course_title,
            instructor: l.instructor,
            credit: l.credit,
            course_number: l.course_number,
            academic_year: l.academic_year,
            lecture_number: l.lecture_number,
            category: l.category,
            classification: l.classification,
            department: l.department,
            remark: l.remark,
            year: data.year,
            semester: (() => {
              if (data.semester === 1 || data.semester === 2 || data.semester === 3 || data.semester === 4)
                return data.semester;
              throw new Error('invalid semester');
            })(),
          })),
        };

      return { type: 'error', errcode: data.errcode };
    },

    addBookmark: async ({ token, lectureId }) => {
      const { status, data } = await snuttApi['POST /v1/bookmarks/lecture']({
        token,
        body: { lecture_id: lectureId },
      });

      if (status === 200) return { type: 'success' };
      return { type: 'error', errcode: data.errcode };
    },

    removeBookmark: async ({ token, lectureId }) => {
      const { status, data } = await snuttApi['DELETE /v1/bookmarks/lecture']({
        token,
        body: { lecture_id: lectureId },
      });

      if (status === 200) return { type: 'success' };
      return { type: 'error', errcode: data.errcode };
    },
  };
};
