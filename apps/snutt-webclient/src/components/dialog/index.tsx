import { type PropsWithChildren, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Backdrop } from '@/components/backdrop';
import { Portal } from '@/components/portal';

interface Props {
  className?: string;
  open?: boolean;
  onClose?: () => void;

  /**
   * true 이면 close 되었을 때도 content 를 마운트된 상태로 유지한다. default: false
   */
  keepMountOnClose?: boolean;

  /**
   * esc 키 눌렀을 때 닫힘 여부
   */
  closeOnEsc?: boolean;
}

export const Dialog = ({
  children,
  open = true,
  onClose = () => null,
  className,
  keepMountOnClose = false,
  closeOnEsc = true,
}: PropsWithChildren<Props>) => {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    if (open) setMount(true);
    else setTimeout(() => setMount(false), 200);
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();

    document.addEventListener('keyup', handler);
    return () => document.removeEventListener('keyup', handler);
  }, [open, onClose, closeOnEsc]);

  const showChildren = open || mount;

  return (
    <Portal>
      <Dimmer
        visible={open}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <Container className={className} onClick={(e) => e.stopPropagation()}>
          {(showChildren || keepMountOnClose) && children}
        </Container>
      </Dimmer>
    </Portal>
  );
};

const Title = styled.div`
  padding: 16px 24px;
  font-size: 1.25rem;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  gap: 4px;
`;

const Content = styled.div`
  padding: 0 24px 20px;
`;

const ContentText = styled.div``;

const Dimmer = styled(Backdrop)`
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s;
`;

const Container = styled.div`
  border-radius: 4px;
  box-shadow:
    0px 11px 15px -7px rgba(0, 0, 0, 0.2),
    0px 24px 38px 3px rgba(0, 0, 0, 0.14),
    0px 9px 46px 8px rgba(0, 0, 0, 0.12);
  margin: 32px;
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: calc(100%-64px);
  overflow-y: auto;
  max-width: 600px;
  background-color: #fff;
`;

Dialog.Title = Title;
Dialog.Actions = Actions;
Dialog.Content = Content;
Dialog.ContentText = ContentText;
