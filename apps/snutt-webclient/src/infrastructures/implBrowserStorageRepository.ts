import { type getTimetableViewService } from '@/usecases/timetableViewService';
import { type getTokenService } from '@/usecases/tokenService';

const storageKey = {
  snuttToken: 'snutt_token',
  timetableDisplayMode: 'timetable_display_mode',
};

type GetTokenServiceParams = Parameters<typeof getTokenService>[0];
type GetTimetableViewServiceParams = Parameters<typeof getTimetableViewService>[0];

export const implTokenLocalStorageRepository = (): GetTokenServiceParams['persistStorageRepository'] => {
  return {
    getToken: () => localStorage.getItem(storageKey.snuttToken),
    saveToken: (token) => localStorage.setItem(storageKey.snuttToken, token),
    clearToken: () => localStorage.removeItem(storageKey.snuttToken),
  };
};

export const implTokenSessionStorageRepository = (): GetTokenServiceParams['temporaryStorageRepository'] => {
  return {
    getToken: () => sessionStorage.getItem(storageKey.snuttToken),
    saveToken: (token) => sessionStorage.setItem(storageKey.snuttToken, token),
    clearToken: () => sessionStorage.removeItem(storageKey.snuttToken),
  };
};

export const implTimetableLocalStorageRepository = (): GetTimetableViewServiceParams['persistStorageRepository'] => {
  return {
    getDisplayMode: () => {
      const item = localStorage.getItem(storageKey.timetableDisplayMode);
      if (item === 'full' || item === 'real') return item;
      return null;
    },
    setDisplayMode: (mode) => localStorage.setItem(storageKey.timetableDisplayMode, mode),
  };
};
