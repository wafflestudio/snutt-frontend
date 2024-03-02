import { SvgClockBlack } from '@/assets/icons/SvgClockBlack';
import SvgPersonBlack from '@/assets/icons/SvgPersonBlack';
import SvgTagBlack from '@/assets/icons/SvgTagBlack';
import SvgWrite from '@/assets/icons/SvgWrite';
import { Lecture } from '@/entities/Lecture';

import { Box } from '../../Box';
import styles from './index.module.css';

interface Props {
  lecture: Lecture;
}

export const CarouselCard = ({ lecture }: Props) => {
  return (
    <Box className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.lectureTitle}>{lecture.title}</h2>
        <button className={styles.writeButton}>
          <SvgWrite height={20} width={20} />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.icons}>
          <SvgTagBlack height={15} width={15} />
          <SvgPersonBlack height={15} width={15} />
          <SvgClockBlack height={15} width={15} />
        </div>
        <div className={styles.info}>
          <p className={styles.detail}>
            {lecture.department}, {lecture.academicYear}
          </p>
          <p className={styles.detail}>{lecture.instructor}</p>
          <p className={styles.detail}>{`${lecture.takenYear}년 ${lecture.takenSemester}학기`}</p>
        </div>
      </div>
    </Box>
  );
};
