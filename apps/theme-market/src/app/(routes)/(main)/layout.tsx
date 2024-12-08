import "@/app/_styles/reset.css";
import "@/app/_styles/palette.css";
import "@/app/_styles/theme.css";
import "@/app/_styles/font.css";

import type { Metadata } from "next";
import { ReactNode } from "react";

import styles from "./index.module.css";
import { UserStoreProvider } from "@/app/_providers/UserProvider";
import { authService } from "@/services/AuthService";
import { cookieService } from "@/services/CookieService";

export const metadata: Metadata = {
  title: "SNUTT 테마 마켓",
};

interface Props {
  children: ReactNode;
  bottomsheet: ReactNode;
}

export default async function RootLayout({ children, bottomsheet }: Props) {
  const themeMode = cookieService.get("theme", "light");
  const accessToken = cookieService.getAccessToken();

  const user = await authService.me(accessToken);

  return (
    <html lang="ko" data-theme={themeMode}>
      <body className={styles.layout}>
        <UserStoreProvider user={user}>
          {children}
          {bottomsheet}
        </UserStoreProvider>
      </body>
    </html>
  );
}
