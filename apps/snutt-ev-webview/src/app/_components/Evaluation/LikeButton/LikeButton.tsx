'use client';

import { getClientServices } from '@/app/utils/getClientServices';
import { SvgLike } from '@/assets/icons/SvgLike';
import { Evaluation } from '@/entities/Evaluation';
import { classNames } from '@/utils/classNames';

import styles from './index.module.css';

interface Props {
  evaluation: Evaluation;
}

export const LikeButton = ({ evaluation }: Props) => {
  const { evaluationService } = getClientServices();

  const onClickLikeButton = () => {
    evaluationService.updateEvalutionLike(evaluation.id, evaluation.isLiked);
  };

  return (
    <button
      className={classNames(styles.wrapper, evaluation.isLiked ? styles.isLiked : '')}
      onClick={(e) => {
        e.stopPropagation();
        onClickLikeButton();
      }}
    >
      <SvgLike className={classNames(styles.likeIcon, evaluation.isLiked ? styles.isLiked : '')} />
      <span>{evaluation.likeCount || 0}</span>
    </button>
  );
};
