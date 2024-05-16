import { type StorageClient } from '@/clients/StorageClient';
import type { StorageKey } from '@/entities/storage';

export interface StorageRepository {
  get(key: StorageKey, persist: boolean): string | null;
  set(key: StorageKey, value: string, persist: boolean): void;
  remove(key: StorageKey, persist: boolean): void;
}

type Deps = { clients: [StorageClient, StorageClient] };
export const getStorageRepository = ({ clients }: Deps): StorageRepository => {
  const [persistStorage, temporaryStorage] = clients;
  return {
    get: (key, persist) => (persist ? persistStorage.get(key) : temporaryStorage.get(key)),
    set: (key, value, persist) => (persist ? persistStorage.set(key, value) : temporaryStorage.set(key, value)),
    remove: (key, persist) => (persist ? persistStorage.remove(key) : temporaryStorage.remove(key)),
  };
};
