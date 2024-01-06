import { ElementType, HTMLAttributes } from 'react';

import { classNames } from '@/utils/classNames';

import styles from './index.module.css';

export const Text = ({
  className,
  children,
  as: Tag = 'p',
  ...props
}: HTMLAttributes<HTMLElement> & { as?: ElementType }) => {
  return (
    <Tag className={classNames(className, styles.box)} {...props}>
      {children}
    </Tag>
  );
};
