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

    post: async <T>(url: string, body?: Record<string, unknown>) => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'POST',
        headers: { 'x-access-apikey': apiKey, 'x-access-token': token, 'Content-Type': 'application/json' },
        body: body && JSON.stringify(body),
      });
      const data = await response.text();

      if (!response.ok) throw JSON.parse(data);
      return JSON.parse(data) as T;
    },
  };
};
