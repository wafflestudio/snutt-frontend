import { NativeModule } from 'react-native';

declare module 'react-native' {
  interface NativeModulesStatic {
    RNEventEmitter: NativeModule & {
      sendEvent: (name: string, parameters?: Record<string, unknown>) => void;
    };
  }
}

export {};
