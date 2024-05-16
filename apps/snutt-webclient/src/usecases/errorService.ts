import type { ErrorRepository } from '@/repositories/errorRepository';

export interface ErrorService {
  getErrorMessage: (errorCode: number, useDefaultMessage?: boolean) => string;
  captureError: (error: Error) => void;
}

export const getErrorService = (args: {
  repositories: [ErrorRepository];
  errorCaptureClient: { capture: (message: Error) => void };
}): ErrorService => {
  const [errorRepo] = args.repositories;

  return {
    getErrorMessage: (errorCode: number, useDefaultMessage = true) =>
      errorRepo.getErrorMessage({ errorCode, useDefaultMessage }),
    captureError: (error: Error) => args.errorCaptureClient.capture(error),
  };
};
