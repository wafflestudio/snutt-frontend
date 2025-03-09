import { FC } from 'react';
import { SvgProps } from 'react-native-svg';

import { useThemeContext } from '../../contexts/ThemeContext';
import { ThemeValues } from '../../styles/theme';

type Props = Omit<SvgProps, 'style'> & {
  style?: Partial<{ color: string; marginTop: number }>;
  variant?: keyof ThemeValues['color']['text'];
};

export const createIconComponent = (Svg: FC<Props>) => {
  return ({ style, variant = 'default', ...props }: Props) => {
    const color = useThemeContext((c) => c.color.text[variant]);
    return <Svg style={{ color, ...style }} {...props} />;
  };
};
