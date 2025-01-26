import { ACCESS_TOKEN_KEY } from "@/clients/HttpClient";
import { cookieRepository } from "@/repositories/CookieRepository";

type CookieService = {
  get: (name: string, defaultValue: string) => string | undefined;
  getAccessToken: () => string | undefined;
};

export const cookieService: CookieService = {
  get: (name: string, defaultValue?: string) => {
    return cookieRepository.get(name, defaultValue);
  },
  getAccessToken: () => {
    return cookieRepository.get(ACCESS_TOKEN_KEY);
  },
};
