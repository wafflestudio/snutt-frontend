import { Lecture } from '@/entities/Lecture';

export type LectureService = {
  getRecentSectionLectures: () => Promise<{ content: Lecture[] }>;
};
