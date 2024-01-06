import { HttpClient } from '@/clients/HttpClient';
import { Lecture } from '@/entities/Lecture';
import { LectureRepository } from '@/repositories/LectureRepository';

export const createLectureRepository = ({ httpClient }: { httpClient: HttpClient }): LectureRepository => {
  return {
    listLatestLectures: async ({ filter }) => {
      const params = new URLSearchParams();

      if (filter) params.append('filter', filter);

      const response = await httpClient.get<{ content: Lecture[]; totalCount: number }>(
        `/v1/users/me/lectures/latest?${params}`,
      );
      return response;
    },
  };
};
