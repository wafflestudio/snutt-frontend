import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';

import { serviceContext } from '@/contexts/ServiceContext';
import { useGuardContext } from '@/hooks/useGuardContext';

export const ErrorPage = () => {
  const error = useRouteError();

  const { errorService } = useGuardContext(serviceContext);

  useEffect(() => {
    errorService.captureError(new Error(JSON.stringify(error)));
  }, [errorService, error]);

  return <div>Error</div>;
};
