import { User } from "@/entities/User";
import { authRepositry } from "@/repositories/AuthRepository";

type AuthService = {
  me: (accessToken?: string) => Promise<User>;
};

export const authService: AuthService = {
  me: async (accessToken?: string) => {
    return await authRepositry.me(accessToken);
  },
};
