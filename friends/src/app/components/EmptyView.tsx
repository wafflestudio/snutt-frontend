import { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import SurprisedCat from '../../../../assets/surprised-cat.png';
import { useThemeContext } from '../contexts/ThemeContext';
import { Typography } from './Typography';

export const EmptyView = ({ title, descriptions }: { title: ReactNode; descriptions: ReactNode[] }) => {
  const { subtitle, caption } = useThemeContext(({ color }) => color.text);
  return (
    <View style={styles.container}>
      <Image source={SurprisedCat} style={styles.image} />
      <Typography style={{ color: subtitle, ...styles.subtitle }}>{title}</Typography>
      {descriptions.map((d, i) => (
        <Typography key={i} style={{ ...styles.description, color: caption }}>
          {d}
        </Typography>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' },
  image: { width: 50, height: 55 },
  subtitle: { fontSize: 14, marginTop: 21, fontWeight: 600, marginBottom: 9 },
  description: { marginTop: 1, fontSize: 11, fontWeight: 600 },
});
