import { type StorageClient } from '@/clients/StorageClient';

export const createSessionStorageClient = (): StorageClient => ({
  get: (key) => sessionStorage.getItem(key),
  set: (key, value) => sessionStorage.setItem(key, value),
  remove: (key) => sessionStorage.removeItem(key),
});
