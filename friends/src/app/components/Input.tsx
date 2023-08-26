import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { useTextContext } from '../contexts/TextContext';
import { useThemeContext } from '../contexts/ThemeContext';

type Props = {
  value: string | undefined;
  onChange: (value: string) => void;
  style?: { marginTop?: number };
  placeholder?: string;
  autoFocus?: boolean;
};

export const Input = ({ value, onChange, style = {}, placeholder, autoFocus = false }: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const textColors = useThemeContext((data) => data.color.text);
  const { allowFontScaling } = useTextContext();
  const inputDefaultBorder = useThemeContext((data) => data.color.input.default.border);
  const inputFocusedBorder = useThemeContext((data) => data.color.input.focused.border);
  const inputPlaceholder = useThemeContext((data) => data.color.input.placeholder);

  return (
    <TextInput
      allowFontScaling={allowFontScaling}
      autoFocus={autoFocus}
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
      placeholderTextColor={inputPlaceholder}
    />
  );
};

const styles = StyleSheet.create({
  input: { borderBottomWidth: 1, paddingBottom: 7, fontSize: 14 },
});
