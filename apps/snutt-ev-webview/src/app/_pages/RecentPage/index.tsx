import { AppBar } from '@/app/_components/AppBar';
import { LectureCard } from '@/app/_components/Lecture/LectureCard';
import { getServerServices } from '@/app/utils/getServerServices';
import { groupByYearAndSemester } from '@/utils/lecture';

import styles from './index.module.css';

export const RecentPage = async () => {
  const { lectureService } = getServerServices();

  const { content: lectures } = await lectureService.getRecentSectionLectures();

  const grouppedLectures = groupByYearAndSemester(lectures);

  return (
    <div>
      <AppBar left={<p>logo</p>} title={<AppBar.Title title="최근 강의 목록" />} />
      {grouppedLectures.map(({ year, semester, lectures }) => {
        const title = `${year}년 ${semester}학기`;

        return (
          <div key={title}>
            <h2 className={styles.semesterTitle}>{title}</h2>
            {lectures.map((lecture) => (
              <LectureCard key={lecture.id} lecture={lecture} />
            ))}
          </div>
        );
      })}
      {!lectures?.length && <h1 className={styles.emptySemester}>최근 학기에 수강한 강의가 없습니다</h1>}
    </div>
  );
};
