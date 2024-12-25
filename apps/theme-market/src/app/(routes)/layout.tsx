import "@/app/_styles/reset.css";
import "@/app/_styles/palette.css";
import "@/app/_styles/theme.css";
import "@/app/_styles/font.css";

import type { Metadata } from "next";
import { ReactNode } from "react";

import styles from "./index.module.css";
import { cookieService } from "@/services/CookieService";
import { ThemeStoreProvider } from "@/app/_providers/ThemeProvider";

export const metadata: Metadata = {
  title: "SNUTT 테마 마켓",
};

interface Props {
  children: ReactNode;
  bottomsheet: ReactNode;
}

export default async function RootLayout({ children }: Props) {
  const themeMode = cookieService.get("theme", "light");

  return (
    <html lang="ko" data-theme={themeMode}>
      <body className={styles.layout}>
        <ThemeStoreProvider>{children}</ThemeStoreProvider>
      </body>
    </html>
  );
}
