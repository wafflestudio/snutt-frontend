import dayjs from 'dayjs';
import { http } from 'msw';

import type { SignInResponse } from '@/entities/auth';
import type { Color } from '@/entities/color';
import type { CoreServerError } from '@/entities/error';
import type { Notification } from '@/entities/notification';
import type { SearchFilter, SearchResultLecture } from '@/entities/search';
import type { CourseBook, Semester } from '@/entities/semester';
import type { FullTimetable, Timetable } from '@/entities/timetable';
import { mockVividIos } from '@/mocks/fixtures/color';
import { mockCourseBooks } from '@/mocks/fixtures/courseBook';
import { mockNotification } from '@/mocks/fixtures/notification';
import { mockSearchResult } from '@/mocks/fixtures/search';
import { mockTags } from '@/mocks/fixtures/tag';
import {
  mockTimeTable,
  mockTimeTable123,
  mockTimeTable456,
  mockTimeTable789,
  mockTimeTable101112,
  mockTimeTables,
} from '@/mocks/fixtures/timetable';
import { mockUsers } from '@/mocks/fixtures/user';
import type { SearchRepository } from '@/repositories/searchRepository';
import type { TimetableRepository } from '@/repositories/timetableRepository';
import type { UserRepository } from '@/repositories/userRepository';

import { withValidateAccess } from '../utils/access';

