import { type ButtonHTMLAttributes, forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { Loader } from '@/components/loader';

type Variant = 'contained' | 'outlined' | 'text';
type Size = 'big' | 'small';
type Color = 'mint' | 'blue' | 'black' | 'red' | 'gray';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  color?: Color;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ children, loading = false, variant = 'contained', size = 'big', color = 'mint', ...props }, ref) => {
    const Component = { contained: Contained, outlined: Outlined, text: Text }[variant];

    return (
      <Component $size={size} $color={color} ref={ref} {...props}>
        <ButtonText $loading={loading}>{children}</ButtonText>
        {loading && <ButtonLoader $size={size} />}
      </Component>
    );
  },
);

const buttonColor = { mint: '#1bd0c9', blue: '#1414c3', black: '#323232', red: '#ec3030', gray: '#9a9a9a' } as const;

const commonStyle = css`
  position: relative;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.8;
  transition:
    opacity 0.2s,
    background-color 0.1s;
  line-height: 100%;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    cursor: default;
    opacity: 0.8;
  }
`;

const bigSize = css`
  padding: 0 24px;
  height: 36px;
  border-radius: 18px;
`;
const smallSize = css`
  padding: 0 12px;
  height: 24px;
  border-radius: 12px;
`;

const Contained = styled.button<{ $size: Size; $color: Color }>`
  ${commonStyle}
  ${({ $size }) => ({ big: bigSize, small: smallSize })[$size]}
  border: none;
  color: #fff;
  background-color: ${({ $color }) => buttonColor[$color]};

  &:disabled {
    background-color: #ddd;
  }
`;

const Outlined = styled.button<{ $size: Size; $color: Color }>`
  ${commonStyle}
  ${({ $size }) => ({ big: bigSize, small: smallSize })[$size]}
  border: 1px solid ${({ $color }) => buttonColor[$color]};
  color: ${({ $color }) => buttonColor[$color]};
  background-color: transparent;
  transition:
    background-color 0.1s,
    opacity 0.2s;

  &:hover {
    background-color: ${({ $color }) => `${buttonColor[$color]}10`};
  }
`;

const Text = styled.button<{ $size: Size; $color: string }>`
  ${commonStyle}
  ${({ $size }) => ({ big: bigSize, small: smallSize })[$size]}
`;

const ButtonText = styled.span<{ $loading: boolean }>`
  ${({ $loading }) =>
    $loading &&
    css`
      color: transparent;
    `}
`;

const ButtonLoader = styled(Loader)<{ $size: Size }>`
  position: absolute;
  ${({ $size }) => {
    const size = { big: 20, small: 14 }[$size];
    return css`
      width: ${size}px;
      height: ${size}px;
      top: calc(50% - ${size / 2}px);
      left: calc(50% - ${size / 2}px);
    `;
  }}
`;
