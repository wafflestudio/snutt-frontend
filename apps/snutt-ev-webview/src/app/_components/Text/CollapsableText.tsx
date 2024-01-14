'use client';

import { useMemo, useState } from 'react';

import { classNames } from '@/utils/classNames';

import { Text } from '.';
import styles from './index.module.css';

interface Props {
  text: string;
  truncBy?: number;
  className?: string;
}

export const CollapsableText = ({ text, truncBy = 120, className }: Props) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const renderedText = useMemo(() => {
    if (text.length <= truncBy || isExpanded) {
      return text;
    }

    return `${text.slice(0, truncBy)}...`;
  }, [isExpanded, text, truncBy]);

  return (
    <Text className={classNames(className, styles.collapsableText)}>
      {renderedText}
      {text.length > truncBy && (
        <span
          className={styles.moreLessButton}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((isExpanded) => !isExpanded);
          }}
        >
          {isExpanded ? ' 접기' : ' 더보기'}
        </span>
      )}
      <span></span>
    </Text>
  );
};
