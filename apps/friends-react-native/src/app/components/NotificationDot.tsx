import { StyleSheet, View } from 'react-native';

import { COLORS } from '../styles/colors';

type Props = { style?: { position?: 'absolute'; top?: number; left?: number; right?: number; bottom?: number } };

export const NotificationDot = ({ style }: Props) => {
  return <View style={[style, styles.dot]} />;
};

const styles = StyleSheet.create({ dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.red } });
