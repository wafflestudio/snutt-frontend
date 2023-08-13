import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';

type Props = Omit<TouchableOpacityProps, 'style' | 'children'> & {
  variant: 'outlined';
  style?: ViewStyle;
  color: 'primary' | 'gray';
  children: string;
};

export const Button = ({ variant, color, children, style = {}, ...props }: Props) => {
  return (
    <TouchableOpacity style={{ ...styles.button, ...variants[variant], ...buttonColors[color], ...style }} {...props}>
      <Text style={{ ...styles.text, ...textColors[color] }}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 26,
    borderRadius: 3,
    display: 'flex',
    justifyContent: 'center',
  },

  text: {
    paddingHorizontal: 8,
    fontSize: 11,
  },
});

const variants = StyleSheet.create({
  outlined: { borderWidth: 1, borderStyle: 'solid' },
});

const buttonColors = StyleSheet.create({
  primary: { borderColor: '#1bd0c8' },
  gray: { borderColor: '#b3b3b3' },
});

const textColors = StyleSheet.create({
  primary: { color: '#1bd0c8' },
  gray: { color: '#b3b3b3' },
});
