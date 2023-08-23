import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { useThemeContext } from '../contexts/ThemeContext';

type Props = {
  value: string | undefined;
  onChange: (value: string) => void;
  style?: { marginTop?: number };
  placeholder?: string;
};

export const Input = ({ value, onChange, style = {}, placeholder }: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const textColors = useThemeContext((data) => data.color.text);
  const inputDefaultBorder = useThemeContext((data) => data.color.input.default.border);
  const inputFocusedBorder = useThemeContext((data) => data.color.input.focused.border);

  return (
    <TextInput
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        ...styles.input,
        color: textColors.default,
        borderColor: isFocused ? inputFocusedBorder : inputDefaultBorder,
        ...style,
      }}
      value={value}
      onChange={(e) => onChange(e.nativeEvent.text)}
      placeholder={placeholder}
      placeholderTextColor={textColors.description}
    />
  );
};

const styles = StyleSheet.create({
  input: { borderBottomWidth: 1, paddingBottom: 7, fontSize: 14 },
});
