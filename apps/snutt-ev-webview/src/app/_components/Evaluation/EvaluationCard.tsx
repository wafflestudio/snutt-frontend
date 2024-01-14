import { Box } from '@/app/_components/Box';
import { Evaluation } from '@/entities/Evaluation';

import { CollapsableText } from '../Text/CollapsableText';
import styles from './index.module.css';
import { LikeButton } from './LikeButton/LikeButton';
import { Rating } from './Ratings/Ratings';

// TODO reactQuery 적용 (invalidate, mutaiton 등)
export const EvaluationCard = ({ evaluation }: { evaluation: Evaluation }) => {
  return (
    <Box className={styles.wrapper}>
      <div className={styles.contents}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.lectureName}>{evaluation.lecture.title}</h3>
            <div className={styles.rating}>
              <Rating rating={evaluation.rating} size={12} />
              <p className={styles.semester}>
                {evaluation.year}년 {evaluation.semester}학기
              </p>
            </div>
          </div>
          <p className={styles.instructor}>{evaluation.lecture.instructor}</p>
        </div>
        <div>
          <CollapsableText text={evaluation.content} />
        </div>
        <div className={styles.likeWrapper}>
          <p className={styles.likeText}>강의평이 도움이 되었나요?</p>
          {/* TODO optimistic 구현 */}
          <LikeButton evaluation={evaluation} />
        </div>
      </div>
    </Box>
  );
};
