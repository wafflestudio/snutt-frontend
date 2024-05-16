import { type StorageKey } from '@/entities/storage';

export interface StorageClient {
  get(key: StorageKey): string | null;
  set(key: StorageKey, value: string): void;
  remove(key: StorageKey): void;
}
