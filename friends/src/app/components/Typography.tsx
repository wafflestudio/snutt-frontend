import { Text, TextProps } from 'react-native';

import { useThemeContext } from '../contexts/ThemeContext';
import { ThemeValues } from '../styles/theme';

type Props = Omit<TextProps, 'style'> & {
  style?: Record<string, unknown>;
  variant?: keyof ThemeValues['color']['text'];
};

export const Typography = ({ children, style, variant = 'default', ...props }: Props) => {
  const color = useThemeContext((data) => data.color.text[variant]);

  return (
    <Text {...props} style={{ color, ...style }}>
      {children}
    </Text>
  );
};
