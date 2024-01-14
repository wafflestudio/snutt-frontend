import { HttpClient } from '@/clients/HttpClient';
import { snakeToCamel } from '@/utils/object';

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
      const data = await response.json().catch(() => null);

      if (response.ok) return snakeToCamel(data);
      else throw data;
    },
    post: async (url, body) => {
      const response = await fetch(baseUrl + url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers,
      });
      const data = await response.json().catch(() => null);

      if (response.ok) return snakeToCamel(data);
      else throw data;
    },
    delete: async (url) => {
      const response = await fetch(baseUrl + url, {
        method: 'delete',
        headers,
      });
      const data = await response.json().catch(() => null);

      if (response.ok) return snakeToCamel(data);
      else throw data;
    },
  };
};
