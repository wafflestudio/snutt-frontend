import { ReactNode } from 'react';

import { AppBarTitle } from '@/app/_components/AppBar/AppBarTitle';

import styles from './index.module.css';

export const AppBar = ({ left, title, right }: { left: ReactNode; title?: ReactNode; right?: ReactNode }) => {
  return (
    <header className={styles.wrapper}>
      <div className={styles.left}>{left}</div>
      {title && <div className={styles.title}>{title}</div>}
      {right && <div className={styles.right}>{right}</div>}
    </header>
  );
};

AppBar.Title = AppBarTitle;
