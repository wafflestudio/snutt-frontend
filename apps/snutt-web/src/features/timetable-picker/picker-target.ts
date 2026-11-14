/**
 * timetable-picker 메시지 전송 대상.
 * React Native WebView 를 먼저 확인하고, 없으면 window.opener 를 쓴다.
 * 레거시 snutt-webclient 의 sendTimetableToOpener 계약을 유지한다.
 */
import type { PickerMessage } from './picker-message';

/** React Native WebView 브리지 전역 타입 */
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

/** 메시지를 보낼 수 있는 대상 */
export type PickerTarget =
  { type: 'rn'; bridge: NonNullable<Window['ReactNativeWebView']> } | { type: 'opener'; window: Window };

/**
 * 현재 window 에서 메시지를 보낼 대상을 찾는다.
 * RN WebView 브리지가 있으면 우선, 아니면 열린(closed=false) opener.
 * 둘 다 없으면 null.
 */
export const resolvePickerTarget = (win: typeof window): PickerTarget | null => {
  if (win.ReactNativeWebView) return { type: 'rn', bridge: win.ReactNativeWebView };
  const opener = win.opener as Window | null;
  if (opener && !opener.closed) return { type: 'opener', window: opener };
  return null;
};

/**
 * 허용 목록을 재검사한 뒤 메시지를 전달한다.
 * 허용되지 않은 targetOrigin 으로는 절대 전송하지 않는다 (호출부 검증 누락 대비).
 *
 * - RN 브리지: JSON 으로 직렬화해 postMessage
 * - opener: postMessage(message, targetOrigin) 으로 전송
 */
export const sendPickerMessage = (
  target: PickerTarget,
  message: PickerMessage,
  targetOrigin: string,
  allowedOrigins: readonly string[],
): void => {
  if (!allowedOrigins.includes(targetOrigin)) return;
  if (target.type === 'rn') {
    target.bridge.postMessage(JSON.stringify(message));
  } else {
    target.window.postMessage(message, targetOrigin);
  }
};
