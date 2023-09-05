declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<
    Omit<SvgProps, 'style'> & { style?: Partial<{ color: string; width: number; height: number }> }
  >;
  export default content;
}