export const handlers = [
  http.get<never, never, CourseBook[] | CoreServerError>(
    `*/v1/course_books`,
    withValidateAccess(() => ({ type: 'success', body: mockCourseBooks }), { token: false }),
  ),

  http.get<never, never, Timetable[] | CoreServerError>(
    `*/v1/tables`,
    withValidateAccess(() => ({ type: 'success', body: mockTimeTables })),
  ),

  http.get<{ id: string }, never, FullTimetable | CoreServerError>(
    `*/v1/tables/:id`,
    withValidateAccess(({ params }) => {
      const { id } = params;

      if (id === '123') return { type: 'success', body: mockTimeTable123 };
      if (id === '456') return { type: 'success', body: mockTimeTable456 };
      if (id === '789') return { type: 'success', body: mockTimeTable789 };
      if (id === '101112') return { type: 'success', body: mockTimeTable101112 };

      return { type: 'success', body: mockTimeTable };
    }),
  ),

  http.put<{ id: string }, { title: string }, Timetable[] | CoreServerError>(
    `*/v1/tables/:id`,
    withValidateAccess(({ params: { id }, body: { title } }) => {
      if (mockTimeTables.every((t) => t._id !== id))
        return { type: 'error', body: { ext: {}, errcode: -1, message: '' }, status: 404 };
      return { type: 'success', body: mockTimeTables.map((t) => (t._id === id ? { ...t, title } : t)) };
    }),
  ),

  http.get<never, never, { message: 'ok'; colors: Color[]; names: string[] } | CoreServerError>(
    `*/v1/colors/vivid_ios`,
    withValidateAccess(() => ({ type: 'success', body: mockVividIos }), { token: false }),
  ),

  http.get<
    { year: string; semester: `${1 | 2 | 3 | 4}` },
    never,
    Awaited<ReturnType<SearchRepository['getTags']> | CoreServerError>
  >(
    `*/v1/tags/:year/:semester`,
    withValidateAccess(
      ({ params: { year, semester } }) => {
        if (!mockCourseBooks.some((cb) => cb.year === Number(year) && cb.semester === Number(semester)))
          return { type: 'error', body: { errcode: 16384, message: 'not found', ext: {} }, status: 404 };

        return { type: 'success', body: mockTags };
      },
      { token: false },
    ),
  ),

  http.get<never, never, Awaited<ReturnType<UserRepository['getUserInfo']> | CoreServerError>>(
    `*/v1/user/info`,
    withValidateAccess(({ token }) => {
      const user = mockUsers.find((u) => u.auth.token === token);

      if (!user) return { type: 'error', body: { errcode: 8194, ext: {}, message: '' }, status: 403 };

      return { type: 'success', body: user.info };
    }),
  ),

  http.get<never, never, { count: number } | CoreServerError>(
    `*/v1/notification/count`,
    withValidateAccess(() => ({ type: 'success', body: { count: 3 } })),
  ),

  http.get<never, never, Notification[] | CoreServerError>(
    `*/v1/notification`,
    withValidateAccess(() => ({ type: 'success', body: mockNotification })),
  ),

  http.post<never, Partial<SearchFilter>, SearchResultLecture[] | CoreServerError>(
    `*/v1/search_query`,
    withValidateAccess(() => ({ type: 'success', body: mockSearchResult }), { token: false }),
  ),

  http.post<never, { title: string; year: number; semester: Semester }, Timetable[] | CoreServerError>(
    `*/v1/tables`,
    withValidateAccess(({ body }) => {
      try {
        const { title, year, semester } = body;

        if (mockTimeTables.some((tt) => tt.title === title && tt.year === year && tt.semester === semester))
          return {
            type: 'error',
            body: { errcode: 12291, message: 'duplicate timetable title', ext: {} },
            status: 403,
          };

        const _id = `${Math.random()}`;
        const newTimetable = { _id, year, semester, title, total_credit: 0, updated_at: dayjs().format() };

        return { type: 'success', body: mockTimeTables.concat(newTimetable) };
      } catch (err) {
        return { type: 'error', status: 400, body: { errcode: -1, message: '', ext: {} } };
      }
    }),
  ),

  http.put<
    Parameters<TimetableRepository['updateLecture']>[0],
    Parameters<TimetableRepository['updateLecture']>[1],
    FullTimetable | CoreServerError
  >(
    `*/v1/tables/:id/lecture/:lecture_id`,
    withValidateAccess(({ body: { class_time_json } }) => {
      // TODO: 시간표 validation ?
      if (class_time_json && !Array.isArray(class_time_json))
        return { type: 'error', status: 400, body: { ext: {}, errcode: -1, message: '' } };

      const classTimeJson = class_time_json as { start_time: string; end_time: string; day: number }[] | undefined;
      if (classTimeJson?.some((c1, i1) => classTimeJson.some((c2, i2) => i1 !== i2 && isOverlap(c1, c2))))
        return {
          type: 'error',
          status: 403,
          body: { errcode: 12300, message: 'Lecture time overlapped', ext: { confirm_message: '' } },
        };

      return { type: 'success', body: mockTimeTable123 };
    }),
  ),

  http.post<
    Parameters<TimetableRepository['updateLecture']>[0],
    Parameters<TimetableRepository['updateLecture']>[1],
    FullTimetable | CoreServerError
  >(
    `*/v1/tables/:id/lecture`,
    withValidateAccess(({ body: { class_time_json } }) => {
      // TODO: 시간표 validation ?
      if (!class_time_json || !Array.isArray(class_time_json))
        return { type: 'error', status: 400, body: { ext: {}, errcode: -1, message: '' } };

      const classTimeJson = class_time_json as { start_time: string; end_time: string; day: number }[];
      if (classTimeJson.some((c1, i1) => classTimeJson.some((c2, i2) => i1 !== i2 && isOverlap(c1, c2))))
        return {
          type: 'error',
          status: 403,
          body: { errcode: 12300, message: 'Lecture time overlapped', ext: { confirm_message: '' } },
        };

      return { type: 'success', body: mockTimeTable123 };
    }),
  ),

  http.delete<{ id: string }, never, Timetable[] | CoreServerError>(
    `*/v1/tables/:id`,
    withValidateAccess(() => ({ type: 'success', body: mockTimeTables })),
  ),

  http.delete<{ id: string; lectureId: string }, never, FullTimetable | CoreServerError>(
    `*/v1/tables/:id/lecture/:lectureId`,
    withValidateAccess(() => ({ type: 'success', body: mockTimeTable123 }), { token: false }),
  ),

  http.post<{ id: string; lectureId: string }, never, FullTimetable | CoreServerError>(
    `*/v1/tables/:id/lecture/:lectureId`,
    withValidateAccess(({ params: { id, lectureId } }) => {
      const table = id === '123' ? mockTimeTable123 : id === '456' ? mockTimeTable456 : mockTimeTable789;
      const lecture = mockSearchResult.find((item) => item._id === lectureId);

      if (
        table.lecture_list
          .flatMap((ll) => ll.class_time_json)
          .some((t1, i1) => lecture?.class_time_json.some((t2, i2) => i1 !== i2 && isOverlap(t1, t2)))
      )
        return { type: 'error', status: 403, body: { errcode: 12300, message: '', ext: {} } };

      return { type: 'success', body: mockTimeTable123 };
    }),
  ),

  http.post<never, { id: string; password: string }, SignInResponse | CoreServerError>(
    `*/v1/auth/login_local`,
    withValidateAccess(
      ({ body }) => {
        const { id, password } = body;
        const user = mockUsers.find((mockUser) => mockUser.info.local_id === id);

        if (!user) return { type: 'error', body: { errcode: 8196, message: '', ext: {} }, status: 403 };

        if (user.auth.password !== password)
          return { type: 'error', body: { errcode: 8197, message: '', ext: {} }, status: 403 };

        return { type: 'success', body: { token: user.auth.token, user_id: '여기뭐들어오는건지모르겠음' } };
      },
      { token: false },
    ),
  ),

  http.post<never, { email: string; message: string }, { message: 'ok' } | CoreServerError>(
    `*/v1/feedback`,
    withValidateAccess(() => ({ type: 'success', body: { message: 'ok' } }), { token: false }),
  ),

  http.post<
    never,
    { id: string; password: string },
    { message: 'ok'; token: string; user_id: string } | CoreServerError
  >(
    `*/v1/auth/register_local`,
    withValidateAccess(
      ({ body: { id } }) => {
        if (mockUsers.some((u) => u.info.local_id === id))
          return { type: 'error', body: { errcode: 12290, message: 'duplicate id', ext: {} }, status: 403 };

        return { type: 'success', body: { message: 'ok', token: 't1', user_id: '뭐냐이건' } };
      },
      { token: false },
    ),
  ),

  http.delete<never, never, { message: 'ok' } | CoreServerError>(
    `*/v1/user/account`,
    withValidateAccess(({ token }) => {
      if (mockUsers.every((u) => u.auth.token !== token))
        return { type: 'error', body: { errcode: -1, message: '', ext: {} }, status: 403 };

      return { type: 'success', body: { message: 'ok' } };
    }),
  ),

  http.post<never, { email: string }, { message: 'ok' } | CoreServerError>(
    `*/v1/auth/id/find`,
    withValidateAccess(
      ({ body: { email } }) => {
        if (!email)
          return {
            type: 'error',
            body: { errcode: 0x1018, message: '이메일을 입력해주세요.', ext: {} },
            status: 400,
          };

        if (mockUsers.every((u) => u.info.email !== email))
          return {
            type: 'error',
            body: { errcode: 0x4004, message: '해당 이메일로 가입된 사용자가 없습니다.', ext: {} },
            status: 404,
          };

        return { type: 'success', body: { message: 'ok' } };
      },
      { token: false },
    ),
  ),

  http.post<never, { user_id: string }, { email: string } | CoreServerError>(
    `*/v1/auth/password/reset/email/check`,
    withValidateAccess(
      ({ body: { user_id: userId } }) => {
        if (!userId)
          return {
            type: 'error',
            body: { errcode: 0x1015, message: '등록된 이메일이 없습니다.', ext: {} },
            status: 400,
          };

        const foundUser = mockUsers.find((u) => u.info.local_id === userId);

        if (!foundUser)
          return {
            type: 'error',
            body: { errcode: 0x4004, message: '해당 아이디로 가입된 사용자가 없습니다.', ext: {} },
            status: 404,
          };

        const email = foundUser.info.email;

        if (!email)
          return {
            type: 'error',
            body: { errcode: 0x4006, message: '등록된 이메일이 없습니다.', ext: {} },
            status: 404,
          };

        return { type: 'success', body: { email } };
      },
      { token: false },
    ),
  ),

  http.post<never, { user_email: string }, { message: 'ok' } | CoreServerError>(
    `*/v1/auth/password/reset/email/send`,
    withValidateAccess(() => ({ type: 'success', body: { message: 'ok' } }), { token: false }),
  ),

  http.post<never, { user_email: string }, { message: 'ok' } | CoreServerError>(
    `*/v1/auth/password/reset/verification/code`,
    withValidateAccess(
      ({ cookies }) => {
        type Status = 'expired' | 'no' | 'wrong' | 'success';

        const status = (cookies.TEST_AUTH_PASSWORD_RESET_STATUS ?? 'success') as Status;

        if (status === 'no') return { type: 'error', body: { errcode: 0x2009, message: '', ext: {} }, status: 409 };
        if (status === 'expired')
          return { type: 'error', body: { errcode: 0x2010, message: '', ext: {} }, status: 401 };
        if (status === 'wrong') return { type: 'error', body: { errcode: 0x2011, message: '', ext: {} }, status: 401 };

        return { type: 'success', body: { message: 'ok' } };
      },
      { token: false },
    ),
  ),

  http.post<never, { user_id: string; password: string }, { message: 'ok' } | CoreServerError>(
    `*/v1/auth/password/reset`,
    withValidateAccess(() => ({ type: 'success', body: { message: 'ok' } }), { token: false }),
  ),

  http.put<never, { old_password: string; new_password: string }, { token: string } | CoreServerError>(
    `*/v1/user/password`,
    withValidateAccess(({ token, body: { old_password: oldPassword } }) => {
      if (!token) return { type: 'error', status: 403, body: { errcode: -1, message: '', ext: {} } };

      const user = mockUsers.find((u) => u.auth.token === token);
      if (!user) return { type: 'error', status: 403, body: { errcode: -1, message: '', ext: {} } };
      if (user.auth.password !== oldPassword)
        return { type: 'error', status: 403, body: { errcode: -1, message: '', ext: {} } };

      return { type: 'success', body: { token } };
    }),
  ),

  http.post<never, { id: string; password: string }, { token: string } | CoreServerError>(
    `*/v1/user/password`,
    withValidateAccess(({ token, body: { id } }) => {
      if (!token) return { type: 'error', status: 403, body: { errcode: -1, message: '', ext: {} } };

      if (mockUsers.every((u) => u.auth.token !== token))
        return { type: 'error', status: 403, body: { errcode: -1, message: '', ext: {} } };
      if (mockUsers.some((u) => u.info.local_id === id))
        return { type: 'error', status: 403, body: { errcode: 12290, message: 'duplicate id', ext: {} } };

      return { type: 'success', body: { token } };
    }),
  ),

  http.delete<never, never, { token: string } | CoreServerError>(
    `*/v1/user/facebook`,
    withValidateAccess(({ token }) => {
      const user = mockUsers.find((u) => u.auth.token === token);
      if (!user) return { type: 'error', status: 403, body: { errcode: -1, message: '', ext: {} } };

      return { type: 'success', body: { token: 't1' } };
    }),
  ),

  http.post<never, { fb_id: string; fb_token: string }, { token: string } | CoreServerError>(
    `*/v1/user/facebook`,
    withValidateAccess(({ token }) => {
      const user = mockUsers.find((u) => u.auth.token === token);
      if (!user) return { type: 'error', status: 403, body: { errcode: -1, message: '', ext: {} } };

      return { type: 'success', body: { token: 't5' } };
    }),
  ),
];

const isOverlap = (
  c1: { start_time: string; end_time: string; day: number },
  c2: { start_time: string; end_time: string; day: number },
) => {
  const toNumber = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };

  return (
    c1.day === c2.day &&
    (toNumber(c1.start_time) - toNumber(c2.end_time)) * (toNumber(c1.end_time) - toNumber(c2.start_time)) < 0
  );
};
