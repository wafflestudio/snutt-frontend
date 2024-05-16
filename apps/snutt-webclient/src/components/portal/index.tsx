import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  portalRoot?: HTMLElement;
  children: Parameters<typeof createPortal>[0];
}

export const Portal = (props: Props) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const defaultRoot = document.querySelector<HTMLElement>('#__portal');
    setPortalRoot(props.portalRoot ?? defaultRoot);
  }, [props.portalRoot]);

  if (!portalRoot) return null;

  return <>{createPortal(props.children, portalRoot)}</>;
};
