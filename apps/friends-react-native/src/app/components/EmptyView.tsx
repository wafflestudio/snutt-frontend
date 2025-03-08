import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import SurprisedCat from '../assets/images/surprised-cat.svg';
import WaffleCat from '../assets/images/waffle-cat.svg';
import { useThemeContext } from '../contexts/ThemeContext';
import { Typography } from './Typography';

export const EmptyView = ({
  title,
  descriptions,
  size = 'small',
  catType,
  etc,
}: {
  title: ReactNode;
  descriptions?: ReactNode[];
  size?: 'small' | 'big';
  catType?: 'waffle' | 'basic';
  etc?: ReactNode;
}) => {
  const { subtitle, caption } = useThemeContext(({ color }) => color.text);
  const sizeStyle = { small: smallStyle, big: bigStyle }[size];

  return (
    <View style={styles.container}>
      {catType === 'waffle' ? (
        <WaffleCat width={sizeStyle.image.width} height={sizeStyle.image.height} />
      ) : (
        <SurprisedCat width={sizeStyle.image.width} height={sizeStyle.image.height} />
      )}
      <Typography style={{ color: subtitle, ...styles.subtitle, ...sizeStyle.subtitle }}>{title}</Typography>
      {descriptions?.map((d, i) => (
        <Typography key={i} style={{ ...styles.description, color: caption, ...sizeStyle.description }}>
          {d}
        </Typography>
      ))}
      {etc}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontWeight: '600' },
  description: { fontWeight: '600' },
});

const smallStyle = StyleSheet.create({
  image: { width: 50, height: 55 },
  subtitle: { fontSize: 14, marginTop: 21, marginBottom: 9 },
  description: { fontSize: 11, marginTop: 1 },
});

const bigStyle = StyleSheet.create({
  image: { width: 62, height: 68 },
  subtitle: { fontSize: 16, marginTop: 30, marginBottom: 16 },
  description: { fontSize: 12, marginTop: 2 },
});
