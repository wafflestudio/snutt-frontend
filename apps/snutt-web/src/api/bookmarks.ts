import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lecture } from '@/domain/lecture';
import type { Semester } from '@/domain/semester';
import { callApi } from './client';
import { toLecture } from './mappers/timetable';

export const bookmarkQueries = {
  all: () => ['bookmarks'] as const,
  /** 학기의 관심강좌 */
  list: (semester: Semester) =>
    queryOptions({
      queryKey: [...bookmarkQueries.all(), semester.year, semester.term],
      queryFn: async () =>
        (
          await callApi('GET /v2/bookmarks', {
            query: { year: String(semester.year), semester: String(semester.term) },
          })
        ).lectures.map(toLecture),
    }),
};

// 관심강좌 추가 · 삭제는 본문 없이 성공한다. 이미 있는 것을 추가하거나 없는 것을 지워도 성공한다 (dev 서버에서 확인)
// 그래서 다시 받지 않고 보낸 강의로 목록을 고친다

export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lecture: Lecture) =>
      callApi('POST /v2/bookmarks/lectures/:lectureId', { params: { lectureId: lecture.id } }),
    onSuccess: (_, lecture) =>
      queryClient.setQueryData(bookmarkQueries.list(lecture.semester).queryKey, (list) =>
        list?.some(({ id }) => id === lecture.id) ? list : [...(list ?? []), lecture],
      ),
  });
};

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lecture: Lecture) =>
      callApi('DELETE /v2/bookmarks/lectures/:lectureId', { params: { lectureId: lecture.id } }),
    onSuccess: (_, lecture) =>
      queryClient.setQueryData(bookmarkQueries.list(lecture.semester).queryKey, (list) =>
        list?.filter(({ id }) => id !== lecture.id),
      ),
  });
};
