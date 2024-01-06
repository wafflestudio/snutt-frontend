import { LectureRepository } from '@/repositories/LectureRepository';
import { LectureService } from '@/usecases/LectureService';

export const createLectureService = ({
  lectureRepository,
}: {
  lectureRepository: LectureRepository;
}): LectureService => {
  return {
    getRecentSectionLectures: async () => {
      const response = await lectureRepository.listLatestLectures({ filter: 'no-my-evaluations' });
      return response;
    },
  };
};
