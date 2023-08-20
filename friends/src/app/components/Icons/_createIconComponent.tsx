import { FC } from 'react';
import { SvgProps } from 'react-native-svg';

import { useThemeContext } from '../../contexts/ThemeContext';

type Props = Omit<SvgProps, 'style'> & { style?: Partial<{ color: string }> };

export const createIconComponent = (Svg: FC<Props>) => {
  return ({ style, ...props }: Props) => {
    const color = useThemeContext((c) => c.color.text.default);
    return <Svg style={{ color, ...style }} {...props} />;
  };
};
