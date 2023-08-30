import { StyleSheet, Text, TextProps } from 'react-native';

import { useTextContext } from '../contexts/TextContext';
import { useThemeContext } from '../contexts/ThemeContext';
import { ThemeValues } from '../styles/theme';

type Props = Omit<TextProps, 'style'> & {
  style?: Record<string, unknown>;
  variant?: keyof ThemeValues['color']['text'];
};

export const Typography = ({ children, style, variant = 'default', ...props }: Props) => {
  const color = useThemeContext((data) => data.color.text[variant]);
  const { allowFontScaling } = useTextContext();

  return (
    <Text allowFontScaling={allowFontScaling} {...props} style={{ color, ...styles.text, ...style }}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: '--apple-system',
  },
});
