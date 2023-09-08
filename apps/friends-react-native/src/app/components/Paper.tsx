import { View, ViewProps } from 'react-native';

import { useThemeContext } from '../contexts/ThemeContext';

export const Paper = ({
  children,
  style,
  ...props
}: Omit<ViewProps, 'style'> & { style?: Record<string, unknown> }) => {
  const {
    color: {
      bg: { default: backgroundColor },
    },
  } = useThemeContext();

  return (
    <View style={{ backgroundColor, ...style }} {...props}>
      {children}
    </View>
  );
};
