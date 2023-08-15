import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

type Props = {
  value: string | undefined;
  onChange: (value: string) => void;
  style?: { marginTop?: number };
  placeholder?: string;
};

export const Input = ({ value, onChange, style = {}, placeholder }: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{ ...styles.input, borderColor: isFocused ? '#00b8b0' : '#dadada', ...style }}
      value={value}
      onChange={(e) => onChange(e.nativeEvent.text)}
      placeholder={placeholder}
    />
  );
};

const styles = StyleSheet.create({
  input: { borderBottomWidth: 1, paddingBottom: 7, fontSize: 14, color: '#0e0e0e' },
});
