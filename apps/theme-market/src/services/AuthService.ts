import { authRepositry } from "@/repositories/AuthRepository";

import { User } from "@/entities/User";

type AuthService = {
  me: (accessToken?: string) => Promise<User>;
};

export const authService: AuthService = {
  me: async (accessToken?: string) => {
    return await authRepositry.me(accessToken);
  },
};
