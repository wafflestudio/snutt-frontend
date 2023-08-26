import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useThemeContext } from '../contexts/ThemeContext';
import { Paper } from './Paper';
import { Typography } from './Typography';

type Props = { title: string; left?: ReactNode; right?: ReactNode };

export const AppBar = ({ title, left, right }: Props) => {
  const borderBottomColor = useThemeContext(({ color }) => color.border.appBar);

  return (
    <Paper style={{ ...styles.container, borderBottomColor }}>
      <View style={styles.left}>{left}</View>
      <View>
        <Typography style={styles.title}>{title}</Typography>
      </View>
      <View style={styles.right}>{right}</View>
    </Paper>
  );
};

const sideStyle: ViewStyle = { width: 60, display: 'flex', alignItems: 'center', flexDirection: 'row' };
const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  left: { ...sideStyle, justifyContent: 'flex-start', paddingLeft: 13 },
  right: { ...sideStyle, justifyContent: 'flex-end', paddingRight: 17 },

  title: { fontSize: 17 },
});
