import { type StorageRepository } from '@/repositories/storageRepository';

export type TokenService = {
  getToken(): string | null;
  saveToken(token: string, persist: boolean): void;
  clearToken(): void;
};

export const getTokenService = ({ storageRepository }: { storageRepository: StorageRepository }): TokenService => {
  return {
    getToken: () => storageRepository.get('snutt_token', false) ?? storageRepository.get('snutt_token', true),
    saveToken: (token, persist) => storageRepository.set('snutt_token', token, persist),
    clearToken: () => {
      storageRepository.remove('snutt_token', false);
      storageRepository.remove('snutt_token', true);
    },
  };
};
