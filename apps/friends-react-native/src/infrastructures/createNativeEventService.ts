import { NativeEventEmitter, NativeModules } from 'react-native';
import { NativeEvent, NativeEventService } from '../usecases/nativeEventService';

export const createNativeEventService = (): NativeEventService => {
  const eventEmitter = new NativeEventEmitter(NativeModules.RNEventEmitter);

  return {
    getEventEmitter: () => eventEmitter,
    sendEventToNative: (event: NativeEvent) => {
      NativeModules.RNEventEmitter.sendEventToNative(event.type, event.parameters);
    },
  };
};
