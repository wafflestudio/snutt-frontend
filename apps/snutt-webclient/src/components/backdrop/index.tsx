import type { HTMLProps } from 'react';
import styled from 'styled-components';

interface Props extends HTMLProps<HTMLDivElement> {
  as?: never;
  visible?: boolean;
}

export const Backdrop = ({ children, visible = true, ...props }: Props) => {
  return (
    <Wrapper $visible={visible} {...props}>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ $visible: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.2);

  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  touch-action: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
`;
