import Link from 'next/link';

import { CarouselCard } from '@/app/_components/Lecture/Carousel/Card';
import { Text } from '@/app/_components/Text';
import { Lecture } from '@/entities/Lecture';

import styles from './index.module.css';

export const MainPageRecentSection = ({ lectures }: { lectures: Lecture[] }) => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <Text>지난 학기 강의평을 남겨주세요</Text>
        <Link href="/recent" data-testid="main-recent-more-link">
          <Text>강의 목록 {'>'}</Text>
        </Link>
      </div>
      <div className={styles.carousel}>
        {lectures.map((lecture) => (
          <CarouselCard key={lecture.id} lecture={lecture} />
        ))}
      </div>
    </section>
  );
};
