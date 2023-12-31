import { ElementType, HTMLAttributes } from 'react';

import { classNames } from '@/utils/classNames';

import styles from './index.module.css';

export const Box = ({
  className,
  children,
  as: Tag = 'div',
  ...props
}: HTMLAttributes<HTMLElement> & { as?: ElementType }) => {
  return (
    <Tag className={classNames(className, styles.box)} {...props}>
      {children}
    </Tag>
  );
};
