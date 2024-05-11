import { NativeModule } from 'react-native';

declare module 'react-native' {
  interface NativeModulesStatic {
    RNEventEmitter: NativeModule & {
      sendEvent: (params: { name: string; parameters?: Record<string, unknown> }) => void;
    };
  }
}

export {};
