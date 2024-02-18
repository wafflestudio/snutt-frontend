import SvgPersonBlack from '@/assets/icons/SvgPersonBlack';
import SvgTagBlack from '@/assets/icons/SvgTagBlack';
import SvgWrite from '@/assets/icons/SvgWrite';
import { Lecture } from '@/entities/Lecture';

import { Box } from '../Box';
import styles from './index.module.css';

interface Props {
  lecture: Lecture;
}

export const LectureCard = ({ lecture }: Props) => {
  return (
    <Box className={styles.wrapper}>
      <div className={styles.lectureBasic}>
        <h2 className={styles.lectureTitle}>{lecture.title}</h2>
      </div>
      {/* TODO 마크업 구조 확인 */}
      <div className={styles.lectureDetail}>
        <div className={styles.left}>
          <div className={styles.icons}>
            <SvgTagBlack className={styles.tag} height={15} width={15} />
            <SvgPersonBlack className={styles.person} height={15} width={15} />
          </div>
          <div className={styles.texts}>
            <p className={styles.info}>
              {lecture.department}, {lecture.academicYear}
            </p>
            <p className={styles.info}>{lecture.instructor}</p>
          </div>
        </div>

        <div className={styles.right}>
          <button className={styles.writeButton}>
            <SvgWrite className={styles.pencil} height={30} width={30} />
          </button>
        </div>
      </div>
    </Box>
  );
};
