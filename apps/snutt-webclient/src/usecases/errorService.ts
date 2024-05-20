export interface ErrorService {
  captureError: (error: Error) => void;
}

export const getErrorService = (args: { errorCaptureClient: { capture: (message: Error) => void } }): ErrorService => {
  return {
    captureError: (error: Error) => args.errorCaptureClient.capture(error),
  };
};
