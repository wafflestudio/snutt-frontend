import { HttpClient } from '@/clients/HttpClient';

export const createFetchClient = ({
  baseUrl,
  headers,
}: {
  baseUrl: string;
  headers: Record<string, string>;
}): HttpClient => {
  return {
    get: async (url) => {
      const response = await fetch(baseUrl + url, { headers });
      const data = await response.json();
      if (response.ok) return data;
      else throw data;
    },
  };
};
