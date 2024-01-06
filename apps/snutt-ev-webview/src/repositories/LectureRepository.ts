import { Lecture } from '@/entities/Lecture';

export type LectureRepository = {
  listLatestLectures: (req: { filter?: 'no-my-evaluations' }) => Promise<{ content: Lecture[]; totalCount: number }>;
};
