import SvgStarSmallEmpty from '@/assets/icons/SvgStarSmallEmpty';
import SvgStarSmallFilled from '@/assets/icons/SvgStarSmallFilled';
import SvgStarSmallHalf from '@/assets/icons/SvgStarSmallHalf';

import styles from './index.module.css';

interface Props {
  rating: number;
  size: number;
}

const TOTAL_STAR_COUNTS = 5;

export const Rating = ({ rating, size }: Props) => {
  const fullStarCounts = Math.floor(rating);
  const halfStarCounts = Math.ceil(rating % 1);
  const emptyStartCounts = TOTAL_STAR_COUNTS - (fullStarCounts + halfStarCounts);

  const stars = [
    ...Array(fullStarCounts).fill(<SvgStarSmallFilled width={size} height={size} />),
    ...Array(halfStarCounts).fill(<SvgStarSmallHalf width={size} height={size} />),
    ...Array(emptyStartCounts).fill(<SvgStarSmallEmpty width={size} height={size} />),
  ];

  return <div className={styles.wrapper}>{stars}</div>;
};
