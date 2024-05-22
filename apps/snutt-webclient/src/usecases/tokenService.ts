export type TokenService = {
  getToken(): string | null;
  saveToken(token: string, persist: boolean): void;
  clearToken(): void;
};

type TokenRepository = {
  getToken: () => string | null;
  saveToken: (token: string) => void;
  clearToken: () => void;
};

export const getTokenService = ({
  temporaryStorageRepository,
  persistStorageRepository,
}: {
  temporaryStorageRepository: TokenRepository;
  persistStorageRepository: TokenRepository;
}): TokenService => {
  return {
    getToken: () => temporaryStorageRepository.getToken() ?? persistStorageRepository.getToken(),
    saveToken: (token, persist) => (persist ? persistStorageRepository : temporaryStorageRepository).saveToken(token),
    clearToken: () => {
      temporaryStorageRepository.clearToken();
      persistStorageRepository.clearToken();
    },
  };
};
