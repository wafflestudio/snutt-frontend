import { type HttpClient } from '@/clients/HttpClient';

type Url = string;
type Config = { params: URLSearchParams };

export const createFetchClient = (
  options: Partial<{ baseURL: string; headers: { [key: string]: string } }> = {},
): HttpClient => {
  const baseURL = options.baseURL ?? '';
  const headers = options.headers ?? {};

  return {
    async get<D = unknown>(url: Url, config?: Partial<Config>) {
      const fetchUrl = `${baseURL}${url}${paramsToString(config?.params)}`;
      const fetchHeaders = { ...headers };
      const response = await fetch(fetchUrl, { headers: fetchHeaders, method: 'GET' });
      const responseBody = await response.json().catch(() => null);

      if (response.ok) {
        return { data: responseBody as D };
      } else {
        throw responseBody;
      }
    },

    async post<D = unknown, B = unknown>(url: Url, body?: B, config?: Partial<Config>) {
      const fetchUrl = `${baseURL}${url}${paramsToString(config?.params)}`;
      const fetchHeaders = { 'content-type': 'application/json;charset=UTF-8', ...headers };
      const response = await fetch(fetchUrl, { headers: fetchHeaders, method: 'POST', body: JSON.stringify(body) });
      const responseBody = await response.json().catch(() => null);

      if (response.ok) {
        return { data: responseBody as D };
      } else {
        throw responseBody;
      }
    },

    async put<D = unknown, B = unknown>(url: Url, body?: B, config?: Partial<Config>) {
      const fetchUrl = `${baseURL}${url}${paramsToString(config?.params)}`;
      const fetchHeaders = { 'content-type': 'application/json;charset=UTF-8', ...headers };
      const response = await fetch(fetchUrl, { headers: fetchHeaders, method: 'PUT', body: JSON.stringify(body) });
      const responseBody = await response.json().catch(() => null);

      if (response.ok) {
        return { data: responseBody as D };
      } else {
        throw responseBody;
      }
    },

    async delete<D = unknown>(url: Url, config?: Partial<Config>) {
      const fetchUrl = `${baseURL}${url}${paramsToString(config?.params)}`;
      const fetchHeaders = { ...headers };
      const response = await fetch(fetchUrl, { headers: fetchHeaders, method: 'DELETE' });
      const responseBody = await response.json().catch(() => null);

      if (response.ok) {
        return { data: responseBody as D };
      } else {
        throw responseBody;
      }
    },
  };
};

const paramsToString = (params?: URLSearchParams) => (params ? `?${params}` : '');
