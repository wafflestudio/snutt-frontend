import "@/app/_styles/reset.css";
import "@/app/_styles/palette.css";
import "@/app/_styles/theme.css";
import "@/app/_styles/font.css";

import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";

import { cookieService } from "@/services/CookieService";
import { authService } from "@/services/AuthService";

import { ThemeStoreProvider } from "@/app/_providers/ThemeProvider";
import { UserStoreProvider } from "../_providers/UserProvider";

import styles from "./index.module.css";

export const metadata: Metadata = {
  title: "SNUTT 테마 마켓",
};

export const viewport: Viewport = {
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  width: "device-width",
};

interface Props {
  children: ReactNode;
  bottomsheet: ReactNode;
}

export default async function RootLayout({ children }: Props) {
  const themeMode = cookieService.get("theme", "light");
  const accessToken = cookieService.getAccessToken();

  const user = await authService.me(accessToken);

  return (
    <html lang="ko" data-theme={themeMode}>
      <body className={styles.layout}>
        <UserStoreProvider user={user} accessToken={accessToken!!}>
          <ThemeStoreProvider>{children}</ThemeStoreProvider>
        </UserStoreProvider>
      </body>
    </html>
  );
}
