import { ApiClient } from '../clients/apiClient';

export const createFetchClient = (baseUrl: string, token: string, apiKey: string): ApiClient => {
  return {
    get: async <T>(url: string) => {
      const response = await fetch(`${baseUrl}${url}`, {
        headers: { 'x-access-apikey': apiKey, 'x-access-token': token, 'Content-Type': 'application/json' },
      });
      const data = await response.text();

      if (!response.ok) throw JSON.parse(data);
      return JSON.parse(data) as T;
    },
  };
};
