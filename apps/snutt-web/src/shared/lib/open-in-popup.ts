import type { MouseEvent } from 'react';

// 예전 웹(snutt-webclient)의 강의계획서 팝업과 같은 크기
const POPUP_FEATURES = 'popup,width=1024,height=800,noopener,noreferrer';

/**
 * 링크를 새 탭 대신 작은 창으로 연다 (강의계획서). `<a href target="_blank">` 의 onClick 에 붙인다.
 * 그냥 누를 때만 창으로 열고, Cmd/Ctrl/Shift 를 누르거나 가운데 버튼으로 누르면 브라우저 기본 동작(새 탭 등)에 맡긴다.
 */
export const openInPopup = (event: MouseEvent<HTMLAnchorElement>) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  window.open(event.currentTarget.href, '_blank', POPUP_FEATURES);
};
