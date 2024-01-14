import { HttpClient } from '../clients/HttpClient';

export const createFetchClient = (baseUrl: string, token: string, apiKey: string): HttpClient => {
  return {
    get: async (url: string) => {
      const response = await fetch(`${baseUrl}${url}`, {
        headers: { 'x-access-apikey': apiKey, 'x-access-token': token, 'Content-Type': 'application/json' },
      });
      const data = await response.text();

      if (!response.ok) throw JSON.parse(data);
      return JSON.parse(data);
    },

    post: async (url: string, body?: Record<string, unknown>) => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'POST',
        headers: { 'x-access-apikey': apiKey, 'x-access-token': token, 'Content-Type': 'application/json' },
        body: body && JSON.stringify(body),
      });
      const data = await response.text();

      if (!response.ok) throw JSON.parse(data);
      return JSON.parse(data);
    },

    patch: async (url: string, body?: Record<string, unknown>) => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'PATCH',
        headers: { 'x-access-apikey': apiKey, 'x-access-token': token, 'Content-Type': 'application/json' },
        body: body && JSON.stringify(body),
      });
      const data = await response.text();

      if (!response.ok) throw JSON.parse(data);
      return JSON.parse(data);
    },

    delete: async (url: string) => {
      const response = await fetch(`${baseUrl}${url}`, {
        method: 'DELETE',
        headers: { 'x-access-apikey': apiKey, 'x-access-token': token, 'Content-Type': 'application/json' },
      });
      const data = await response.text();

      if (!response.ok) throw JSON.parse(data);
      return JSON.parse(data);
    },
  };
};
