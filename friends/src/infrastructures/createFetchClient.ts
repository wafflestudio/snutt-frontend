import { ApiClient } from '../clients/apiClient';

export const createFetchClient = (
  baseUrl: string,
  token: string,
  apiKey: string,
): ApiClient => {
  return {
    get: async <T>(url: string) => {
      const response = await fetch(`${baseUrl}${url}`, {
        headers: { 'x-access-apikey': apiKey, 'x-access-token': token },
      });
      const data = await response.json();
      if (!response.ok) throw data;
      return data as T;
    },
  };
};
