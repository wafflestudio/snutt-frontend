import { NativeEventEmitter } from 'react-native';

export type NativeEvent =
  | { type: 'register' | 'deregister'; parameters: { eventType: string } }
  | { type: 'add-friend-kakao'; parameters: { requestToken: string } }
  | { type: 'close-modal' };

export type NativeEventService = {
  getEventEmitter: () => NativeEventEmitter;
  sendEventToNative: (event: NativeEvent) => void;
};
