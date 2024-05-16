import { useMemo, useState } from 'react';

export const useErrorDialog = () => {
  const [message, setMessage] = useState<string | null>(null);

  return useMemo(
    () => ({
      open: (m: string) => setMessage(m),
      isOpen: message !== null,
      onClose: () => setMessage(null),
      message,
    }),
    [message],
  );
};
