import { type SnuttApi } from '@sf/snutt-api';

import { type getSemesterService } from '@/usecases/semesterService';

export const implSemesterSnuttApiRepository = ({
  snuttApi,
}: {
  snuttApi: SnuttApi;
}): Parameters<typeof getSemesterService>[0]['semesterRepository'] => {
  return {
    getCourseBooks: async ({ token }) => {
      const { status, data } = await snuttApi['GET /v1/course_books']({ token });
      if (status === 200)
        return {
          type: 'success',
          data: data.map((cb) => {
            if (cb.semester !== 1 && cb.semester !== 2 && cb.semester !== 3 && cb.semester !== 4)
              throw new Error('invalid semester');

            return {
              year: cb.year,
              semester: cb.semester,
              updatedAt: new Date(cb.updated_at),
            };
          }),
        };

      return { type: 'error', errcode: data.errcode };
    },
  };
};
