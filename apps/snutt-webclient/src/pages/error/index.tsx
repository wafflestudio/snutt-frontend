import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';

import { type ErrorService } from '@/usecases/errorService';

export const ErrorPage = ({ errorService }: { errorService: ErrorService }) => {
  const error = useRouteError();

  useEffect(() => {
    errorService.captureError(new Error(JSON.stringify(error)));
  }, [errorService, error]);

  return <div>Error</div>;
};
