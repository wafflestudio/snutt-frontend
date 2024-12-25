import { cookies } from "next/headers";

type CookieRepository = {
  get: (name: string, defaultValue?: string) => string | undefined;
};

export const cookieRepository: CookieRepository = {
  get: (name: string, defaultValue?: string) => {
    return cookies().get(name)?.value || defaultValue;
  },
};
