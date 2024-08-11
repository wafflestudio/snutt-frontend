import "@/app/_styles/reset.css";
import "@/app/_styles/palette.css";
import "@/app/_styles/theme.css";

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ReactNode } from "react";

import styles from "./index.module.css";

export const metadata: Metadata = {
  title: "SNUTT 테마 마켓",
};

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  const theme = cookies().get("theme")?.value ?? "light";

  return (
    <html lang="ko" data-theme={theme}>
      <body className={styles.layout}>{children}</body>
    </html>
  );
}
