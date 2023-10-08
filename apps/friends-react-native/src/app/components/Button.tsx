import { StyleSheet, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';

import { useThemeContext } from '../contexts/ThemeContext';
import { Typography } from './Typography';

type Props = Omit<TouchableOpacityProps, 'style' | 'children'> & {
  style?: ViewStyle;
  color: 'primary' | 'gray';
  children: string;
};

export const Button = ({ color, children, style = {}, ...props }: Props) => {
  const buttonColor = useThemeContext((data) => data.color.button.outlined[color]);

  return (
    <TouchableOpacity style={{ ...styles.button, ...style, borderColor: buttonColor }} {...props}>
      <Typography style={{ ...styles.text, color: buttonColor }}>{children}</Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 26,
    borderRadius: 3,
    display: 'flex',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderStyle: 'solid',
  },

  text: {
    fontSize: 12,
    textAlign: 'center',
  },
});
