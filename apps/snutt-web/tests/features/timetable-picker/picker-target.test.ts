// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import type { PickerMessage } from '@/features/timetable-picker/picker-message';
import { resolvePickerTarget, sendPickerMessage } from '@/features/timetable-picker/picker-target';

const ALLOWED = ['https://host.test'];

const dummyMessage: PickerMessage = {
  type: 'SNUTT_TIMETABLE_SELECTED',
  payload: { title: 'test', year: 2026, semester: 3, lecture_list: [] },
};

// window 에 ReactNativeWebView 가 있는지 에 따라 target 이 달라진다
const withRnBridge = (fn: () => void) => {
  const original = (window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView;
  const bridge = { postMessage: vi.fn() };
  (window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView = bridge;
  try {
    fn();
  } finally {
    (window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView = original;
  }
  return bridge;
};

describe('resolvePickerTarget', () => {
  it('ReactNativeWebView 가 있으면 rn 타입을 반환한다', () => {
    withRnBridge(() => {
      const target = resolvePickerTarget(window);
      expect(target?.type).toBe('rn');
    });
  });

  it('opener 가 있고 열려 있으면 opener 타입을 반환한다', () => {
    const fakeOpener = { closed: false, postMessage: vi.fn() };
    Object.defineProperty(window, 'opener', { value: fakeOpener, configurable: true });
    const target = resolvePickerTarget(window);
    expect(target?.type).toBe('opener');
    Object.defineProperty(window, 'opener', { value: null, configurable: true });
  });

  it('opener 가 닫혀 있으면 null 을 반환한다', () => {
    const fakeOpener = { closed: true, postMessage: vi.fn() };
    Object.defineProperty(window, 'opener', { value: fakeOpener, configurable: true });
    const target = resolvePickerTarget(window);
    expect(target).toBeNull();
    Object.defineProperty(window, 'opener', { value: null, configurable: true });
  });

  it('opener 도 RN 브리지도 없으면 null 을 반환한다', () => {
    Object.defineProperty(window, 'opener', { value: null, configurable: true });
    const target = resolvePickerTarget(window);
    expect(target).toBeNull();
  });
});

describe('sendPickerMessage', () => {
  it('RN 브리지에는 JSON.stringify 로 보낸다', () => {
    const bridge = { postMessage: vi.fn() };
    sendPickerMessage({ type: 'rn', bridge }, dummyMessage, 'https://host.test', ALLOWED);
    expect(bridge.postMessage).toHaveBeenCalledWith(JSON.stringify(dummyMessage));
  });

  it('opener 에는 postMessage(message, origin) 으로 보낸다', () => {
    const fakeWindow = { postMessage: vi.fn(), closed: false } as unknown as Window;
    sendPickerMessage({ type: 'opener', window: fakeWindow }, dummyMessage, 'https://host.test', ALLOWED);
    expect(fakeWindow.postMessage).toHaveBeenCalledWith(dummyMessage, 'https://host.test');
  });

  it('허용되지 않은 targetOrigin 으로는 보내지 않는다', () => {
    const bridge = { postMessage: vi.fn() };
    sendPickerMessage({ type: 'rn', bridge }, dummyMessage, 'https://evil.com', ALLOWED);
    expect(bridge.postMessage).not.toHaveBeenCalled();
  });

  it('opener 에도 허용되지 않은 origin 이면 보내지 않는다', () => {
    const fakeWindow = { postMessage: vi.fn(), closed: false } as unknown as Window;
    sendPickerMessage({ type: 'opener', window: fakeWindow }, dummyMessage, 'https://evil.com', ALLOWED);
    expect(fakeWindow.postMessage).not.toHaveBeenCalled();
  });
});
