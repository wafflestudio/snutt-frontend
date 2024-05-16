import { createContext, type PropsWithChildren, useCallback, useContext, useRef, useState } from 'react';
import styled from 'styled-components';

import useOnClickOutside from '@/hooks/useOnClickOutside';

type Context = { show: boolean };
const context = createContext<Context | null>(null);
const Provider = context.Provider;
export const usePopoverContext = () => {
  const value = useContext(context);

  if (value === null) throw new Error('provider not provided');

  return value;
};

export const Popover = ({
  children,
  ...props
}: PropsWithChildren<{
  className?: string;
}>) => {
  const [show, setShow] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    ref,
    useCallback(() => setShow(false), []),
  );

  return (
    <Wrapper ref={ref} onClick={() => setShow((s) => !s)} {...props}>
      <Provider value={{ show }}>{children}</Provider>
    </Wrapper>
  );
};

const Pop = ({ children, ...props }: PropsWithChildren<{ className?: string }>) => {
  const { show } = usePopoverContext();

  if (!show) return null;

  return (
    <PopoverWrapper onClick={(e) => e.stopPropagation()} {...props}>
      {children}
    </PopoverWrapper>
  );
};

Popover.Pop = Pop;

const Wrapper = styled.div`
  position: relative;
`;

const PopoverWrapper = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  background-color: #fff;
  z-index: 9;
`;
