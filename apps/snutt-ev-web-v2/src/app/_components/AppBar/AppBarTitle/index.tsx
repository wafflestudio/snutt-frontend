import { Text } from '@/app/_components/Text';

import styles from './index.module.css';

export const AppBarTitle = ({ title }: { title: string }) => {
  return <Text className={styles.title}>{title}</Text>;
};
