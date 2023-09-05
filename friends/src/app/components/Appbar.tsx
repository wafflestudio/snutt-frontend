import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useThemeContext } from '../contexts/ThemeContext';
import { Paper } from './Paper';
import { Typography } from './Typography';

type Props = { title: ReactNode; left?: ReactNode; right?: ReactNode };

export const AppBar = ({ title, left, right }: Props) => {
  const borderBottomColor = useThemeContext(({ color }) => color.border.appBar);

  return (
    <Paper style={{ ...styles.container, borderBottomColor }}>
      <View style={styles.left}>{left}</View>
      <View style={styles.center}>{title}</View>
      <View style={styles.right}>{right}</View>
    </Paper>
  );
};

AppBar.Title = ({ children }: { children: string }) => <Typography style={styles.title}>{children}</Typography>;

const sideStyle: ViewStyle = { width: 60, display: 'flex', alignItems: 'center', flexDirection: 'row' };
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    height: 45,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  left: { ...sideStyle, justifyContent: 'flex-start', paddingLeft: 13 },
  center: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
  right: { ...sideStyle, justifyContent: 'flex-end', paddingRight: 17 },

  title: { fontSize: 17 },
});
